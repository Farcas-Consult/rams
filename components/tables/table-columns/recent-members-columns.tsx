import { ColumnDef } from "@tanstack/react-table";
import { recentRegisteredMember } from "@/app/(modules)/dashboard/types/staff-analytics-types";
import { Badge } from "@/components/ui/badge";
import { getStatusColor } from "@/shared/helpers/statusColor";
import { DragHandle } from "../DragHandle";


export const getRecentMembersColumns = (): ColumnDef<recentRegisteredMember>[] => {
  return [
    {
      id: "drag",
      header: () => null,
      cell: ({ row }) => <DragHandle id={row.original.id.toString()} />,
    },
    
    {
      id: "email",
      header: "Email",
      cell: ({ row }) => {
        return <div className="text-sm  py-2">{row.original.email}</div>;
      },
    },
    {
      id: "phone",
      header: "Phone",
      cell: ({ row }) => {
        return <div>{row.original.phone}</div>;
      },
    },
    {
      id: "status",
      header: "Status",
      cell: ({ row }) => {
        return <Badge  className={`${getStatusColor(row.original.status)}`}>{row.original.status}</Badge>;
      },
    },
    {
      id: "created_at",
      header: "Created At",
      cell: ({ row }) => {
        return <div>{row.original.created_at}</div>;
      },
    },
  ];
};