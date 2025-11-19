import { Checkbox } from "@/components/ui/checkbox";
import { ColumnDef } from "@tanstack/react-table";
import { DragHandle } from "@/components/tables/components/drag-handle";
import { Badge } from "@/components/ui/badge";
import {  getClassStatusColor } from "@/shared/helpers/statusColor";
import { GymClass } from "@/app/(modules)/dashboard/classes/types/classes-types";
import { Role } from "@/app/(modules)/dashboard/types/gym-member";

// Define the GymClass type based on the form values


export const getClassColumns = (role:Role ): ColumnDef<GymClass>[] => {
  const columns: ColumnDef<GymClass>[] = [
    {
      id: "drag",
      header: () => null,
      cell: ({ row }) => <DragHandle id={row.original.id} />,
    },
    {
      id: "select",
      header: ({ table }) => (
        <div className="flex items-center justify-center">
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={(value) =>
              table.toggleAllPageRowsSelected(!!value)
            }
            aria-label="Select all"
          />
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex items-center justify-center">
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
          />
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "name",
      header: "Class Name",
      cell: ({ row }) => (
        <div className="font-medium">{row.original.name}</div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge className={`${getClassStatusColor(row.original.status)}`}>
          {row.original.status.charAt(0).toUpperCase() + row.original.status.slice(1)}
        </Badge>
      ),
    },
    {
      accessorKey: "capacity",
      header: "Capacity",
      cell: ({ row }) => row.original.capacity,
    },
    {
      accessorKey: "price",
      header: "Price (KES)",
      cell: ({ row }) => (
        <div className="font-medium">
          KES {row.original.price.toLocaleString()}
        </div>
      ),
    },
    {
      accessorKey: "duration",
      header: "Duration",
      cell: ({ row }) => `${row.original.duration} mins`,
    },
    {
      accessorKey: "schedule",
      header: "Schedule",
      cell: ({ row }) => {
        const schedules = row.original.schedule;
        const firstSchedule = schedules[0];
        return (
          <div className="flex flex-col">
            <span className="text-sm font-medium">
              {firstSchedule.day_of_week}
            </span>
            <span className="text-sm text-muted-foreground">
              {firstSchedule.start_time} - {firstSchedule.end_time}
            </span>
            {schedules.length > 1 && (
              <span className="text-xs text-muted-foreground">
                +{schedules.length - 1} more schedules
              </span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => (
        <div className="max-w-[200px] truncate" title={row.original.description}>
          {row.original.description}
        </div>
      ),
    },
  ];

  return [...columns]
}; 