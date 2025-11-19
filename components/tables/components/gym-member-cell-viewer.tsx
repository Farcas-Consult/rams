
import React from "react";
import { TableCellViewer } from "../TableCellViewer";

import { userFormFields } from "../drawerFormFields";

import { GymMemberSchema } from "@/app/(modules)/dashboard/schema/user-zod-schema";
import { GymMember, Role } from "@/app/(modules)/dashboard/types/gym-member";




function GymMemberCellViewer({ user,role }: { user: GymMember ,role?:Role}) {
  //  handle submit

 
  return (
    <>
      
      <TableCellViewer
        item={user}
        userId={user.user_id}
        schema={GymMemberSchema}
        formFields={userFormFields}
        titleKey={"first_name"}
        onSubmit={() => {}}
        pending={false}
        role={role}
      />
    </>
  );
}

export default GymMemberCellViewer;
