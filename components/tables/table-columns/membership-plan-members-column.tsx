import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuItem, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Eye, Users } from "lucide-react";
import { MembershipPlanMember } from "@/app/(modules)/dashboard/membership-plans/services/membership-plan-details.service";

export const getMembershipPlanMembersColumns = (): ColumnDef<MembershipPlanMember>[] => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'expired': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      case 'frozen': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return [
    {
      id: "member_id",
      header: "Member ID",
      accessorKey: "member_id",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{row.original.member_id}</span>
        </div>
      ),
      enableHiding: false,
    },
    {
      id: "start_date",
      header: "Start Date",
      accessorKey: "start_date",
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {formatDate(row.original.start_date)}
        </span>
      ),
      enableHiding: true,
      meta: {
        className: "hidden md:table-cell",
      },
    },
    {
      id: "end_date",
      header: "End Date",
      accessorKey: "end_date",
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {formatDate(row.original.end_date)}
        </span>
      ),
      enableHiding: true,
      meta: {
        className: "hidden md:table-cell",
      },
    },
    {
      id: "status",
      header: "Status",
      accessorKey: "status",
      cell: ({ row }) => (
        <Badge className={getStatusColor(row.original.status)}>
          {row.original.status}
        </Badge>
      ),
      enableHiding: false,
    },
    {
      id: "amount_paid",
      header: "Amount Paid",
      accessorKey: "amount_paid",
      cell: ({ row }) => (
        <span className="font-medium">
          {formatCurrency(row.original.amount_paid)}
        </span>
      ),
      enableHiding: true,
      meta: {
        className: "hidden lg:table-cell",
      },
    },
    {
      id: "frozen",
      header: "Frozen",
      accessorKey: "frozen",
      cell: ({ row }) => (
        row.original.frozen ? (
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            Yes
          </Badge>
        ) : (
          <span className="text-muted-foreground">No</span>
        )
      ),
      enableHiding: true,
      meta: {
        className: "hidden lg:table-cell",
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <Eye className="mr-2 h-4 w-4" />
              View Details
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
      enableHiding: false,
    },
  ];
};
