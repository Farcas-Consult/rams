"use client";

import { TrendingUp, Building2, AlertTriangle, RefreshCw } from "lucide-react";

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";

const kpiCards = [
  {
    label: "Total Assets",
    value: "1,248",
    delta: "+4.6% vs last month",
    icon: TrendingUp,
    accent: "text-emerald-500",
  },
  {
    label: "Assets In Service",
    value: "982",
    delta: "78% utilization",
    icon: Building2,
    accent: "text-blue-500",
  },
  {
    label: "In Maintenance",
    value: "142",
    delta: "12 scheduled today",
    icon: RefreshCw,
    accent: "text-amber-500",
  },
  {
    label: "Decommissioned",
    value: "124",
    delta: "18 ready for review",
    icon: AlertTriangle,
    accent: "text-rose-500",
  },
];

export function AssetDashboardKPIs() {
  return (
    <div className="grid gap-4 px-4 lg:px-6 md:grid-cols-2 xl:grid-cols-4">
      {kpiCards.map((kpi) => (
        <Card key={kpi.label} className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardDescription className="font-medium">{kpi.label}</CardDescription>
            <kpi.icon className={`h-4 w-4 ${kpi.accent}`} />
          </CardHeader>
          <CardContent>
            <CardTitle className="text-3xl font-semibold">{kpi.value}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">{kpi.delta}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

