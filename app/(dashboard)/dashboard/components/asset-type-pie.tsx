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

const assetTypeData = [
  { type: "IT Equipment", value: 420, fill: "hsl(var(--chart-1))" },
  { type: "Vehicles", value: 180, fill: "hsl(var(--chart-2))" },
  { type: "Heavy Machinery", value: 135, fill: "hsl(var(--chart-3))" },
  { type: "Medical Devices", value: 98, fill: "hsl(var(--chart-4))" },
  { type: "Facilities", value: 74, fill: "hsl(var(--chart-5))" },
];

export function AssetTypePie() {
  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle>Asset Mix</CardTitle>
        <CardDescription>Distribution across major categories</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ResponsiveContainer width="100%" height={260}>
          <PieChart>
            <Pie
              data={assetTypeData}
              dataKey="value"
              nameKey="type"
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={4}
            >
              {assetTypeData.map((entry) => (
                <Cell key={entry.type} fill={entry.fill} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value) => [`${value} assets`, "Count"]}
              contentStyle={{ borderRadius: 8 }}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
      <Separator className="my-4" />
      <CardFooter className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
        {assetTypeData.slice(0, 4).map((item) => (
          <div key={item.type} className="flex items-center gap-2">
            <span
              className="inline-block size-2 rounded-full"
              style={{ background: item.fill }}
            />
            {item.type}: {item.value}
          </div>
        ))}
      </CardFooter>
    </Card>
  );
}

