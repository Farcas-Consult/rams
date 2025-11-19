"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

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
import { cn } from "@/lib/utils";

import { createAssetSchema, AssetResponse } from "../schemas/asset-schemas";
import { useCreateAsset, useUpdateAsset } from "../hooks/useAssetMutations";

type AssetFormValues = z.infer<typeof createAssetSchema>;

type AssetFormProps = {
  mode: "create" | "edit";
  initialData?: AssetResponse | null;
};

const formatDateInput = (value?: string | Date | null) => {
  if (!value) return "";
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().split("T")[0] ?? "";
};

export function AssetForm({ mode, initialData }: AssetFormProps) {
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
      assetTag: initialData?.assetTag ?? "",
      assetName: initialData?.assetName ?? "",
      category: initialData?.category ?? "",
      location: initialData?.location ?? "",
      status: initialData?.status ?? "",
      assignedTo: initialData?.assignedTo ?? "",
      purchaseDate: formatDateInput(initialData?.purchaseDate),
      purchasePrice: initialData?.purchasePrice,
      serialNumber: initialData?.serialNumber ?? "",
      manufacturer: initialData?.manufacturer ?? "",
      model: initialData?.model ?? "",
      description: initialData?.description ?? "",
    },
  });

  const isSubmitting = isCreating || isUpdating;

  const handleSubmit = async (values: AssetFormValues) => {
    const payload = {
      ...values,
      assetTag: values.assetTag?.trim() || undefined,
      category: values.category?.trim() || undefined,
      location: values.location?.trim() || undefined,
      status: values.status?.trim() || undefined,
      assignedTo: values.assignedTo?.trim() || undefined,
      purchaseDate: values.purchaseDate || undefined,
      purchasePrice:
        typeof values.purchasePrice === "number" && !Number.isNaN(values.purchasePrice)
          ? values.purchasePrice
          : undefined,
      serialNumber: values.serialNumber?.trim() || undefined,
      manufacturer: values.manufacturer?.trim() || undefined,
      model: values.model?.trim() || undefined,
      description: values.description?.trim() || undefined,
    };

    if (mode === "create") {
      await createAsset(payload);
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
        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="assetName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Asset Name</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. Dell Latitude 5440" {...field} />
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
                  <Input placeholder="TAG-00123" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. IT Equipment" {...field} />
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
                  <Input placeholder="e.g. HQ Campus" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <FormControl>
                  <Input placeholder="Status from Excel (e.g. EQID)" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="assignedTo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Assigned To</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. John Doe" {...field} />
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
                    placeholder="e.g. 1500"
                  />
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
                  <Input placeholder="e.g. SN-0012345" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="manufacturer"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Manufacturer</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. Dell" {...field} />
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
                  <Input placeholder="e.g. Latitude 5440" {...field} />
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


