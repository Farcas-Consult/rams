import { ColumnDef } from "@tanstack/react-table";
import { DragHandle } from "../DragHandle";

import { Checkbox } from "@/components/ui/checkbox";
import { LockerSubscriptionPlan } from "@/app/(modules)/dashboard/lockers/services/membership-plans.service";
import { DropdownMenu, DropdownMenuItem, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { getStatusColor } from "@/shared/helpers/statusColor";
import { Badge } from "@/components/ui/badge";
import { IconChevronDown, IconEye, IconEdit, IconTrash } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Role } from "@/app/(modules)/dashboard/types/gym-member";
import Link from "next/link";
import { format } from "date-fns";
import { useBranchSelection } from "@/hooks/use-branch-selection";

export const getLockerPlansColumns = (role: Role): ColumnDef<LockerSubscriptionPlan>[] => {
    const { getBranchCurrency } = useBranchSelection();
    const baseColumns: ColumnDef<LockerSubscriptionPlan>[] = [
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
            id: "name",
            header: "Name",
            accessorKey: "name",
            cell: ({ row }) => <p className="font-medium">{row.original.name}</p>,
            enableHiding: false,
        },
        {
            id: "description",
            header: "Description",
            accessorKey: "description",
            cell: ({ row }) => (
                <p className="text-muted-foreground max-w-[200px] truncate">
                    {row.original.description || 'No description'}
                </p>
            ),
        },
        {
            id: "price",
            header: "Price",
            accessorKey: "price",
            cell: ({ row }) => {
                return (
                    <p className="font-medium">
                        {getBranchCurrency()} {row.original.price.toLocaleString()}
                    </p>
                );
            },
            enableHiding: false,
        },
        {
            id: "duration",
            header: "Duration",
            accessorKey: "duration_days",
            cell: ({ row }) => {
                const days = row.original.duration_days;
                let displayText = '';
                
                if (days === 1) displayText = "1 day";
                else if (days < 7) displayText = `${days} days`;
                else if (days < 30) displayText = `${Math.round(days / 7)} weeks`;
                else if (days < 365) displayText = `${Math.round(days / 30)} months`;
                else displayText = `${Math.round(days / 365)} years`;
                
                return <p>{displayText}</p>;
            },
            enableHiding: false,
        },
        {
            id: "size",
            header: "Size",
            accessorKey: "size",
            cell: ({ row }) => (
                row.original.size ? (
                    <Badge variant="outline">{row.original.size}</Badge>
                ) : (
                    <span className="text-muted-foreground">-</span>
                )
            ),
        },
        {
            id: "locker_type",
            header: "Type",
            accessorKey: "locker_type",
            cell: ({ row }) => (
                row.original.locker_type ? (
                    <Badge variant="secondary">{row.original.locker_type}</Badge>
                ) : (
                    <span className="text-muted-foreground">-</span>
                )
            ),
        },
        {
            id: "features",
            header: "Features",
            accessorKey: "features",
            cell: ({ row }) =>
                row.original.features && row.original.features.length > 0 ? (
                    <DropdownMenu>
                        <DropdownMenuTrigger className="flex items-center gap-2">
                            <Button variant="outline" size="sm" className="flex items-center gap-2">
                                Features <IconChevronDown className="h-3 w-3"/>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56">
                            {row.original.features.map((feature, index) => (
                                <DropdownMenuItem key={index}>{feature}</DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                ) : (
                    <span className="text-muted-foreground">-</span>
                ),
        },
        {
            id: "status",
            header: "Status",
            accessorKey: "is_active",
            cell: ({ row }) => (
                <Badge className={`${getStatusColor(row.original.is_active ? "active" : "inactive")}`}>
                    {row.original.is_active ? "Active" : "Inactive"}
                </Badge>
            ),
            enableHiding: false,
        },
        {
            id: "created_at",
            header: "Created",
            accessorKey: "created_at",
            cell: ({ row }) => (
                <p className="text-muted-foreground">
                    {format(new Date(row.original.created_at), 'MMM dd, yyyy')}
                </p>
            ),
        },
    ];

    // Only add actions column for admin and superadmin roles
    if (role === 'admin' || role === 'superadmin') {
        baseColumns.push({
            id: "actions",
            header: "Actions",
            cell: ({ row }) => (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                            <IconChevronDown className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                            <Link href={`/dashboard/lockers/plans/${row.original.id}`}>
                                <IconEye className="h-4 w-4 mr-2" />
                                View Details
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link href={`/dashboard/lockers/plans/${row.original.id}/edit`}>
                                <IconEdit className="h-4 w-4 mr-2" />
                                Edit Plan
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                            <IconTrash className="h-4 w-4 mr-2" />
                            Delete Plan
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            ),
            enableHiding: false,
        });
    }

    return baseColumns;
};
