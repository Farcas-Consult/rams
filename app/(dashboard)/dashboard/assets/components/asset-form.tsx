"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

import { createAssetSchema, AssetResponse } from "../schemas/asset-schemas";
import { useCreateAsset, useUpdateAsset } from "../hooks/useAssetMutations";

type AssetFormValues = z.infer<typeof createAssetSchema>;

type AssetFormProps = {
  mode: "create" | "edit";
  initialData?: AssetResponse | null;
  epc?: string;
};

const ORIGIN_OPTIONS = ["inventory", "import", "discovered"] as const;
const DISCOVERY_STATUS_OPTIONS = [
  "catalogued",
  "pending_review",
  "undiscovered",
] as const;

const isOriginValue = (value: unknown): value is AssetFormValues["origin"] =>
  typeof value === "string" && ORIGIN_OPTIONS.includes(value as (typeof ORIGIN_OPTIONS)[number]);

const isDiscoveryStatusValue = (
  value: unknown,
): value is AssetFormValues["discoveryStatus"] =>
  typeof value === "string" &&
  DISCOVERY_STATUS_OPTIONS.includes(value as (typeof DISCOVERY_STATUS_OPTIONS)[number]);

const formatDateInput = (value?: string | Date | null) => {
  if (!value) return "";
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().split("T")[0] ?? "";
};

