import React from 'react'
import { Skeleton } from '../ui/skeleton'
import { Table, TableRow } from '../ui/table'
import { TableCell, TableHead, TableHeader } from '../ui/table'

function TableSkeleton() {
  return (
    <div className="flex flex-col px-4 lg:px-6">
              <div className=" w-full flex-1 rounded-lg border border-dashed">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Loading...</TableHead>
                    </TableRow>
                  </TableHeader>
                
                  {Array.from({ length: 10 }).map((_, index) => (
									<TableRow key={`skeleton-${index}`}>
										<TableCell>
											<Skeleton className="h-4 w-12" />
										</TableCell>
										<TableCell>
											<Skeleton className="h-4 w-32" />
										</TableCell>
										<TableCell className="hidden md:table-cell">
											<Skeleton className="h-4 w-40" />
										</TableCell>
										<TableCell className="hidden sm:table-cell">
											<Skeleton className="h-4 w-24" />
										</TableCell>
										<TableCell>
											<Skeleton className="h-4 w-20" />
										</TableCell>
										<TableCell>
											<Skeleton className="h-6 w-16" />
										</TableCell>
										<TableCell className="hidden lg:table-cell">
											<Skeleton className="h-4 w-24" />
										</TableCell>
									</TableRow>
							  ))}
                </Table>
              </div>
            </div>
  )
}

    export default TableSkeleton
