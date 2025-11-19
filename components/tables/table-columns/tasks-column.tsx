import { ColumnDef, Row } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Circle } from "lucide-react";
import { Task } from "@/app/(modules)/dashboard/types/tasks-types";

export const getTaskColumns = (): ColumnDef<Task>[] => {
  const columns: ColumnDef<Task>[] = [
    {
      id: "status",
      header: () => null,
      cell: ({ row }: { row: Row<Task> }) => (
        <Button
          variant="ghost"
          size="icon"
          // onClick={() => onToggleStatus(row.original.id)}
          className="cursor-pointer"
        >
          {row.original.status === "completed" ? (
            <CheckCircle className="h-5 w-5 text-green-500" />
          ) : (
            <Circle className="h-5 w-5 text-primary" />
          )}
        </Button>
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      id: "name",
      header: "Task",
      cell: ({ row }: { row: Row<Task> }) => (
        <div className="flex items-center gap-2">
          {row.original.name}
          <Badge
            variant={row.original.status === "completed" ? "outline" : "default"}
            className="ml-2"
          >
            {row.original.status}
          </Badge>
        </div>
      ),
      enableHiding: false,
    },
    {
      id: "description",
      header: "Description",
      cell: ({ row }: { row: Row<Task> }) => row.original.description,
      enableHiding: true,
      meta: {
        className: "hidden md:table-cell",
      },
    },
    {
      id: "date",
      header: "Date",
      cell: ({ row }: { row: Row<Task> }) => (
        <span className="text-muted-foreground">{row.original.date}</span>
      ),
      enableHiding: true,
      meta: {
        className: "hidden sm:table-cell",
      },
    },
  ];

  return columns;
}; 