export function AssetForm({ mode, initialData, epc }: AssetFormProps) {
  const router = useRouter();
  const {
    mutateAsync: createAsset,
    isPending: isCreating,
  } = useCreateAsset();
  const {
    mutateAsync: updateAsset,
    isPending: isUpdating,
  } = useUpdateAsset();

  const form = useForm<AssetFormValues>({
    resolver: zodResolver(createAssetSchema),
    defaultValues: {
      assetName: initialData?.assetName ?? "",
      assetTag: initialData?.assetTag ?? initialData?.equipment ?? "",
      equipment: initialData?.equipment ?? "",
      plnt: initialData?.plnt ?? "",
      material: initialData?.material ?? "",
      materialDescription: initialData?.materialDescription ?? "",
      techIdentNo: initialData?.techIdentNo ?? "",
      category: initialData?.category ?? "",
      location: initialData?.location ?? "",
      status: initialData?.status ?? "",
      sysStatus: initialData?.sysStatus ?? "",
      userStatusRaw: initialData?.userStatusRaw ?? "",
      assignedTo: initialData?.assignedTo ?? "",
      functionalLoc: initialData?.functionalLoc ?? "",
      functionalLocDescription: initialData?.functionalLocDescription ?? "",
      purchaseDate: formatDateInput(initialData?.purchaseDate),
      purchasePrice: initialData?.purchasePrice,
      acquistnValue: initialData?.acquistnValue,
      serialNumber: initialData?.serialNumber ?? "",
      manufSerialNumber: initialData?.manufSerialNumber ?? "",
      manufacturer: initialData?.manufacturer ?? "",
      model: initialData?.model ?? "",
      description: initialData?.description ?? "",
      pfUserAc: initialData?.pfUserAc ?? "",
      pfUserAccountableDescription: initialData?.pfUserAccountableDescription ?? "",
      pfPropMg: initialData?.pfPropMg ?? "",
      pfPropMgmFocalPointDescription: initialData?.pfPropMgmFocalPointDescription ?? "",
      sLoc: initialData?.sLoc ?? "",
      aGrp: initialData?.aGrp ?? "",
      busA: initialData?.busA ?? "",
      objectType: initialData?.objectType ?? "",
      costCtr: initialData?.costCtr ?? "",
      comment: initialData?.comment ?? "",
      origin: isOriginValue(initialData?.origin) ? initialData?.origin : "inventory",
      discoveryStatus: isDiscoveryStatusValue(initialData?.discoveryStatus)
        ? initialData?.discoveryStatus
        : "catalogued",
      discoveryNotes: initialData?.discoveryNotes ?? "",
      discoveredAt: formatDateInput(initialData?.discoveredAt),
      // Decommissioning defaults kept for compatibility but not exposed in the form
      isDecommissioned: initialData?.isDecommissioned ?? false,
      decommissionedAt: formatDateInput(initialData?.decommissionedAt),
      decommissionReason: initialData?.decommissionReason ?? "",
    },
  });

  const isSubmitting = isCreating || isUpdating;

  const trimString = (value?: string | null) => (value ? value.trim() : undefined);
  const numberOrUndefined = (value?: number | null) =>
    typeof value === "number" && !Number.isNaN(value) ? value : undefined;

  const handleSubmit = async (values: AssetFormValues) => {
    let payload: AssetFormValues = {
      ...values,
      assetName: values.assetName.trim(),
      assetTag: trimString(values.assetTag),
      equipment: trimString(values.equipment),
      plnt: trimString(values.plnt),
      material: trimString(values.material),
      materialDescription: trimString(values.materialDescription),
      techIdentNo: trimString(values.techIdentNo),
      category: trimString(values.category),
      location: trimString(values.location),
      status: trimString(values.status),
      sysStatus: trimString(values.sysStatus),
      userStatusRaw: trimString(values.userStatusRaw),
      assignedTo: trimString(values.assignedTo),
      functionalLoc: trimString(values.functionalLoc),
      functionalLocDescription: trimString(values.functionalLocDescription),
      purchaseDate: values.purchaseDate || undefined,
      purchasePrice: numberOrUndefined(values.purchasePrice),
      acquistnValue: numberOrUndefined(values.acquistnValue),
      serialNumber: trimString(values.serialNumber),
      manufSerialNumber: trimString(values.manufSerialNumber),
      manufacturer: trimString(values.manufacturer),
      model: trimString(values.model),
      description: trimString(values.description),
      pfUserAc: trimString(values.pfUserAc),
      pfUserAccountableDescription: trimString(values.pfUserAccountableDescription),
      pfPropMg: trimString(values.pfPropMg),
      pfPropMgmFocalPointDescription: trimString(values.pfPropMgmFocalPointDescription),
      sLoc: trimString(values.sLoc),
      aGrp: trimString(values.aGrp),
      busA: trimString(values.busA),
      objectType: trimString(values.objectType),
      costCtr: trimString(values.costCtr),
      comment: trimString(values.comment),
      origin: values.origin,
      discoveryStatus: values.discoveryStatus,
      discoveryNotes: trimString(values.discoveryNotes),
      discoveredAt: values.discoveredAt || undefined,
      // Preserve any incoming decommission metadata but do not allow editing while disabled
      isDecommissioned: values.isDecommissioned ?? false,
      decommissionedAt: values.decommissionedAt || undefined,
      decommissionReason: trimString(values.decommissionReason),
    };

    if (!payload.equipment && payload.assetTag) {
      payload.equipment = payload.assetTag;
    }

    if (!payload.assetTag && payload.equipment) {
      payload.assetTag = payload.equipment;
    }

    if (mode === "create") {
      const createdAsset = await createAsset(payload);
      
      // If EPC is provided, assign it to the newly created asset
      if (epc && createdAsset?.id) {
        try {
          const response = await fetch("/api/rfid-tags", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              epc,
              assetId: createdAsset.id,
            }),
          });

          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || "Failed to assign EPC to asset");
          }

          // Show success message for tag assignment
          toast.success("Asset created and EPC assigned successfully");
        } catch (error) {
          console.error("Failed to assign EPC:", error);
          toast.error(
            `Asset created but failed to assign EPC: ${error instanceof Error ? error.message : "Unknown error"}`
          );
        }
      }
    } else if (initialData?.id) {
      await updateAsset({
        id: initialData.id,
        ...payload,
      });
    }

    router.push("/dashboard/assets");
    router.refresh();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <section className="space-y-4 rounded-xl border border-border/60 bg-card/40 p-4">
          <div>
            <h3 className="text-base font-semibold">Identification</h3>
            <p className="text-sm text-muted-foreground">
              Map directly to the Excel columns (Plnt, Equipment, Material, TechIdentNo.).
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="assetName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Asset Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Disk Library System" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          <FormField
            control={form.control}
              name="assetTag"
            render={({ field }) => (
              <FormItem>
                  <FormLabel>Asset Tag</FormLabel>
                <FormControl>
                    <Input placeholder="16928593" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
            <FormField
              control={form.control}
              name="equipment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Equipment No.</FormLabel>
                  <FormControl>
                    <Input placeholder="Equipment from Excel" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="plnt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Plnt</FormLabel>
                  <FormControl>
                    <Input placeholder="KE10" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="material"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Material</FormLabel>
                  <FormControl>
                    <Input placeholder="1500033848" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="techIdentNo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>TechIdentNo.</FormLabel>
                  <FormControl>
                    <Input placeholder="SOA-A-006425" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="materialDescription"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Material Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Storage:Array Disc, High Capacity"
                    className="min-h-[90px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </section>

        <section className="space-y-4 rounded-xl border border-border/60 bg-card/40 p-4">
          <div>
            <h3 className="text-base font-semibold">Location & Status</h3>
            <p className="text-sm text-muted-foreground">
              System/user status plus functional-location context.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <FormControl>
                    <Input placeholder="T00" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                    <Input placeholder="KE10" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="functionalLoc"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Functional Location</FormLabel>
                  <FormControl>
                    <Input placeholder="Functional Loc." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <FormControl>
                    <Input placeholder="EQID / WRPR" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="sysStatus"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>System Status</FormLabel>
                  <FormControl>
                    <Input placeholder="ESTO" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="userStatusRaw"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>User Status</FormLabel>
                  <FormControl>
                    <Input placeholder="EQID" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="functionalLocDescription"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Functional Location Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Description of functional location"
                    className="min-h-[90px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="assignedTo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assigned To / PF User Accountable</FormLabel>
                  <FormControl>
                    <Input placeholder="PF User Accountable Desc." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="origin"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Origin</FormLabel>
                  <FormControl>
                    <Input placeholder="inventory | import | discovered" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="discoveryStatus"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Discovery Status</FormLabel>
                  <FormControl>
                    <Input placeholder="catalogued / pending_review / undiscovered" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </section>

        <section className="space-y-4 rounded-xl border border-border/60 bg-card/40 p-4">
          <div>
            <h3 className="text-base font-semibold">PF & Ownership</h3>
            <p className="text-sm text-muted-foreground">PF user, logistics, and cost centre info.</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="pfUserAc"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>PF User Ac</FormLabel>
                  <FormControl>
                    <Input placeholder="PF User Ac" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="pfUserAccountableDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>PF User Accountable Description</FormLabel>
                  <FormControl>
                    <Input placeholder="PF User Accountable Description" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="pfPropMg"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>PF Prop.Mg</FormLabel>
                  <FormControl>
                    <Input placeholder="PF Prop.Mg" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="pfPropMgmFocalPointDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>PF Prop.Mgm Focal Point Description</FormLabel>
                  <FormControl>
                    <Input placeholder="PF Prop.Mgm Focal Point Description" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="sLoc"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>SLoc</FormLabel>
                  <FormControl>
                    <Input placeholder="2203" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="aGrp"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>AGrp</FormLabel>
                  <FormControl>
                    <Input placeholder="T00" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="busA"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>BusA</FormLabel>
                  <FormControl>
                    <Input placeholder="P017" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="objectType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Object Type</FormLabel>
                  <FormControl>
                    <Input placeholder="43201800" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="costCtr"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cost Center</FormLabel>
                  <FormControl>
                    <Input placeholder="10525" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </section>

        <section className="space-y-4 rounded-xl border border-border/60 bg-card/40 p-4">
          <div>
            <h3 className="text-base font-semibold">Hardware & Financials</h3>
            <p className="text-sm text-muted-foreground">
              Manufacturer, serials, and value data needed for reports.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="manufacturer"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Manufacturer</FormLabel>
                  <FormControl>
                    <Input placeholder="Dell" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="model"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Model</FormLabel>
                  <FormControl>
                    <Input placeholder="Latitude 5440" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="serialNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Serial Number</FormLabel>
                  <FormControl>
                    <Input placeholder="SN-0012345" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="manufSerialNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Manuf Serial Number</FormLabel>
                  <FormControl>
                    <Input placeholder="Manufacturer serial" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <FormField
              control={form.control}
              name="purchaseDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Purchase Date</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      value={field.value ?? ""}
                      onChange={(event) => field.onChange(event.currentTarget.value)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="purchasePrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Purchase Price</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      value={field.value ?? ""}
                      onChange={(event) => {
                        const value = event.currentTarget.value;
                        field.onChange(value === "" ? undefined : Number(value));
                      }}
                      min={0}
                      placeholder="126061"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="acquistnValue"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>AcquistnValue (USD)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      value={field.value ?? ""}
                      onChange={(event) => {
                        const value = event.currentTarget.value;
                        field.onChange(value === "" ? undefined : Number(value));
                      }}
                      min={0}
                      placeholder="Optional fallback value"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Add any useful context about the asset..."
                    className="min-h-[120px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="comment"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Comment</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Comment column from Excel"
                    className="min-h-[90px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </section>

        <section className="space-y-4 rounded-xl border border-border/60 bg-card/40 p-4">
          <div>
            <h3 className="text-base font-semibold">Discovery</h3>
            <p className="text-sm text-muted-foreground">
              Discovery notes for lifecycle tracking. Decommissioning fields are currently disabled.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="discoveredAt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Discovered At</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      value={field.value ?? ""}
                      onChange={(event) => field.onChange(event.currentTarget.value)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="discoveryNotes"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Discovery Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Notes from discovery or field teams"
                      className="min-h-[90px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </section>

        <div className={cn("flex flex-col gap-3 sm:flex-row sm:items-center")}>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : mode === "create" ? "Create Asset" : "Save Changes"}
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={isSubmitting}
            onClick={() => router.push("/dashboard/assets")}
          >
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  );
}


