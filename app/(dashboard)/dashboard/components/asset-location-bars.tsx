"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { DashboardChartSlice } from "@/lib/dashboard-data";

type AssetLocationBarsProps = {
  data: DashboardChartSlice[];
};

export function AssetLocationBars({ data }: AssetLocationBarsProps) {
  const hasData = data.length > 0;
  const chartData = data.map((item) => ({ location: item.label, assets: item.value }));

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle>Assets by Location</CardTitle>
        <CardDescription>Top monitored facilities</CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        {hasData ? (
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={chartData} barSize={24}>
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
              <Bar dataKey="assets" fill="var(--chart-1)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-center text-sm text-muted-foreground">
            No location insights yet. Add assets with locations to populate this chart.
          </div>
        )}
      </CardContent>
    </Card>
  );
}

