"use client";

import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";
import { useIsMobile } from "@/hooks/use-mobile";
import { AssetReportColumn, AssetReportRow } from "../lib/get-asset-report";

type ReportRecordDrawerProps = {
  triggerLabel: string;
  record: AssetReportRow;
  columns: AssetReportColumn[];
};

export function ReportRecordDrawer({ triggerLabel, record, columns }: ReportRecordDrawerProps) {
  const isMobile = useIsMobile();

  return (
    <Drawer direction={isMobile ? "bottom" : "right"}>
      <DrawerTrigger asChild>
        <Button variant="link" className="px-0 font-semibold">
          {triggerLabel || "—"}
        </Button>
      </DrawerTrigger>
      <DrawerContent className="sm:max-w-[520px]">
        <DrawerHeader className="gap-1">
          <DrawerTitle className="text-left text-lg font-semibold">Asset #{triggerLabel || "N/A"}</DrawerTitle>
          <DrawerDescription>Full report record with every column from the spreadsheet.</DrawerDescription>
        </DrawerHeader>
        <ScrollArea className="h-[60vh] px-4">
          <div className="grid gap-4 pb-4">
            {columns.map((column) => (
              <div key={column.key} className="space-y-1 border-b pb-3 text-sm last:border-0 last:pb-0">
                <Label className="text-xs uppercase text-muted-foreground">{column.label}</Label>
                <div className="font-medium break-words">{record[column.key]?.trim() || "—"}</div>
              </div>
            ))}
          </div>
        </ScrollArea>
        <DrawerFooter className="flex-row justify-end gap-2 border-t px-4 py-3">
          <DrawerClose asChild>
            <Button variant="outline">Close</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}


