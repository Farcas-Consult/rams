"use client";

import * as React from "react";
import * as XLSX from "xlsx";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useImportAssets } from "../hooks/useAssetMutations";
import { CreateAssetInput } from "../schemas/asset-schemas";
import { IconLoader, IconUpload } from "@tabler/icons-react";
import { toast } from "sonner";

interface ImportAssetsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Excel column mapping - adjust these based on your actual Excel structure
 * The keys are the Excel column headers, values are the asset property names
 */
type MappableField = keyof CreateAssetInput;

const HEADER_MAPPINGS: Record<MappableField, string[]> = {
  plnt: ["Plnt"],
  equipment: ["Equipment", "Equip No.", "Equipment No."],
  material: ["Material", "Material Num."],
  materialDescription: ["Material Description", "Material Desc."],
  techIdentNo: ["TechIdentNo.", "Technical Num.", "Tech Ident No."],
  description: ["Description", "Description (RAMS)", "Description (Last Inventory)"],
  assetName: [
    "Asset Name",
    "Description",
    "Material Description",
    "Material Desc.",
    "Technical Desc.",
  ],
  assetTag: ["Asset Tag", "Equip No.", "Equipment"],
  category: [
    "Category",
    "Object Type",
    "Material",
    "Material Desc.",
    "Mission",
    "AGrp",
  ],
  location: [
    "Location",
    "Functional Loc. Desc.",
    "Loc. in UMOJA",
    "Functional Loc.",
    "Description of functional location",
  ],
  status: [
    "Status",
    "System status",
    "SysStatus",
    "User status",
    "UserStatus",
    "RAMS User status",
  ],
  manufSerialNumber: ["ManufSerialNumber", "Manuf. s/n"],
  serialNumber: ["Serial Number", "Manuf. s/n", "ManufSerialNumber", "Technical Num.", "TechIdentNo."],
  sysStatus: ["SysStatus", "System status"],
  userStatusRaw: ["UserStatus", "User status", "RAMS User status"],
  sLoc: ["SLoc", "Storage Location"],
  pfUserAc: ["PF User Ac", "PF User Acc."],
  pfUserAccountableDescription: ["PF User Accountable Description", "PF User Ac. Desc."],
  pfPropMg: ["PF Prop.Mg"],
  pfPropMgmFocalPointDescription: ["PF Prop.Mgm Focal Point Description"],
  functionalLoc: ["Functional Loc."],
  functionalLocDescription: ["Description of functional location", "Functional Loc. Desc."],
  aGrp: ["AGrp"],
  busA: ["BusA", "Business Area"],
  objectType: ["ObjectType", "Object Type"],
  costCtr: ["Cost Ctr", "Cost Centre"],
  assignedTo: [
    "Assigned To",
    "PF User Ac. Desc.",
    "PF User Ac",
    "PF User Accountable Description",
    "PF Prop.Mg",
    "PF Prop.Mgm Focal Point Description",
  ],
  purchaseDate: ["Purchase Date", "Last PV date"],
  purchasePrice: ["Purchase Price", "Acq. Value (USD)", "AcquistnValue"],
  acquistnValue: ["AcquistnValue", "Acq. Value (USD)"],
  manufacturer: ["Manufacturer"],
  model: ["Model"],
  comment: ["Comment", "Asset Notes"],
};

const normalize = (value?: string | number | null) =>
  typeof value === "string" ? value.trim() : value;

