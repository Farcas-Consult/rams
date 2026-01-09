"use client";

import { TrendingUp } from "lucide-react";

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { DashboardKPIData } from "@/lib/dashboard-data";

const numberFormatter = new Intl.NumberFormat("en-US");

type KPIConfig = {
  label: string;
  detail: string;
  icon: typeof TrendingUp;
  getValue: (data: DashboardKPIData) => number;
};

const kpiCards: KPIConfig[] = [
  {
    label: "Total Assets",
    detail: "tracked assets",
    icon: TrendingUp,
    getValue: (data) => data.totalAssets,
  },
];

type AssetDashboardKPIsProps = {
  data: DashboardKPIData;
};

export function AssetDashboardKPIs({ data }: AssetDashboardKPIsProps) {
  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-bl *:data-[slot=card]:shadow-xs lg:px-6">
      {kpiCards.map((kpi) => {
        const value = kpi.getValue(data);
        return (
          <Card key={kpi.label} className="@container/card" data-slot="card">
            <CardHeader>
              <CardDescription>{kpi.label}</CardDescription>
              <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                {numberFormatter.format(value)}
              </CardTitle>
            </CardHeader>
            <CardFooter className="flex-col items-start gap-1.5 text-sm">
              <div className="flex gap-2 font-medium">
                <Badge variant="outline" className="gap-1.5">
                  <kpi.icon className="size-4" />
                  Live
                </Badge>
              </div>
              <div className="text-muted-foreground">{kpi.detail}</div>
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
}


