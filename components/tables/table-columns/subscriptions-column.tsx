import { ColumnDef } from "@tanstack/react-table";
import { DragHandle } from "../DragHandle";

import { Checkbox } from "@/components/ui/checkbox";
import { MembershipPlan } from "@/app/(modules)/dashboard/membership-plans/types/membership-plans.types";
import { DropdownMenu, DropdownMenuItem, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { getStatusColor } from "@/shared/helpers/statusColor";
import { Badge } from "@/components/ui/badge";
import { IconChevronDown } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Role } from "@/app/(modules)/dashboard/types/gym-member";
import Link from "next/link";


export const getSubscriptionColumns = (role: Role): ColumnDef<MembershipPlan>[] => {
    const baseColumns: ColumnDef<MembershipPlan>[] = [
        {
            id: "drag",
            header: () => null,
            cell: ({ row }) => <DragHandle id={row.original.id} />,
          },
          {
            id: "select",
            header: ({ table }) => (
              <div className="flex items-center justify-center">
                  {/* todo handle the select logic for the column */}
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
            id: "name",
            header: "Name",
            accessorKey: "name",
            cell: ({ row }) => <p>{row.original.name}</p>,
            enableHiding: false,
          },
       
          {
            id: "price",
            header: "Price",
            accessorKey: "price",
            cell: ({ row }) => <p>{row.original.price}</p>,
            enableHiding: false,
          },
          {
            id: "duration",
            header: "Duration (Days)",
            accessorKey: "duration_days",
            cell: ({ row }) => <p>{row.original.duration_days}</p>,
            enableHiding: false,
          },
          {
            id: "features",
            header: "Features",
            accessorKey: "features",
            cell: ({ row }) =>
                // dropdown to show the features
                 <DropdownMenu>
                    <DropdownMenuTrigger className="flex items-center gap-2">

                    <Button variant="outline" className="flex items-center gap-2">
                        Features <IconChevronDown/>
                    </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56">
                        {row.original.features.map((feature) => (
                            <DropdownMenuItem key={feature}>{feature}</DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                 </DropdownMenu>,
            enableHiding: false,
          },
          // status is active, inactive, featured, private, new, best_value

        {
            id: "status",
            header: "Status",
            accessorKey: "status",
            cell: ({ row }) => <Badge className={`${getStatusColor(row.original.active ? "active" : "inactive")}`}>{row.original.active ? "Active" : "Inactive"}</Badge>,
            enableHiding: false,
          },
          {
            id:"private",
            header: "Private",
            accessorKey: "is_private",
            cell: ({ row }) => <Badge className={`${getStatusColor(row.original.is_private ? "active" : "inactive")}`}>{row.original.is_private ? "Yes" : "No"}</Badge>,
            enableHiding: false,
          },
          {
            id:"new",
            header: "New",
            accessorKey: "is_new",
            cell: ({ row }) => <Badge className={`${getStatusColor(row.original.is_new ? "active" : "inactive")}`}>{row.original.is_new ? "Yes" : "No"}</Badge>,
            enableHiding: false,
          },
          {
            id:"featured",
            header: "Featured",
            accessorKey: "is_featured",
            cell: ({ row }) => <Badge className={`${getStatusColor(row.original.is_featured ? "active" : "inactive")}`}>{row.original.is_featured ? "Yes" : "No"}</Badge>,
            enableHiding: false,
          },
          {
            id:"description",
            header: "Description",
            accessorKey: "description",
            cell: ({ row }) => <p>{row.original.description}</p>,
            enableHiding: false,
          },
    ]

    // Only add actions column for admin and superadmin roles
    if (role === 'admin' || role === 'superadmin') {
        baseColumns.push({
    id:"actions",
    header: "Actions",
    cell: ({ row }) => <Link href={`/dashboard/membership-plans/${row.original.id}`}><Button variant="outline">View</Button></Link>,
    enableHiding: false,
        });
}
   
    return baseColumns;
}