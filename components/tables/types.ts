

import { Role } from "@/app/(modules)/dashboard/types/gym-member";
import {
  ColumnDef,
  ColumnFiltersState,
  Row,
  SortingState,
  VisibilityState,
} from "@tanstack/react-table";

 export type TableTypes ="member"|"subscription_plan"|"gym_class"|"staff"|"member-payment-history"|"tasks"|"daypass"|"lockers"|"locker_plan"|"users"|"assets"

export type TableProps<T> = {
  data: T[];
  columns: ColumnDef<T>[];
  pageCount?: number;
  pagination: {
    pageIndex: number;
    pageSize: number;
  };
  setPagination: React.Dispatch<
    React.SetStateAction<{
      pageIndex: number;
      pageSize: number;
    }>
  >;
  initialSorting?: SortingState;
  initialFilters?: ColumnFiltersState;
  initialVisibility?: VisibilityState;
  initialPageSize?: number;
  role: Role;
  onRowClick?: (row: Row<T>) => void;
  // For drag and drop support, render rows yourself
  renderRow?: (
    row: Row<T>,
    props: { isDragging: boolean; transform?: string; transition?: string }
  ) => React.ReactNode;
  pending: boolean;
  tableType?: TableTypes;
  tableFilters?: string[];
  withFilters?: boolean;
  withPagination?: boolean;
};
