# Generic Table Architecture Documentation

## Overview

This document explains how to use the Generic Table component and create column definitions for the RAMS Asset Management system.

## Architecture Pattern

Each feature/module follows this structure:

```
dashboard/
├── users/
│   ├── page.tsx          # Main page component
│   ├── services/         # API service functions
│   ├── hooks/           # Custom React hooks
│   ├── types/           # TypeScript type definitions
│   ├── schemas/         # Zod validation schemas
│   └── components/      # Feature-specific components
```

## Generic Table Component

The `GenericTable` component is located at `components/tables/generic-table.tsx` and provides:

- **Sorting**: Column-based sorting
- **Filtering**: Column-based filtering
- **Pagination**: Server-side or client-side pagination
- **Column Visibility**: Show/hide columns
- **Row Selection**: Checkbox selection
- **Drag & Drop**: Reorder rows (optional)
- **Loading States**: Skeleton loading states

### Table Props

```typescript
type TableProps<T> = {
  data: T[];                    // Array of data items
  columns: ColumnDef<T>[];      // Column definitions
  pageCount?: number;          // Total pages (for server-side pagination)
  pagination: {                  // Current pagination state
    pageIndex: number;
    pageSize: number;
  };
  setPagination: React.Dispatch<...>;  // Pagination setter
  initialSorting?: SortingState;
  initialFilters?: ColumnFiltersState;
  initialVisibility?: VisibilityState;
  initialPageSize?: number;
  role: Role;                   // User role for permissions
  onRowClick?: (row: Row<T>) => void;
  renderRow?: (row: Row<T>, props: {...}) => React.ReactNode;
  pending: boolean;             // Loading state
  tableType?: TableTypes;       // Table type identifier
  tableFilters?: string[];      // Available filters
  withFilters?: boolean;         // Enable/disable filters
  withPagination?: boolean;      // Enable/disable pagination
};
```

## Column Definition Pattern

Columns are defined as **custom hooks** that return `ColumnDef<T>[]`. This pattern allows:

- State management (dialogs, modals)
- Custom hooks integration (delete, update operations)
- Dynamic column generation based on user role

### Basic Column Structure

```typescript
import { ColumnDef } from "@tanstack/react-table";

export const useUserColumns = (): ColumnDef<User>[] => {
  // Optional: State for dialogs, modals, etc.
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  
  // Optional: Custom hooks for operations
  const { deleteUser, isPending } = useDeleteUser();

  return [
    // Column definitions here
  ];
};
```

### Column Types

#### 1. Drag Handle Column (Optional)

```typescript
{
  id: "drag",
  header: () => null,
  cell: ({ row }) => <DragHandle id={row.original.id} />,
}
```

#### 2. Selection Column (Optional)

```typescript
{
  id: "select",
  header: ({ table }) => (
    <div className="flex items-center justify-center">
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
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
}
```

#### 3. Data Column (Basic)

```typescript
{
  accessorKey: "email",        // Property name from data object
  header: "Email",              // Column header text
  cell: ({ row }) => {          // Custom cell renderer
    return (
      <div className="text-sm">
        {row.original.email}
      </div>
    );
  },
}
```

#### 4. Data Column (With Avatar)

```typescript
{
  accessorKey: "name",
  header: "User",
  cell: ({ row }) => {
    const user = row.original;
    const displayName = user.name;
    const initials = displayName
      .split(' ')
      .map(name => name.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);

    return (
      <div className="flex items-center gap-3">
        <Avatar className="h-8 w-8">
          <AvatarImage src={user.image || ''} alt={displayName} />
          <AvatarFallback className="text-xs">{initials}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <span className="font-medium">{displayName}</span>
          <span className="text-sm text-muted-foreground">{user.email}</span>
        </div>
      </div>
    );
  },
}
```

#### 5. Data Column (With Badge/Status)

```typescript
{
  accessorKey: "status",
  header: "Status",
  cell: ({ row }) => {
    const status = row.original.status;
    return (
      <Badge className={getStatusColor(status)}>
        {status}
      </Badge>
    );
  },
}
```

#### 6. Data Column (With Date Formatting)

