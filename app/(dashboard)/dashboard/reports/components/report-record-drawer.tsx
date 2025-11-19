"use client";

import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

import { AssetReportColumn, AssetReportRow } from "../lib/get-asset-report";

type ReportRecordDrawerProps = {
  triggerLabel: string;
  record: AssetReportRow;
  columns: AssetReportColumn[];
};

export function ReportRecordDrawer({ triggerLabel, record, columns }: ReportRecordDrawerProps) {
  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant="link" className="px-0 font-semibold">
          {triggerLabel || "—"}
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle className="text-left text-lg font-semibold">
            Asset #{triggerLabel || "N/A"}
          </DrawerTitle>
        </DrawerHeader>
        <ScrollArea className="max-h-[70vh] px-6">
          <div className="space-y-4 py-2">
            {columns.map((column) => (
              <div key={column.key} className="space-y-1">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {column.label}
                </p>
                <p className="rounded-md border border-dashed border-border/60 bg-muted/30 px-3 py-2 text-sm">
                  {record[column.key]?.trim() || "—"}
                </p>
                <Separator />
              </div>
            ))}
          </div>
        </ScrollArea>
        <DrawerFooter>
          <DrawerClose asChild>
            <Button variant="outline">Close</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}


