"use client";

import { PropsWithChildren } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  DrawerClose,
} from "@/components/ui/drawer";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { TransformedAsset } from "../types/asset-types";
import { useIsMobile } from "@/hooks/use-mobile";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

interface AssetDetailDrawerProps extends PropsWithChildren {
  asset: TransformedAsset;
}

const detailFields: { label: string; key: keyof TransformedAsset }[] = [
  { label: "Plnt", key: "plnt" },
  { label: "Equipment", key: "equipment" },
  { label: "Material", key: "material" },
  { label: "Material Description", key: "materialDescription" },
  { label: "TechIdentNo.", key: "techIdentNo" },
  { label: "Description", key: "description" },
  { label: "Manuf Serial Number", key: "manufSerialNumber" },
  { label: "SysStatus", key: "sysStatus" },
  { label: "UserStatus", key: "userStatusRaw" },
  { label: "SLoc", key: "sLoc" },
  { label: "PF User Ac", key: "pfUserAc" },
  { label: "PF User Accountable Description", key: "pfUserAccountableDescription" },
  { label: "PF Prop.Mg", key: "pfPropMg" },
  { label: "PF Prop.Mgm Focal Point Description", key: "pfPropMgmFocalPointDescription" },
  { label: "Functional Loc.", key: "functionalLoc" },
  { label: "Description of Functional Location", key: "functionalLocDescription" },
  { label: "AGrp", key: "aGrp" },
  { label: "BusA", key: "busA" },
  { label: "Object Type", key: "objectType" },
  { label: "Cost Ctr", key: "costCtr" },
  { label: "AcquistnValue (USD)", key: "acquistnValue" },
  { label: "Comment", key: "comment" },
  { label: "Asset Tag", key: "assetTag" },
  { label: "Serial Number", key: "serialNumber" },
  { label: "Category", key: "category" },
  { label: "Location", key: "location" },
  { label: "Status", key: "status" },
  { label: "Assigned To", key: "assignedTo" },
  { label: "Manufacturer", key: "manufacturer" },
  { label: "Model", key: "model" },
  { label: "Origin", key: "origin" },
  { label: "Discovery Status", key: "discoveryStatus" },
  { label: "Discovery Notes", key: "discoveryNotes" },
  { label: "Purchase Date", key: "purchaseDate" },
  { label: "Purchase Price", key: "purchasePrice" },
  { label: "Created At", key: "createdAt" },
  { label: "Updated At", key: "updatedAt" },
];

const formatValue = (key: keyof TransformedAsset, value: any) => {
  if (value === null || value === undefined || value === "") {
    return "—";
  }

  if (key === "acquistnValue" || key === "purchasePrice") {
    const number = Number(value);
    if (Number.isNaN(number)) return value;
    return `$${number.toLocaleString()}`;
  }

  if (
    key === "purchaseDate" ||
    key === "createdAt" ||
    key === "updatedAt" ||
    key === "discoveredAt" ||
    key === "decommissionedAt"
  ) {
    const date = typeof value === "string" ? new Date(value) : value;
    if (Number.isNaN(date?.getTime())) return value;
    return format(date, "PP");
  }

  return value;
};

export function AssetDetailDrawer({ asset, children }: AssetDetailDrawerProps) {
  const isMobile = useIsMobile();

  return (
    <Drawer direction={isMobile ? "bottom" : "right"}>
      <DrawerTrigger asChild>{children}</DrawerTrigger>
      <DrawerContent className="sm:max-w-[480px]">
        <DrawerHeader className="gap-1">
          <Badge variant="outline" className="w-fit">
            {asset.origin === "discovered" ? "Discovered" : "Catalogued"}
          </Badge>
          <DrawerTitle>{asset.assetName || asset.description || asset.equipment}</DrawerTitle>
          <DrawerDescription>
            Equipment {asset.equipment || "N/A"} · Asset Tag {asset.assetTag || "N/A"}
          </DrawerDescription>
        </DrawerHeader>
        <ScrollArea className="h-[60vh] px-4">
          <div className="grid gap-4 pb-4">
            {detailFields.map(({ label, key }) => (
              <div key={key} className="space-y-1 border-b pb-3 text-sm last:border-0 last:pb-0">
                <Label className="text-xs uppercase text-muted-foreground">{label}</Label>
                <div className="font-medium break-words">{formatValue(key, asset[key])}</div>
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