export function ImportAssetsDialog({
  open,
  onOpenChange,
}: ImportAssetsDialogProps) {
  const [file, setFile] = React.useState<File | null>(null);
  const [preview, setPreview] = React.useState<CreateAssetInput[]>([]);
  const [isProcessing, setIsProcessing] = React.useState(false);
  const { mutateAsync: importAssets, isPending } = useImportAssets();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Validate file type
    if (
      !selectedFile.name.endsWith(".xlsx") &&
      !selectedFile.name.endsWith(".xls")
    ) {
      toast.error("Please select a valid Excel file (.xlsx or .xls)");
      return;
    }

    setFile(selectedFile);
    processExcelFile(selectedFile);
  };

  const processExcelFile = async (file: File) => {
    setIsProcessing(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: "array" });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];

      // Convert to JSON
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[];

      if (jsonData.length < 2) {
        toast.error("Excel file must have at least a header row and one data row");
        setIsProcessing(false);
        return;
      }

      // First row is headers
      const headers = jsonData[0] as string[];
      const dataRows = jsonData.slice(1);

      // Map Excel columns to asset properties
      const mappedAssets: CreateAssetInput[] = dataRows
        .filter((row) => row && row.some((cell: any) => cell !== null && cell !== undefined && cell !== ""))
        .map((row) => {
          const asset: CreateAssetInput = {};

          headers.forEach((rawHeader, index) => {
            const headerLabel = String(rawHeader ?? "").trim();
            const cellValue = row[index];

            const targetField = (Object.entries(HEADER_MAPPINGS) as [MappableField, string[]][]).find(
              ([, aliases]) =>
                headerLabel &&
                aliases.some(
                  (alias) => alias.toLowerCase() === headerLabel.toLowerCase()
                )
            )?.[0];

            if (!targetField || cellValue === undefined || cellValue === null || cellValue === "") {
              return;
            }

            if (targetField === "purchasePrice") {
              asset.purchasePrice =
                typeof cellValue === "number"
                  ? cellValue
                  : parseFloat(String(cellValue).replace(/[^0-9.-]+/g, "")) || undefined;
            } else if (targetField === "acquistnValue") {
              const parsedNumber =
                typeof cellValue === "number"
                  ? cellValue
                  : parseFloat(String(cellValue).replace(/[^0-9.-]+/g, ""));
              asset.acquistnValue = Number.isFinite(parsedNumber) ? parsedNumber : undefined;
            } else if (targetField === "purchaseDate") {
              if (typeof cellValue === "number") {
                const excelEpoch = new Date(1899, 11, 30);
                const date = new Date(excelEpoch.getTime() + cellValue * 86400000);
                asset.purchaseDate = date.toISOString().split("T")[0];
              } else {
                asset.purchaseDate = String(cellValue);
              }
            } else {
              const normalizedValue = normalize(cellValue);
              if (typeof normalizedValue === "string") {
                asset[targetField] = normalizedValue;
              } else if (normalizedValue !== null && normalizedValue !== undefined) {
                asset[targetField] = String(normalizedValue);
              }
            }
          });

          if (!asset.equipment && asset.assetTag) {
            asset.equipment = asset.assetTag;
          }
          if (!asset.assetTag && asset.equipment) {
            asset.assetTag = asset.equipment;
          }
          if (!asset.assetName) {
            asset.assetName =
              asset.materialDescription ||
              asset.description ||
              asset.material ||
              asset.equipment ||
              `Imported Asset ${Date.now()}`;
          }
          if (!asset.category) {
            asset.category = asset.objectType || asset.material || undefined;
          }
          if (!asset.location) {
            asset.location =
              asset.functionalLocDescription ||
              asset.functionalLoc ||
              asset.plnt ||
              undefined;
          }
          if (!asset.status) {
            asset.status = (asset.sysStatus as any) || undefined;
          }
          if (!asset.serialNumber) {
            asset.serialNumber = asset.manufSerialNumber || asset.techIdentNo || undefined;
          }
          if (!asset.purchasePrice && typeof asset.acquistnValue === "number") {
            asset.purchasePrice = asset.acquistnValue;
          }
          if (!asset.equipment) {
            asset.equipment = crypto.randomUUID();
          }
          if (!asset.assetTag) {
            asset.assetTag = asset.equipment;
          }

          // Ensure assetName is required
          if (!asset.assetName) {
            asset.assetName = asset.assetTag || `Imported Asset ${Date.now()}`;
          }

          return asset as CreateAssetInput;
        });

      setPreview(mappedAssets);

      if (mappedAssets.length === 0) {
        toast.error("No valid data found in Excel file");
      } else {
        toast.success(`Found ${mappedAssets.length} assets to import`);
      }
    } catch (error) {
      console.error("Error processing Excel file:", error);
      toast.error("Failed to process Excel file. Please check the format.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleImport = async () => {
    if (preview.length === 0) {
      toast.error("No assets to import");
      return;
    }

    try {
      await importAssets({ assets: preview });
      onOpenChange(false);
      setFile(null);
      setPreview([]);
    } catch (error) {
      // Error is handled by the mutation hook
      console.error("Import error:", error);
    }
  };

  const handleCancel = () => {
    setFile(null);
    setPreview([]);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Import Assets from Excel</DialogTitle>
          <DialogDescription>
            Upload an Excel file (.xlsx or .xls) to import assets. The first row should contain column headers.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="file-upload">Select Excel File</Label>
            <Input
              id="file-upload"
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileChange}
              disabled={isProcessing || isPending}
            />
            <p className="text-sm text-muted-foreground">
              Supported formats: .xlsx, .xls
            </p>
          </div>

          {isProcessing && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <IconLoader className="h-4 w-4 animate-spin" />
              Processing file...
            </div>
          )}

          {preview.length > 0 && (
            <div className="space-y-2">
              <Label>Preview ({preview.length} assets found)</Label>
              <div className="border rounded-md max-h-60 overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted sticky top-0">
                    <tr>
                      <th className="px-2 py-1 text-left">Equipment</th>
                      <th className="px-2 py-1 text-left">Material Description</th>
                      <th className="px-2 py-1 text-left">Functional Loc.</th>
                      <th className="px-2 py-1 text-left">SysStatus</th>
                    </tr>
                  </thead>
                  <tbody>
                    {preview.slice(0, 10).map((asset, index) => (
                      <tr key={index} className="border-t">
                        <td className="px-2 py-1">{asset.equipment || "N/A"}</td>
                        <td className="px-2 py-1">{asset.materialDescription || asset.description || "N/A"}</td>
                        <td className="px-2 py-1">{asset.functionalLocDescription || asset.functionalLoc || "N/A"}</td>
                        <td className="px-2 py-1">{asset.sysStatus || "N/A"}</td>
                      </tr>
                    ))}
                    {preview.length > 10 && (
                      <tr>
                        <td colSpan={4} className="px-2 py-1 text-center text-muted-foreground">
                          ... and {preview.length - 10} more
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="text-sm text-muted-foreground space-y-1">
            <p className="font-medium">Expected Excel columns (exact headers):</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Plnt</li>
              <li>Equipment (unique identifier)</li>
              <li>Material, Material Description</li>
              <li>TechIdentNo., Description</li>
              <li>ManufSerialNumber</li>
              <li>SysStatus, UserStatus</li>
              <li>SLoc, PF User Ac, PF User Accountable Description</li>
              <li>PF Prop.Mg, PF Prop.Mgm Focal Point Description</li>
              <li>Functional Loc., Description of functional location</li>
              <li>AGrp, BusA, ObjectType, Cost Ctr</li>
              <li>AcquistnValue, Comment</li>
            </ul>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleImport}
            disabled={preview.length === 0 || isPending || isProcessing}
          >
            {isPending ? (
              <>
                <IconLoader className="mr-2 h-4 w-4 animate-spin" />
                Importing...
              </>
            ) : (
              <>
                <IconUpload className="mr-2 h-4 w-4" />
                Import {preview.length} Assets
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

