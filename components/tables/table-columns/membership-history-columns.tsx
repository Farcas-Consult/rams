import { ColumnDef } from "@tanstack/react-table";
import { MembershipHistory } from "@/app/(modules)/dashboard/members/[id]/members/types/user-membership-types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { getPaymentHistoryStatusColor, getStatusColor } from "@/shared/helpers/statusColor";
import { DragHandle } from "../DragHandle";
import { Checkbox } from "@/components/ui/checkbox";
import { MoreHorizontal, Snowflake, Play, XCircle } from "lucide-react";
import { useCurrency } from '@/hooks/use-currency';

export interface MembershipActionsHandlers {
  onFreeze?: (subscriptionId: string) => void;
  onUnfreeze?: (subscriptionId: string) => void;
  onCancel?: (subscriptionId: string) => void;
}

export const getMembershipHistoryColumns = (
  handlers?: MembershipActionsHandlers
): ColumnDef<MembershipHistory>[] => {
  // Get currency from Redux store using custom hook
  const currency = useCurrency();
    
    return [
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
            header: "Plan Name",
            accessorKey: "plan_name",
        },
        {
            header: "Start Date",
            accessorKey: "start_date",
        },
        {
            header: "End Date",
            accessorKey: "end_date",
        },
        {
            header: "Original Amount",
            accessorKey: "original_amount",
            cell: ({ row }) => {
                const subscription = row.original;
                // Use amount_paid as the original amount (what was actually paid)
                const originalAmount = subscription.amount;
                return <span className="font-medium">{currency}{originalAmount.toLocaleString()}</span>;
            },
        },
        {
            header: "Discount",
            accessorKey: "promo_discount",
            cell: ({ row }) => {
                const subscription = row.original;
                const discount = subscription.promo_discount || 0;
                const hasPromo = subscription.promo_code && discount > 0;
                
                if (hasPromo) {
                    return (
                        <div className="space-y-1">
                            <div className="text-red-600 font-medium">
                                -{currency}{discount.toLocaleString()}
                            </div>
                            <div className="text-xs text-muted-foreground">
                                ({subscription.promo_code})
                            </div>
                        </div>
                    );
                }
                
                return <span className="text-muted-foreground">{currency}0</span>;
            },
        },
        {
            header: "Final Amount",
            accessorKey: "amount",
            cell: ({ row }) => {
                const subscription = row.original;
                // Use amount_paid as the base, subtract discount to get final amount
                const originalAmount = subscription.amount;
                const discount = subscription.promo_discount || 0;
                const finalAmount = originalAmount - discount;
                return <span className="font-semibold text-green-600">{currency}{finalAmount.toLocaleString()}</span>;
            },
        },
        {
            header: "Status",
            accessorKey: "status",
            cell: ({ row }) => <Badge className={`${getStatusColor(row.original.status )}`}>{row.original.status}</Badge>,
        },
        {
            id: "actions",
            header: "Actions",
            cell: ({ row }) => {
                const subscription = row.original;
                const canFreeze = subscription.status === 'active';
                const canUnfreeze = subscription.status === 'frozen';
                // Can cancel any subscription except expired and already cancelled
                const canCancel = !['expired', 'cancelled'].includes(subscription.status);

                // If no actions available, return empty cell
                if (!canFreeze && !canUnfreeze && !canCancel) {
                    return null;
                }

                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            
                            {canFreeze && handlers?.onFreeze && (
                                <DropdownMenuItem 
                                    onClick={() => handlers.onFreeze?.(subscription.id)}
                                    className="cursor-pointer"
                                >
                                    <Snowflake className="mr-2 h-4 w-4" />
                                    Freeze Membership
                                </DropdownMenuItem>
                            )}
                            
                            {canUnfreeze && handlers?.onUnfreeze && (
                                <DropdownMenuItem 
                                    onClick={() => handlers.onUnfreeze?.(subscription.id)}
                                    className="cursor-pointer"
                                >
                                    <Play className="mr-2 h-4 w-4" />
                                    Unfreeze Membership
                                </DropdownMenuItem>
                            )}
                            
                            {canCancel && handlers?.onCancel && (
                                <DropdownMenuItem 
                                    onClick={() => handlers.onCancel?.(subscription.id)}
                                    className="cursor-pointer text-destructive"
                                >
                                    <XCircle className="mr-2 h-4 w-4" />
                                    Cancel Subscription
                                </DropdownMenuItem>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                );
            },
        },
    ]
}
