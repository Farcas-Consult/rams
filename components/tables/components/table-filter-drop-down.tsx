import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { IconFilter } from "@tabler/icons-react";


 const TableFilterDropdown = ({ tableFilters }: { tableFilters: string[] }) => {
  const [activeFilter, setActiveFilter] = useState(tableFilters[0] || "");

  return (
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <IconFilter className="mr-2 h-4 w-4" />
            <span className="capitalize">{activeFilter}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {tableFilters?.map((filter) => (
            <DropdownMenuItem
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className="capitalize cursor-pointer"
            >
              {filter}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default TableFilterDropdown