```typescript
{
  accessorKey: "createdAt",
  header: "Created At",
  cell: ({ row }) => {
    const date = row.original.createdAt;
    if (!date) return <div className="text-sm text-muted-foreground">N/A</div>;
    
    return (
      <div className="text-sm">
        {new Date(date).toLocaleDateString()}
      </div>
    );
  },
}
```

#### 7. Actions Column

```typescript
{
  id: "actions",
  header: "Actions",
  cell: ({ row }) => {
    const user = row.original;

    return (
      <>
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
            <DropdownMenuItem asChild>
              <Link href={`/dashboard/users/${user.id}`} className="cursor-pointer">
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/dashboard/users/${user.id}/edit`} className="cursor-pointer">
                <Edit className="mr-2 h-4 w-4" />
                Edit User
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="text-red-600 cursor-pointer"
              onClick={() => handleDeleteClick(user)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete User
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Delete Confirmation Dialog */}
        {userToDelete && (
          <DeleteUserDialog
            open={deleteDialogOpen}
            onOpenChange={setDeleteDialogOpen}
            userName={userToDelete.name}
            userEmail={userToDelete.email}
            onConfirm={handleConfirmDelete}
            isPending={isPending}
          />
        )}
      </>
    );
  },
}
```

## Usage Example

### 1. Create Column Definition

```typescript
// app/(dashboard)/dashboard/users/components/user-table-columns.tsx
"use client";

import { ColumnDef } from "@tanstack/react-table";
import { useUserColumns } from "./user-table-columns";

export { useUserColumns };
```

### 2. Create Page Component

```typescript
// app/(dashboard)/dashboard/users/page.tsx
"use client";

import { useState } from "react";
import { GenericTable } from "@/components/tables/generic-table";
import { useUserColumns } from "./components/user-table-columns";
import { useUsers } from "./hooks/useUsers";
import { User } from "./types/user-types";

export default function UsersPage() {
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const { data, isLoading, error } = useUsers({
    page: pagination.pageIndex + 1,
    pageSize: pagination.pageSize,
  });

  const columns = useUserColumns();

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Users</h1>
        <p className="text-muted-foreground">
          Manage system users
        </p>
      </div>

      <GenericTable<User>
        data={data?.users || []}
        columns={columns}
        pagination={pagination}
        setPagination={setPagination}
        pageCount={data?.totalPages || -1}
        pending={isLoading}
        role="admin"
        tableType="users"
        withFilters={true}
        withPagination={true}
      />
    </div>
  );
}
```

## Column Properties

### Common Column Properties

- `accessorKey`: String property name from data object
- `id`: Unique identifier (required if no accessorKey)
- `header`: String or function returning ReactNode
- `cell`: Function returning ReactNode
- `enableSorting`: Boolean (default: true)
- `enableHiding`: Boolean (default: true)
- `enableFiltering`: Boolean (default: true)

### Column Options

```typescript
{
  accessorKey: "email",
  header: "Email",
  enableSorting: true,      // Allow sorting
  enableHiding: true,        // Allow hiding in column visibility menu
  enableFiltering: true,    // Allow filtering
  // ... cell renderer
}
```

## Best Practices

1. **Use Custom Hooks**: Column definitions should be hooks to support state management
2. **Type Safety**: Always type your data objects and columns
3. **Reusable Components**: Extract common cell renderers (Avatar, Badge, etc.)
4. **Loading States**: Handle loading and error states in the page component
5. **Permissions**: Use the `role` prop to conditionally show/hide columns or actions
6. **Accessibility**: Always include `aria-label` for interactive elements
7. **Consistent Styling**: Use shadcn/ui components for consistent UI

## File Naming Conventions

- Column files: `{entity}-table-columns.tsx` (e.g., `user-table-columns.tsx`)
- Hook files: `use{Entity}.ts` (e.g., `useUsers.ts`)
- Type files: `{entity}-types.ts` (e.g., `user-types.ts`)
- Service files: `{entity}-service.ts` (e.g., `user-service.ts`)

## Common Imports

```typescript
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Eye, Edit, Trash2 } from "lucide-react";
import Link from "next/link";
```

## Next Steps

1. Create the folder structure for your feature
2. Define TypeScript types for your data
3. Create the column definition hook
4. Create the page component
5. Add services and hooks as needed

