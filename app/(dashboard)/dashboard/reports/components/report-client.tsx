"use client";

import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import * as XLSX from "xlsx";
import { IconAdjustmentsHorizontal, IconDownload, IconRefresh } from "@tabler/icons-react";

import { GenericTable } from "@/components/tables/generic-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { AssetReportColumn, AssetReportRow } from "../lib/get-asset-report";
import { ReportAnalytics } from "./report-analytics";
import { ReportRecordDrawer } from "./report-record-drawer";

type ReportClientProps = {
  columns: AssetReportColumn[];
  rows: AssetReportRow[];
};

const LABELS = {
  equipmentNo: "Equip No.",
  description: "Description",
  locationUmoja: "Loc. in UMOJA",
  lastInventory: "Last inventory",
  seenOperation: "Seen Operation",
  direction: "Direction",
  systemStatus: "System status",
  userStatus: "User status",
  functionalLoc: "Functional Loc.",
  mission: "Mission",
  accessGroup: "Access Group",
  businessArea: "Business Area",
  acquisitionValue: "Acq. Value (USD)",
} as const;

const downloadFilename = () =>
  `rams-asset-report-${new Date().toISOString().split("T")[0]}.xlsx`;

const primaryColumnLabels = [
  "Equip No.",
  "Description",
  "Loc. in UMOJA",
  "Description (RAMS)",
  "Mission",
  "System status",
  "Acq. Value (USD)",
] as const;

const buildColumnDefs = (
  columns: AssetReportColumn[],
  columnMap: Record<keyof typeof LABELS, string | undefined>
): ColumnDef<AssetReportRow>[] => {
  const currencyKey = columnMap.acquisitionValue;
  return columns
    .filter((column) => primaryColumnLabels.includes(column.label as (typeof primaryColumnLabels)[number]))
    .map((column) => {
      if (column.label === "Equip No.") {
        return {
          id: column.key,
          accessorKey: column.key,
          header: column.label,
          cell: ({ row }) => (
            <ReportRecordDrawer
              triggerLabel={row.original[column.key] || "—"}
              record={row.original}
              columns={columns}
            />
          ),
        } as ColumnDef<AssetReportRow>;
      }

      return {
        id: column.key,
        accessorKey: column.key,
        header: column.label,
        cell: ({ row }) => {
          const value = row.original[column.key];
          if (currencyKey && column.key === currencyKey) {
            const amount = Number(value);
            const formatted = Number.isFinite(amount)
              ? Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: "USD",
                  maximumFractionDigits: 0,
                }).format(amount)
              : value;
            return <span className="font-medium">{formatted || "—"}</span>;
          }
          return (
            <div className="min-w-[140px] whitespace-pre-wrap text-sm">
              {value?.toString().trim() || "—"}
            </div>
          );
        },
      } as ColumnDef<AssetReportRow>;
    });
};

const getColumnKey = (columns: AssetReportColumn[], label: string) =>
  columns.find((col) => col.label === label)?.key;

const getUniqueValues = (rows: AssetReportRow[], key?: string) => {
  if (!key) return [];
  const values = new Set(
    rows
      .map((row) => row[key]?.trim())
      .filter((value): value is string => Boolean(value && value.length > 0))
  );
  return Array.from(values).sort((a, b) => a.localeCompare(b));
};

