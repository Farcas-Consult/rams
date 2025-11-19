"use client";

import { TrendingUp, Building2, AlertTriangle, RefreshCw } from "lucide-react";

import {
  Card,
  CardAction,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const kpiCards = [
  {
    label: "Total Assets",
    value: "1,248",
    delta: "+4.6%",
    detail: "vs last month",
    icon: TrendingUp,
    trend: "up",
  },
  {
    label: "Assets In Service",
    value: "982",
    delta: "78%",
    detail: "utilization",
    icon: Building2,
    trend: "up",
  },
  {
    label: "In Maintenance",
    value: "142",
    delta: "+12",
    detail: "scheduled today",
    icon: RefreshCw,
    trend: "neutral",
  },
  {
    label: "Decommissioned",
    value: "124",
    delta: "18",
    detail: "ready for review",
    icon: AlertTriangle,
    trend: "down",
  },
];

export function AssetDashboardKPIs() {
  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-bl *:data-[slot=card]:shadow-xs lg:px-6 md:grid-cols-2 xl:grid-cols-4">
      {kpiCards.map((kpi) => (
        <Card key={kpi.label} className="@container/card" data-slot="card">
          <CardHeader>
            <CardDescription>{kpi.label}</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              {kpi.value}
            </CardTitle>
            <CardAction>
              <Badge variant="outline" className="gap-1.5">
                <kpi.icon className="size-4" />
                {kpi.delta}
              </Badge>
            </CardAction>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="line-clamp-1 flex gap-2 font-medium">
              {kpi.trend === "up" && "Trending up"}
              {kpi.trend === "down" && "Trending down"}
              {kpi.trend === "neutral" && "Status update"}
              <kpi.icon className="size-4" />
            </div>
            <div className="text-muted-foreground">{kpi.detail}</div>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}

