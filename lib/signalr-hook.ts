/**
 * SignalR hook for real-time live feed updates
 */

import { useEffect, useRef, useState } from "react";
import * as signalR from "@microsoft/signalr";
import { useQueryClient } from "@tanstack/react-query";

// SignalR hub URL - adjust based on your backend configuration
const getSignalRUrl = () => {
  // Allow explicit SignalR hub URL override
  if (process.env.NEXT_PUBLIC_SIGNALR_HUB_URL) {
    return process.env.NEXT_PUBLIC_SIGNALR_HUB_URL;
  }
  
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5001";
  // Remove /api/v1 if present, and add /hubs/livefeed
  // Common SignalR hub paths: /hubs/livefeed, /hubs/notifications, /livefeed
  const baseUrl = apiBaseUrl.replace(/\/api\/v1$/, "");
  const hubPath = process.env.NEXT_PUBLIC_SIGNALR_HUB_PATH || "/hubs/livefeed";
  return `${baseUrl}${hubPath}`;
};

// Actual SignalR event payload structure from backend
type TagReadEvent = {
  tagId?: string;
  TagId?: string; // Backend uses PascalCase
  assetNumber?: string;
  AssetNumber?: string; // Backend uses PascalCase
  assetName?: string;
  AssetName?: string; // Backend uses PascalCase
  gate?: string;
  Gate?: string; // Backend uses PascalCase
  location?: string;
  Location?: string; // Backend uses PascalCase
  timestamp?: string;
  Timestamp?: string; // Backend uses PascalCase
  plant?: string;
  Plant?: string; // Backend uses PascalCase
  direction?: number; // 1 or 2
  Direction?: number; // Backend uses PascalCase, 1 or 2
  // Optional fields that might be present
  assetId?: number;
  epc?: string;
  readerId?: string;
  readerName?: string;
};

