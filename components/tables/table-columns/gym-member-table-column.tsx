
import { Checkbox } from "@/components/ui/checkbox";
import { ColumnDef } from "@tanstack/react-table";
import { DragHandle } from "@/components/tables/components/drag-handle";

import { Badge } from "@/components/ui/badge";


import { getStatusColor } from "@/shared/helpers/statusColor";
import GymMemberCellViewer from "../components/gym-member-cell-viewer";
import { MembershipStatus } from "@/app/(modules)/dashboard/membership-plans/types/gym-types";
import { Role } from "@/app/(modules)/dashboard/types/gym-member";
import { GymMember } from "@/app/(modules)/dashboard/types/gym-member";
import Image from "next/image";
import { generateUserAvatar } from "@/shared/helpers/generate-avatars";
export const getUserColumns = (role: Role): ColumnDef<GymMember>[] => {
  const baseColumns: ColumnDef<GymMember>[] = [
    {
      id: "drag",
      header: () => null,
      cell: ({ row }) => <DragHandle id={row.original.user_id} />,
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
    //  add Image column USE THE USER AVATAR
    {
      accessorKey: "image",
      header: "Image",
      cell: ({ row }) => {
        const avatar = generateUserAvatar(row.original.user_id, row.original.gender as "male" | "female");
        return (
          <div className="flex items-center  justify-center h-[44px] w-[44px] ">
            <Image src={ row.original.profile_picture ?? avatar} alt={row.original.first_name} width={44} height={44} className="rounded"/>
          </div>
        )
      },
      enableHiding: false,
    },
    {
        accessorKey: "first_name",
      header: "Name",
      cell: ({ row }) => <GymMemberCellViewer user={row.original} role={role} />,
      enableHiding: false,
    },
    {
        accessorKey: "last_name",
        header: "Last Name",
        cell: ({ row }) => <p>{row.original.last_name}</p>,
        enableHiding: false,
      },

    
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => (
        <p className="text-muted-foreground px-1.5">{row.original.email}</p>
      ),
    },
    {
      accessorKey: "phone_number",
      header: "Phone Number",
      cell: ({ row }) => (
        <div className="px-1.5">
          <p className="uppercase px-1.5">{row.original.phone_number}</p>
        </div>
      ),
    },
    {
        accessorKey: "gender",
        header: "Gender",
        cell: ({ row }) => <p>{row.original.gender}</p>,
        enableHiding: false,
      },
   
    
  ];
  const extraColumns: ColumnDef<GymMember>[] = [];
  if (role === "member") {
    extraColumns.push({
      accessorKey: "membership_plan",
      header: "Membership Plan",
      cell: ({ row }) => (
        <div className="px-1.5">
          {row.original.membership_plan}
        </div>
      ),
    });
  
      extraColumns.push({
        accessorKey: "membership_status",
        header: "Membership Status",
        cell: ({ row }) => <Badge className={`${getStatusColor(row.original.membership_status)}`}>{row.original.membership_status}</Badge>,
      });
    
  }


  //  staff  extra columns    position,specialization, status, 
  if (role === "staff") {
    extraColumns.push({
      accessorKey: "position",
      header: "Position",
      cell: ({ row }) => <p>{row.original.position}</p>,
    });
    extraColumns.push({
      accessorKey: "specialization",
      header: "Specialization",
      cell: ({ row }) => <p>{row.original.specialization}</p>,
    });
    extraColumns.push({
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <Badge className={`${getStatusColor(row.original.status as MembershipStatus)}`}>{row.original.status}</Badge>,
    });
    
  }

  

  return [...baseColumns, ...extraColumns, ];
};
