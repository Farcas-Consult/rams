"use client";

import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Separator } from "@/components/ui/separator";

import { AssetReportRow } from "../lib/get-asset-report";

type ReportAnalyticsProps = {
  rows: AssetReportRow[];
  metricKeys: {
    systemStatus?: string;
    mission?: string;
    direction?: string;
  };
};

const palette = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"];

const parseNumber = (value?: string) => {
  if (!value) return 0;
  const cleaned = value.replace(/[^0-9.-]+/g, "");
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : 0;
};

export function ReportAnalytics({ rows, metricKeys }: ReportAnalyticsProps) {

  const systemStatusData = useMemo(() => {
    if (!metricKeys.systemStatus) return [];
    const counts = rows.reduce<Record<string, number>>((acc, row) => {
      const key = row[metricKeys.systemStatus!]?.trim() || "Unspecified";
      acc[key] = (acc[key] ?? 0) + 1;
      return acc;
    }, {});
    return Object.entries(counts).map(([status, total]) => ({ status, total }));
  }, [rows, metricKeys.systemStatus]);

  const missionData = useMemo(() => {
    if (!metricKeys.mission) return [];
    const counts = rows.reduce<Record<string, number>>((acc, row) => {
      const key = row[metricKeys.mission!]?.trim() || "Unspecified";
      acc[key] = (acc[key] ?? 0) + 1;
      return acc;
    }, {});
    return Object.entries(counts).map(([mission, total]) => ({ mission, total }));
  }, [rows, metricKeys.mission]);

  const directionData = useMemo(() => {
    if (!metricKeys.direction) return [];
    const counts = rows.reduce<Record<string, number>>((acc, row) => {
      const key = row[metricKeys.direction!]?.trim() || "Unspecified";
      acc[key] = (acc[key] ?? 0) + 1;
      return acc;
    }, {});
    return Object.entries(counts)
      .map(([direction, total]) => ({ direction, total }))
      .sort((a, b) => b.total - a.total);
  }, [rows, metricKeys.direction]);

  const statusChartConfig = useMemo(() => {
    return systemStatusData.reduce<Record<string, { label: string; color: string }>>((acc, item, index) => {
      acc[item.status] = {
        label: item.status,
        color: palette[index % palette.length],
      };
      return acc;
    }, {});
  }, [systemStatusData]);

  const categoryColors = palette;

  const summary = useMemo(() => {
    const totalAssets = rows.length;
    const dominantDirection = directionData[0];
    return [
      {
        label: "Total Assets",
        value: totalAssets.toString(),
        subtext: "Rows in current view",
        tag: "Inventory",
      },
      {
        label: "Unique Missions",
        value: missionData.length.toString(),
        subtext: "Mission codes represented",
        tag: "Missions",
      },
      {
        label: "Direction Focus",
        value: dominantDirection ? dominantDirection.direction : "Unspecified",
        subtext: dominantDirection ? `${dominantDirection.total} records` : "No direction data",
        tag: "Direction",
      },
    ];
  }, [rows.length, missionData.length, directionData]);

  return (
    <div className="space-y-4">
      <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-0 *:data-[slot=card]:bg-gradient-to-bl *:data-[slot=card]:shadow-xs md:grid-cols-2 xl:grid-cols-4">
        {summary.map((item) => (
          <Card key={item.label} className="@container/card" data-slot="card">
            <CardHeader>
              <CardDescription>{item.label}</CardDescription>
              <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                {item.value}
              </CardTitle>
              <CardAction>
                <span className="inline-flex rounded-full border border-border/80 px-3 py-1 text-xs font-semibold text-muted-foreground">
                  {item.tag}
                </span>
              </CardAction>
            </CardHeader>
            <CardFooter className="flex-col items-start gap-1.5 text-sm">
              <div className="text-muted-foreground">{item.subtext}</div>
            </CardFooter>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>System Status Breakdown</CardTitle>
            <CardDescription>Distribution of assets by UMOJA system states.</CardDescription>
          </CardHeader>
          <CardContent className="flex-1">
            <ChartContainer config={statusChartConfig as ChartConfig} className="h-[320px] w-full">
              <ResponsiveContainer>
                <BarChart data={systemStatusData}>
                  <CartesianGrid strokeDasharray="4 4" vertical={false} />
                  <XAxis dataKey="status" tickLine={false} axisLine={false} />
                  <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
                  <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                  <Bar dataKey="total" radius={[6, 6, 0, 0]}>
                    {systemStatusData.map((entry) => (
                      <Cell
                        key={entry.status}
                        fill={
                          statusChartConfig[entry.status]?.color ??
                          "var(--chart-1)"
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>Mission Mix</CardTitle>
            <CardDescription>Top missions represented in this export snapshot.</CardDescription>
          </CardHeader>
          <CardContent className="flex-1">
            <ResponsiveContainer width="100%" height={320}>
              <PieChart>
                <Pie
                  data={missionData}
                  dataKey="total"
                  nameKey="mission"
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={110}
                  paddingAngle={3}
                >
                  {missionData.map((entry, index) => (
                    <Cell key={entry.mission} fill={categoryColors[index % categoryColors.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => [`${value} assets`, "Count"]}
                  contentStyle={{ borderRadius: 8 }}
                />
              </PieChart>
            </ResponsiveContainer>
            <Separator className="my-4" />
            <div className="grid grid-cols-2 gap-2 text-sm">
              {missionData.map((entry, index) => (
                <div key={entry.mission} className="flex items-center gap-2">
                  <span
                    className="inline-block size-2 rounded-full"
                    style={{ background: categoryColors[index % categoryColors.length] }}
                  />
                  <span className="text-muted-foreground">
                    {entry.mission}: <span className="text-foreground font-medium">{entry.total}</span>
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
