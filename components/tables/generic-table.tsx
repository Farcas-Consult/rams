"use client";

import * as React from "react";
import {
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";

import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
  
  IconLayoutColumns,
  IconPlus,
} from "@tabler/icons-react";
import {
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";


import { DraggableRow } from "./draggable-row";
import { TableProps } from "./types";
import Link from "next/link";

import TableSkeleton from "../skeletons/table-skeleton";

export function GenericTable<T>({
  data,
  columns,
  pageCount = -1,
  initialSorting = [],
  initialFilters = [],
  initialVisibility = {},
  initialPageSize = 10,
  onRowClick,
  renderRow,
  pagination,
  pending,
  role,
  setPagination,
  tableType,
  tableFilters,
  withFilters = true,
  withPagination = true,
}: TableProps<T>) {
  const [sorting, setSorting] = React.useState<SortingState>(initialSorting);
  const [columnFilters, setColumnFilters] =
    React.useState<ColumnFiltersState>(initialFilters);
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>(initialVisibility);

  const [rowSelection, setRowSelection] = React.useState({});

  const sensors = useSensors(
    useSensor(MouseSensor),
    useSensor(TouchSensor),
    useSensor(KeyboardSensor)
  );
  const dataIds = React.useMemo(() => data.map((item, i) => String(i)), [data]); // use row id if available

  const sortableId = React.useId();

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      pagination,
      rowSelection,
    },
    manualPagination: true,
    pageCount: pageCount > 0 ? pageCount : undefined,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    onRowSelectionChange: setRowSelection,
    enableRowSelection: true,
    getRowId: (row: any, index) => String(row.id || index), // fallback to index if no id======================
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  });

  return (
    <>
      <Tabs
        defaultValue="visits"
        className="w-full flex-col justify-start gap-6 "
      >
        <div className="flex flex-wrap gap-3 @container/table-header items-center justify-between px-4 lg:px-6">
          <Label htmlFor="view-selector" className="sr-only">
            View
          </Label>
        
          {/* Left side - can be used for filters or other content */}
          <div className="flex items-center gap-2">
            {/* Placeholder for future left-side content */}
          </div>

          {/* Right side - Customize Columns and Add buttons */}
          <div className="flex items-center gap-2">
            <DropdownMenu >
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <IconLayoutColumns />
                  <span className="hidden lg:inline">Customize Columns</span>
                  <span className="lg:hidden">Columns</span>
                  <IconChevronDown />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {table
                  .getAllColumns()
                  .filter(
                    (column) =>
                      typeof column.accessorFn !== "undefined" &&
                      column.getCanHide()
                  )
                  .map((column) => {
                    return (
                      <DropdownMenuCheckboxItem
                        key={column.id}
                        className="capitalize"
                        checked={column.getIsVisible()}
                        onCheckedChange={(value) =>
                          column.toggleVisibility(!!value)
                        }
                      >
                        {column.id}
                      </DropdownMenuCheckboxItem>
                    );
                  })}
              </DropdownMenuContent>
            </DropdownMenu>

            {/*  Button with a link  to the form  based on the tableType*/}
            {
              tableType === "member" ? (
                <Button asChild>
                  <Link href="/dashboard/members/new">
                    <IconPlus />
                    Add Gym Member
                  </Link>
                </Button>
              ): tableType === "staff" ? (
                <Button asChild>
                  <Link href="/dashboard/staff/new">
                    <IconPlus />
                    Add Staff
                  </Link>
                </Button>
              ) : tableType === "subscription_plan" && (role === 'admin' || role === 'superadmin') ? (
                <Button asChild>
                  <Link href="/dashboard/membership-plans/new">
                    <IconPlus />
                    Add Subscription Plan
                  </Link>
                </Button>
              ) : tableType === "gym_class" ? (
                <Button asChild>
                  <Link href="/dashboard/classes/new">
                    <IconPlus />
                    Add Gym Class
                  </Link>
                </Button>
              ) : tableType === "locker_plan" && (role === 'admin' || role === 'superadmin') ? (
                <Button asChild>
                  <Link href="/dashboard/lockers/plans/new">
                    <IconPlus />
                    Add Locker Plan
                  </Link>
                </Button>
              ) : tableType === "users" && (role === 'admin' || role === 'superadmin') ? (
                <Button asChild>
                  <Link href="/dashboard/users/new">
                    <IconPlus />
                    Add User
                  </Link>
                </Button>
              ) : tableType === "assets" && (role === 'admin' || role === 'superadmin') ? (
                <Button asChild>
                  <Link href="/dashboard/assets/new">
                    <IconPlus />
                    Add Asset
                  </Link>
                </Button>
              ) : null
            }  
          </div>
        </div>
        {
          pending ?(
            <TableSkeleton/>
          ):(<div
            className="relative    flex flex-col gap-4 overflow-auto  "
          >
            <div
              className={` ${
                pending && "border-dashed min-h-[50dvh]"
              } overflow-hidden rounded-lg border`}
            >
              <DndContext
                collisionDetection={closestCenter}
                modifiers={[restrictToVerticalAxis]}
                sensors={sensors}
                id={sortableId}
              >
                <Table>
                  <TableHeader className="bg-muted sticky top-0 z-10">
                    {table.getHeaderGroups().map((headerGroup) => (
                      <TableRow key={headerGroup.id}>
                        {headerGroup.headers.map((header) => {
                          return (
                            <TableHead key={header.id} colSpan={header.colSpan}>
                              {header.isPlaceholder
                                ? null
                                : flexRender(
                                    header.column.columnDef.header,
                                    header.getContext()
                                  )}
                            </TableHead>
                          );
                        })}
                      </TableRow>
                    ))}
                  </TableHeader>
                  <TableBody className="**:data-[slot=table-cell]:first:w-8">
                    {table.getRowModel().rows?.length ? (
                      <SortableContext
                        items={dataIds}
                        strategy={verticalListSortingStrategy}
                      >
                        {table.getRowModel().rows.map((row) => (
                          <DraggableRow key={row.id} row={row} />
                        ))}
                      </SortableContext>
                    ) : (
                      <TableRow className="">
                        <TableCell
                          colSpan={columns.length}
                          className="h-24 text-center"
                        >
                          {pending ? (
                            <div className="">
                              <p className="animate-pulse">Loading ...</p>
                            </div>
                          ) : (
                            "No results."
                          )}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </DndContext>
            </div>

            {withPagination && (
              <div className="flex items-center justify-between px-4 ">
              <div className="text-muted-foreground hidden flex-1 text-sm lg:flex">
                {table.getFilteredSelectedRowModel().rows.length} of{" "}
                {table.getFilteredRowModel().rows.length} row(s) selected.
              </div>
              <div className="flex w-full items-center gap-8 lg:w-fit">
                <div className="hidden items-center gap-2 lg:flex">
                  <Label htmlFor="rows-per-page" className="text-sm font-medium">
                    Rows per page
                  </Label>
                  <Select
                    value={`${table.getState().pagination.pageSize}`}
                    onValueChange={(value) => {
                      table.setPageSize(Number(value));
                    }}
                  >
                    <SelectTrigger size="sm" className="w-20" id="rows-per-page">
                      <SelectValue
                        placeholder={table.getState().pagination.pageSize}
                      />
                    </SelectTrigger>
                    <SelectContent side="top">
                      {[10, 20, 30, 40, 50].map((pageSize) => (
                        <SelectItem key={pageSize} value={`${pageSize}`}>
                          {pageSize}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex w-fit items-center justify-center text-sm font-medium " >
                  Page {table.getState().pagination.pageIndex + 1} of{" "}
                  {table.getPageCount()}
                </div>
                <div className="ml-auto flex items-center gap-2 lg:ml-0">
                  <Button
                    variant="outline"
                    className="hidden h-8 w-8 p-0 lg:flex"
                    onClick={() => table.setPageIndex(0)}
                    disabled={!table.getCanPreviousPage()}
                  >
                    <span className="sr-only">Go to first page</span>
                    <IconChevronsLeft />
                  </Button>
                  <Button
                    variant="outline"
                    className="size-8"
                    size="icon"
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                  >
                    <span className="sr-only">Go to previous page</span>
                    <IconChevronLeft />
                  </Button>
                  <Button
                    variant="outline"
                    className="size-8"
                    size="icon"
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                  >
                    <span className="sr-only">Go to next page</span>
                    <IconChevronRight />
                  </Button>
                  <Button
                    variant="outline"
                    className="hidden size-8 lg:flex"
                    size="icon"
                    onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                    disabled={!table.getCanNextPage()}
                  >
                    <span className="sr-only">Go to last page</span>
                    <IconChevronsRight />
                  </Button>
                </div>
              </div>
            </div>
            )}
          </div>)
        }
       
       
       
      </Tabs>
    </>
  );
}