export function ReportClient({ columns, rows }: ReportClientProps) {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [filters, setFilters] = React.useState({
    direction: "all",
    mission: "all",
    systemStatus: "all",
    userStatus: "all",
    accessGroup: "all",
    businessArea: "all",
    seenOperation: "all",
  });

  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [filtersOpen, setFiltersOpen] = React.useState(false);

  const columnMap = React.useMemo(() => {
    return Object.fromEntries(
      Object.entries(LABELS).map(([key, label]) => [
        key,
        getColumnKey(columns, label),
      ])
    ) as Record<keyof typeof LABELS, string | undefined>;
  }, [columns]);

  const columnDefs = React.useMemo(() => buildColumnDefs(columns, columnMap), [columns, columnMap]);

  const filterOptions = React.useMemo(() => {
    const pick = (key: keyof typeof LABELS) =>
      getUniqueValues(rows, columnMap[key]);
    return {
      direction: pick("direction"),
      mission: pick("mission"),
      systemStatus: pick("systemStatus"),
      userStatus: pick("userStatus"),
      accessGroup: pick("accessGroup"),
      businessArea: pick("businessArea"),
      seenOperation: pick("seenOperation"),
    };
  }, [rows, columnMap]);

  const filteredRows = React.useMemo(() => {
    const searchableColumns = [
      columnMap.equipmentNo,
      columnMap.description,
      columnMap.locationUmoja,
      columnMap.functionalLoc,
    ].filter(Boolean) as string[];

    return rows.filter((row) => {
      const matchesSearch =
        !searchQuery ||
        searchableColumns.some((key) =>
          row[key].toLowerCase().includes(searchQuery.toLowerCase())
        );

      const matchSelect = (filterKey: keyof typeof filters, columnKey?: string) => {
        if (!columnKey || filters[filterKey] === "all") return true;
        const value = row[columnKey]?.trim() || "Unspecified";
        return value === filters[filterKey];
      };

      return (
        matchesSearch &&
        matchSelect("direction", columnMap.direction) &&
        matchSelect("mission", columnMap.mission) &&
        matchSelect("systemStatus", columnMap.systemStatus) &&
        matchSelect("userStatus", columnMap.userStatus) &&
        matchSelect("accessGroup", columnMap.accessGroup) &&
        matchSelect("businessArea", columnMap.businessArea) &&
        matchSelect("seenOperation", columnMap.seenOperation)
      );
    });
  }, [rows, searchQuery, filters, columnMap]);

  const pageCount = React.useMemo(
    () => Math.max(1, Math.ceil(filteredRows.length / pagination.pageSize)),
    [filteredRows.length, pagination.pageSize]
  );

  const paginatedRows = React.useMemo(() => {
    const start = pagination.pageIndex * pagination.pageSize;
    return filteredRows.slice(start, start + pagination.pageSize);
  }, [filteredRows, pagination.pageIndex, pagination.pageSize]);

  React.useEffect(() => {
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  }, [searchQuery, filters]);

  const handleFilterChange = (key: keyof typeof filters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters({
      direction: "all",
      mission: "all",
      systemStatus: "all",
      userStatus: "all",
      accessGroup: "all",
      businessArea: "all",
      seenOperation: "all",
    });
    setSearchQuery("");
  };

  const handleDownload = () => {
    const aoa = [
      columns.map((column) => column.label),
      ...filteredRows.map((row) => columns.map((column) => row[column.key] ?? "")),
    ];
    const worksheet = XLSX.utils.aoa_to_sheet(aoa);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Asset Report");
    XLSX.writeFile(workbook, downloadFilename());
  };

  return (
    <div className="space-y-6">
      <ReportAnalytics
        rows={filteredRows}
        metricKeys={{
          acquisitionValue: columnMap.acquisitionValue,
          systemStatus: columnMap.systemStatus,
          mission: columnMap.mission,
          direction: columnMap.direction,
        }}
      />

      <div className="flex flex-col gap-4 rounded-xl border border-border/70 bg-card/40 p-4 lg:flex-row lg:items-end">
        <div className="flex min-w-[260px] flex-1 flex-col gap-1">
          <Label htmlFor="report-search">Search</Label>
          <Input
            id="report-search"
            placeholder="Equip No., Description, Functional Location..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={resetFilters}>
            <IconRefresh className="mr-2 h-4 w-4" />
            Reset
          </Button>
          <Dialog open={filtersOpen} onOpenChange={setFiltersOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <IconAdjustmentsHorizontal className="mr-2 h-4 w-4" />
                Filters
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-3xl">
              <DialogHeader>
                <DialogTitle>Report Filters</DialogTitle>
                <DialogDescription>
                  Refine the downloadable report and table results. Changes apply immediately.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 md:grid-cols-2">
                {(
                  [
                    { key: "direction", label: "Direction", placeholder: "All Direction" },
                    { key: "mission", label: "Mission", placeholder: "All Missions" },
                    { key: "systemStatus", label: "System status", placeholder: "All System status" },
                    { key: "userStatus", label: "User status", placeholder: "All User status" },
                    { key: "accessGroup", label: "Access Group", placeholder: "All Access Groups" },
                    { key: "businessArea", label: "Business Area", placeholder: "All Business Areas" },
                    { key: "seenOperation", label: "Seen Operation", placeholder: "All Seen Operations" },
                  ] as const
                ).map((filter) => (
                  <div key={filter.key} className="flex flex-col gap-1">
                    <Label className="text-sm font-medium">{filter.label}</Label>
                    <Select
                      value={filters[filter.key]}
                      onValueChange={(value) => handleFilterChange(filter.key, value)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder={filter.placeholder} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">{filter.placeholder}</SelectItem>
                        {filterOptions[filter.key].map((option) => (
                          <SelectItem key={option} value={option}>
                            {option || "Unspecified"}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setFiltersOpen(false)}>
                  Done
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Button onClick={handleDownload}>
            <IconDownload className="mr-2 h-4 w-4" />
            Download Filtered Report
          </Button>
        </div>
      </div>

      <GenericTable
        data={paginatedRows}
        columns={columnDefs}
        pageCount={pageCount}
        pagination={pagination}
        setPagination={setPagination}
        pending={false}
        tableType="reports"
        withFilters={false}
        initialPageSize={pagination.pageSize}
      />
    </div>
  );
}


