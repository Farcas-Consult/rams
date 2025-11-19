"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const locationData = [
  { location: "HQ Campus", assets: 320 },
  { location: "Manufacturing Plant", assets: 210 },
  { location: "Distribution Hub", assets: 168 },
  { location: "Data Center", assets: 142 },
  { location: "Remote Sites", assets: 120 },
  { location: "R&D Lab", assets: 95 },
];

export function AssetLocationBars() {
  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle>Assets by Location</CardTitle>
        <CardDescription>Top monitored facilities</CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={locationData} barSize={24}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="location"
              tick={{ fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis axisLine={false} tickLine={false} />
            <Tooltip
              formatter={(value) => [`${value} assets`, "Count"]}
              contentStyle={{ borderRadius: 8 }}
            />
            <Bar dataKey="assets" fill="hsl(var(--chart-1))" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

