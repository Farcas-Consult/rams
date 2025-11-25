"use client";

import { Pie, PieChart, Cell, Legend, ResponsiveContainer, Tooltip } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { DashboardChartSlice } from "@/lib/dashboard-data";

const COLOR_TOKENS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "var(--chart-6)",
];

type AssetTypePieProps = {
  data: DashboardChartSlice[];
};

export function AssetTypePie({ data }: AssetTypePieProps) {
  const hasData = data.length > 0;

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle>Asset Mix</CardTitle>
        <CardDescription>Distribution across major categories</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        {hasData ? (
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="label"
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={4}
              >
                {data.map((entry, index) => (
                  <Cell
                    key={entry.label}
                    fill={COLOR_TOKENS[index % COLOR_TOKENS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => [`${value} assets`, "Count"]}
                contentStyle={{ borderRadius: 8 }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-center text-sm text-muted-foreground">
            No category distribution available.
          </div>
        )}
      </CardContent>
      <Separator className="my-4" />
      <CardFooter className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
        {hasData ? (
          data.slice(0, 4).map((item, index) => (
            <div key={item.label} className="flex items-center gap-2">
              <span
                className="inline-block size-2 rounded-full"
                style={{ background: COLOR_TOKENS[index % COLOR_TOKENS.length] }}
              />
              {item.label}: {item.value}
            </div>
          ))
        ) : (
          <div className="col-span-2 text-center">Add assets to see category insights.</div>
        )}
      </CardFooter>
    </Card>
  );
}