export function useSignalRLiveFeed() {
  const connectionRef = useRef<signalR.HubConnection | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    const connection = new signalR.HubConnectionBuilder()
      .withUrl(getSignalRUrl())
      .withAutomaticReconnect({
        nextRetryDelayInMilliseconds: (retryContext) => {
          // Exponential backoff: 0s, 2s, 10s, 30s, then 30s intervals
          if (retryContext.previousRetryCount === 0) return 0;
          if (retryContext.previousRetryCount === 1) return 2000;
          if (retryContext.previousRetryCount === 2) return 10000;
          return 30000;
        },
      })
      .build();

    connectionRef.current = connection;

    // Handle connection state changes
    connection.onclose(() => {
      setIsConnected(false);
      console.log("[SignalR] Connection closed");
    });

    connection.onreconnecting(() => {
      setIsConnected(false);
      console.log("[SignalR] Reconnecting...");
    });

    connection.onreconnected(() => {
      setIsConnected(true);
      setError(null);
      console.log("[SignalR] Reconnected");
    });

    // Listen for TagRead events
    // Also try common alternative event names: "TagRead", "OnTagRead", "ReceiveTagRead"
    const eventHandlers = ["TagRead", "OnTagRead", "ReceiveTagRead"];
    
    eventHandlers.forEach((eventName) => {
      connection.on(eventName, (event: TagReadEvent | unknown) => {
        console.log(`[SignalR] ${eventName} event received:`, event);
        
        try {
          // Handle the actual event payload structure
          const eventData = event as TagReadEvent;
          
          // Handle both camelCase and PascalCase field names from backend
          const tagId = eventData.tagId || eventData.TagId;
          const assetNumber = eventData.assetNumber || eventData.AssetNumber;
          
          // Validate that we have at least a tagId or assetNumber
          if (!tagId && !eventData.epc && !assetNumber) {
            console.warn(`[SignalR] ${eventName} event missing required fields:`, event);
            return;
          }
          const assetName = eventData.assetName || eventData.AssetName;
          const gate = eventData.gate || eventData.Gate;
          const location = eventData.location || eventData.Location;
          const timestamp = eventData.timestamp || eventData.Timestamp;
          const plant = eventData.plant || eventData.Plant;
          const direction = eventData.direction ?? eventData.Direction;
          
          // Map numeric direction (1 or 2) to string
          // Typically: 1 = "in", 2 = "out" (adjust if your backend uses different mapping)
          const directionString = direction === 1 ? "in" : direction === 2 ? "out" : "in";
          
          // Directly transform to LiveFeedRow format
          const liveFeedRow = {
            assetId: eventData.assetId ? String(eventData.assetId) : null,
            lastSeenEpc: tagId || eventData.epc || null,
            lastSeenAt: timestamp || new Date().toISOString(),
            lastSeenReaderId: eventData.readerId || null,
            lastSeenGate: gate || null,
            lastSeenDirection: directionString,
            assetName: assetName || null,
            equipment: assetNumber || null,
            assetTag: assetNumber || null,
            location: location || null,
            category: plant || null, // Use plant as category
            status: null,
          };

          // Update React Query cache
          queryClient.setQueryData<typeof liveFeedRow[]>(
            ["live-feed"],
            (oldData) => {
              if (!oldData) {
                console.log("[SignalR] First entry, creating new array");
                return [liveFeedRow];
              }

              // Check if this exact read already exists (same asset + same timestamp)
              // We want each new read to create a new entry, even for the same asset
              const existingIndex = oldData.findIndex(
                (row) =>
                  // Match by asset identifier AND timestamp to avoid duplicates
                  ((row.assetId && liveFeedRow.assetId && row.assetId === liveFeedRow.assetId) ||
                   (row.lastSeenEpc &&
                    liveFeedRow.lastSeenEpc &&
                    row.lastSeenEpc === liveFeedRow.lastSeenEpc) ||
                   (row.equipment &&
                    liveFeedRow.equipment &&
                    row.equipment === liveFeedRow.equipment)) &&
                  // Also match timestamp to ensure it's the exact same read
                  row.lastSeenAt === liveFeedRow.lastSeenAt
              );

              let updatedData: typeof oldData;
              if (existingIndex >= 0) {
                // This exact read already exists, update it (shouldn't happen often)
                console.log("[SignalR] Duplicate read detected, updating existing entry");
                updatedData = [...oldData];
                updatedData[existingIndex] = liveFeedRow;
              } else {
                // This is a new read event, add it as a new entry
                console.log(`[SignalR] Adding new entry. Current count: ${oldData.length}, New timestamp: ${liveFeedRow.lastSeenAt}`);
                updatedData = [liveFeedRow, ...oldData];
              }

              // Sort by lastSeenAt descending
              updatedData.sort((a, b) => {
                const dateA = new Date(a.lastSeenAt).getTime();
                const dateB = new Date(b.lastSeenAt).getTime();
                return dateB - dateA;
              });

              // Keep only the most recent 500 entries to prevent memory issues
              // Time-based filtering is handled by the API and UI filters
              const result = updatedData.slice(0, 500);
              console.log(`[SignalR] Cache updated. Total entries: ${result.length}`);
              return result;
            }
          );
        } catch (err) {
          console.error(`[SignalR] Error processing ${eventName} event:`, err, event);
        }
      });
    });

    // Start connection
    connection
      .start()
      .then(() => {
        setIsConnected(true);
        setError(null);
        console.log("[SignalR] Connected to live feed hub");
      })
      .catch((err) => {
        const errorMessage = err.message || "Failed to connect to SignalR hub";
        setError(errorMessage);
        console.error("[SignalR] Connection error:", err);
      });

    // Cleanup on unmount
    return () => {
      if (connection.state !== signalR.HubConnectionState.Disconnected) {
        connection.stop().catch((err) => {
          console.error("[SignalR] Error stopping connection:", err);
        });
      }
    };
  }, [queryClient]);

  return { isConnected, error };
}

