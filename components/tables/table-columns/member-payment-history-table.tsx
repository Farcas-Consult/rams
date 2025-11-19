import { ColumnDef } from "@tanstack/react-table";
import { PaymentHistory } from "@/app/(modules)/dashboard/members/[id]/members/types/user-membership-types";
import { getPaymentHistoryStatusColor } from "@/shared/helpers/statusColor";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { DragHandle } from "../DragHandle";

export const getPaymentHistoryColumns = (): ColumnDef<PaymentHistory>[] => {
    return [
        {
            id: "drag",
            header: () => null,
            cell: ({ row }) => <DragHandle id={row.original.id.toString()} />,
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
            header: "Date",
            accessorKey: "date",
        },
        {
            header: "Name",
            accessorKey: "name",
        },
        {
            header: "Amount",
            accessorKey: "amount",
        },
        {
            header: "Status",
            accessorKey: "status",
            cell: ({ row }) => <Badge className={`${getPaymentHistoryStatusColor(row.original.status)}`}>{row.original.status}</Badge>,
        },
    ]
}   