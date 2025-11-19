"use client";

import { UserForm } from "../components/user-form";

export default function NewUserPage() {
  return (
    <div className="container mx-auto py-6 px-4 lg:px-6">
      <UserForm mode="create" />
    </div>
  );
}

