import { useSortable } from "@dnd-kit/sortable";
import { flexRender, Row } from "@tanstack/react-table";
import React from "react";
import { CSS } from "@dnd-kit/utilities";
import { TableCell, TableRow } from "../ui/table";

export function DraggableRow<T>({
  row,
  renderRow,
}: {
  row: Row<T>;
  renderRow?: (
    row: Row<T>,
    dragProps: { isDragging: boolean; transform?: string; transition?: string }
  ) => React.ReactNode;
}) {
  const { transform, transition, setNodeRef, isDragging } = useSortable({
    id: row.id,
  });

  if (renderRow) return renderRow(row, { isDragging, transform: CSS.Transform.toString(transform), transition });

  return (
    <TableRow
      data-state={row.getIsSelected() && "selected"}
      data-dragging={isDragging}
      ref={setNodeRef}
      className="relative z-0 data-[dragging=true]:z-10 data-[dragging=true]:opacity-80"
      style={{
        transform: CSS.Transform.toString(transform),
        transition: transition,
      }}
    >
      {row.getVisibleCells().map((cell) => (
        <TableCell key={cell.id}>
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </TableCell>
      ))}
    </TableRow>
  );
}
