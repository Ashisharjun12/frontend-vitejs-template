import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const TableSkeleton = ({ rows = 5, columns = 5 }) => {
  return (
    <div className="rounded-3xl border border-border/30 overflow-hidden bg-card">
      <Table>
        <TableHeader>
          <TableRow className="border-b border-border/30 hover:bg-transparent">
            {Array.from({ length: columns }).map((_, idx) => (
              <TableHead key={idx} className="h-12">
                <Skeleton className="h-4 w-24" />
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: rows }).map((_, rowIdx) => (
            <TableRow
              key={rowIdx}
              className="border-b border-border/20"
            >
              {Array.from({ length: columns }).map((_, colIdx) => (
                <TableCell key={colIdx} className="py-4">
                  {colIdx === 0 ? (
                    <Skeleton className="h-5 w-32" />
                  ) : colIdx === 1 ? (
                    <Skeleton className="h-6 w-20 rounded-full" />
                  ) : colIdx === 2 ? (
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <Skeleton className="h-8 w-8 rounded-full" />
                    </div>
                  ) : colIdx === columns - 1 ? (
                    <Skeleton className="h-8 w-8 rounded-full ml-auto" />
                  ) : (
                    <Skeleton className="h-4 w-24" />
                  )}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default TableSkeleton;

