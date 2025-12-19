import React, { useState, useMemo } from 'react';
import { Search, Trash2, Edit, Image as ImageIcon, Filter, ChevronLeft, ChevronRight, Lock, Unlock } from 'lucide-react';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  getPaginationRowModel,
} from '@tanstack/react-table';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import TableSkeleton from './TableSkeleton';

const FrameworkTable = ({ data, onDelete, onEdit, onToggleLock, loading = false }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  // Filter data based on search and type
  const filteredData = useMemo(() => {
    return data.filter((preset) => {
      const matchesSearch = preset.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = typeFilter === 'all' || preset.type === typeFilter;
      return matchesSearch && matchesType;
    });
  }, [data, searchQuery, typeFilter]);

  // Reset pagination when filters change
  React.useEffect(() => {
    setPagination({ pageIndex: 0, pageSize: 10 });
  }, [searchQuery, typeFilter]);

  const columns = [
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }) => (
        <div className="font-medium">{row.original.name}</div>
      ),
    },
    {
      accessorKey: 'type',
      header: 'Type',
      cell: ({ row }) => {
        const type = row.original.type;
        const isLocked = row.original.locked;
        return (
          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium ${
                type === 'frontend'
                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                  : type === 'fullstack'
                  ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
                  : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
              }`}
            >
              {type}
            </span>
            {isLocked && (
              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                Locked
              </span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: 'images',
      header: 'Images',
      cell: ({ row }) => {
        const images = row.original.images?.urls || [];
        return (
          <div className="flex items-center gap-2">
            {images.length > 0 ? (
              <>
                <div className="flex -space-x-2">
                  {images.slice(0, 3).map((url, idx) => (
                    <img
                      key={idx}
                      src={url}
                      alt={`${row.original.name} ${idx + 1}`}
                      className="w-8 h-8 rounded-full border-2 border-background object-cover"
                    />
                  ))}
                </div>
                {images.length > 3 && (
                  <span className="text-xs text-muted-foreground">
                    +{images.length - 3}
                  </span>
                )}
              </>
            ) : (
              <div className="flex items-center gap-2 text-muted-foreground">
                <ImageIcon className="h-4 w-4" />
                <span className="text-xs">No images</span>
              </div>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: 'createdAt',
      header: 'Created',
      cell: ({ row }) => {
        const date = new Date(row.original.createdAt);
        return (
          <span className="text-sm text-muted-foreground">
            {date.toLocaleDateString()}
          </span>
        );
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onToggleLock(row.original.id)}
            className={`rounded-full cursor-pointer ${
              row.original.locked
                ? 'text-yellow-600 hover:text-yellow-700 hover:bg-yellow-500/10 dark:text-yellow-400'
                : 'text-foreground hover:bg-accent/50'
            }`}
            title={row.original.locked ? 'Unlock' : 'Lock'}
          >
            {row.original.locked ? (
              <Lock className="h-4 w-4" />
            ) : (
              <Unlock className="h-4 w-4" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit(row.original)}
            className="text-foreground hover:bg-accent/50 rounded-full cursor-pointer"
            title="Edit"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(row.original.id)}
            className="text-destructive hover:text-destructive hover:bg-destructive/10 rounded-full cursor-pointer"
            title="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onPaginationChange: setPagination,
    state: {
      pagination,
    },
  });

  return (
    <div className="space-y-4">
      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search frameworks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 rounded-full border-border/50 bg-background"
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-full sm:w-[180px] rounded-full border-border/50">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="frontend">Frontend</SelectItem>
            <SelectItem value="backend">Backend</SelectItem>
            <SelectItem value="fullstack">Fullstack</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      {loading ? (
        <TableSkeleton rows={5} columns={5} />
      ) : (
        <div className="rounded-3xl border border-border/30 overflow-hidden bg-card">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow
                  key={headerGroup.id}
                  className="border-b border-border/30 hover:bg-transparent"
                >
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className="h-12 text-sm font-semibold text-muted-foreground"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    className="border-b border-border/20 hover:bg-accent/30 transition-colors"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className="py-4"
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center text-muted-foreground"
                  >
                    No frameworks found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Pagination */}
      {filteredData.length > 0 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to{' '}
            {Math.min(
              (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
              filteredData.length
            )}{' '}
            of {filteredData.length} framework{filteredData.length !== 1 ? 's' : ''}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="rounded-full h-9 px-4 cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            <div className="flex items-center gap-1">
              {(() => {
                const pageCount = table.getPageCount();
                const currentPage = table.getState().pagination.pageIndex + 1;
                const maxVisiblePages = 5;
                
                let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
                let endPage = Math.min(pageCount, startPage + maxVisiblePages - 1);
                
                if (endPage - startPage < maxVisiblePages - 1) {
                  startPage = Math.max(1, endPage - maxVisiblePages + 1);
                }
                
                const pages = [];
                if (startPage > 1) {
                  pages.push(
                    <Button
                      key={1}
                      variant="outline"
                      size="sm"
                      onClick={() => table.setPageIndex(0)}
                      className="rounded-full h-9 w-9 p-0 cursor-pointer"
                    >
                      1
                    </Button>
                  );
                  if (startPage > 2) {
                    pages.push(
                      <span key="ellipsis-start" className="px-2 text-muted-foreground">
                        ...
                      </span>
                    );
                  }
                }
                
                for (let i = startPage; i <= endPage; i++) {
                  pages.push(
                    <Button
                      key={i}
                      variant={currentPage === i ? "default" : "outline"}
                      size="sm"
                      onClick={() => table.setPageIndex(i - 1)}
                      className="rounded-full h-9 w-9 p-0 cursor-pointer"
                    >
                      {i}
                    </Button>
                  );
                }
                
                if (endPage < pageCount) {
                  if (endPage < pageCount - 1) {
                    pages.push(
                      <span key="ellipsis-end" className="px-2 text-muted-foreground">
                        ...
                      </span>
                    );
                  }
                  pages.push(
                    <Button
                      key={pageCount}
                      variant="outline"
                      size="sm"
                      onClick={() => table.setPageIndex(pageCount - 1)}
                      className="rounded-full h-9 w-9 p-0 cursor-pointer"
                    >
                      {pageCount}
                    </Button>
                  );
                }
                
                return pages;
              })()}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="rounded-full h-9 px-4 cursor-pointer"
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FrameworkTable;

