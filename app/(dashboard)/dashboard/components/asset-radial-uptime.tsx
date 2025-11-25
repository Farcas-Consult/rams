"use client";

import { TrendingUp } from "lucide-react";
import { Label, PolarRadiusAxis, RadialBar, RadialBarChart } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import type { DashboardUptimeData } from "@/lib/dashboard-data";

const chartConfig = {
  active: {
    label: "Active",
    color: "var(--chart-1)",
  },
  downtime: {
    label: "Downtime",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

type AssetRadialUptimeProps = {
  data: DashboardUptimeData;
};

export function AssetRadialUptime({ data }: AssetRadialUptimeProps) {
  const total = data.activeCount + data.downtimeCount;
  const chartData = [{ label: "Current", active: data.activeCount, downtime: data.downtimeCount }];
  const uptimePct = total > 0 ? data.uptimePct : 0;

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Asset Availability</CardTitle>
        <CardDescription>Current rolling 30-day overview</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-1 items-center pb-0">
        {total === 0 ? (
          <div className="w-full text-center text-sm text-muted-foreground">
            No uptime data available yet.
          </div>
        ) : (
          <ChartContainer
            config={chartConfig}
            className="mx-auto aspect-square w-full max-w-[260px]"
          >
            <RadialBarChart data={chartData} endAngle={180} innerRadius={80} outerRadius={130}>
              <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
              <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
                <Label
                  content={({ viewBox }) => {
                    if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                      return (
                        <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle">
                          <tspan
                            x={viewBox.cx}
                            y={(viewBox.cy || 0) - 12}
                            className="fill-foreground text-3xl font-semibold"
                          >
                            {uptimePct}%
                          </tspan>
                          <tspan
                            x={viewBox.cx}
                            y={(viewBox.cy || 0) + 12}
                            className="fill-muted-foreground text-sm"
                          >
                            Uptime
                          </tspan>
                        </text>
                      );
                    }
                    return null;
                  }}
                />
              </PolarRadiusAxis>
              <RadialBar
                dataKey="active"
                stackId="a"
                cornerRadius={5}
                fill="var(--color-active)"
                className="stroke-transparent stroke-2"
              />
              <RadialBar
                dataKey="downtime"
                stackId="a"
                cornerRadius={5}
                fill="var(--color-downtime)"
                className="stroke-transparent stroke-2"
              />
            </RadialBarChart>
          </ChartContainer>
        )}
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 font-medium leading-none">
          Live telemetry <TrendingUp className="h-4 w-4 text-emerald-500" />
        </div>
        <div className="text-muted-foreground">
          Monitoring {total.toLocaleString("en-US")} connected assets.
        </div>
      </CardFooter>
    </Card>
  );
}

