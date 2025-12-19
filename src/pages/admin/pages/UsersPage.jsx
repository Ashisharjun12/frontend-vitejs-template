import React, { useState, useEffect } from 'react';
import { Users, Loader2, Shield, User as UserIcon, Mail, Calendar, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { userAPI } from '@/api/api';

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [updatingRole, setUpdatingRole] = useState(null);

  useEffect(() => {
    fetchUsers(currentPage);
  }, [currentPage]);

  const fetchUsers = async (page = 1) => {
    try {
      setLoading(true);
      const response = await userAPI.getUsers(page, 10);
      if (response.success) {
        setUsers(response.data);
        setPagination(response.pagination);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      setUpdatingRole(userId);
      const response = await userAPI.updateUserRole(userId, newRole);
      if (response.success) {
        // Update the user in the list
        setUsers(users.map(user => 
          user.id === userId ? { ...user, role: newRole } : user
        ));
      }
    } catch (error) {
      console.error('Failed to update user role:', error);
      alert(error.response?.data?.message || 'Failed to update user role');
    } finally {
      setUpdatingRole(null);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Filter users by search query
  const filteredUsers = users.filter(user => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      user.name?.toLowerCase().includes(query) ||
      user.email?.toLowerCase().includes(query) ||
      user.role?.toLowerCase().includes(query)
    );
  });

  if (loading && users.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-sans w-full">
      <div className="w-full px-6 sm:px-12 py-6 sm:py-12">
        {/* Header */}
        <div className="mb-8 max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-foreground to-muted-foreground mb-2">
            Users
          </h1>
          <p className="text-muted-foreground text-lg font-medium tracking-tight">
            Manage platform users and their roles
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-7xl mx-auto mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search users by name, email, or role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-11 h-11 rounded-full border-border/50 bg-background/50 focus:bg-background transition-all"
            />
          </div>
        </div>

        {/* Table Card */}
        <div className="max-w-7xl mx-auto">
          <Card className="rounded-3xl border-border/30 bg-background/40 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>All Users</CardTitle>
              <CardDescription>
                {pagination ? `Total: ${pagination.total} users` : 'Loading...'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredUsers.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <Users className="h-16 w-16 text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold mb-2">
                    {searchQuery ? 'No users found' : 'No users yet'}
                  </h3>
                  <p className="text-muted-foreground text-center">
                    {searchQuery ? 'Try adjusting your search query' : 'Users will appear here once they sign up'}
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]">Avatar</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id} className="hover:bg-muted/50">
                        <TableCell>
                          <Avatar className="h-10 w-10 border border-border">
                            <AvatarImage src={user.image} alt={user.name} />
                            <AvatarFallback className="bg-gradient-to-br from-primary to-primary/60 text-primary-foreground text-sm font-semibold">
                              {user.name?.charAt(0)?.toUpperCase() || 'U'}
                            </AvatarFallback>
                          </Avatar>
                        </TableCell>
                        <TableCell className="font-medium">
                          {user.name || 'Unknown User'}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Mail className="h-4 w-4" />
                            <span>{user.email}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={user.role === 'admin' ? 'default' : 'secondary'}
                            className={`${
                              user.role === 'admin' 
                                ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' 
                                : 'bg-neutral-500/10 text-neutral-400 border-neutral-500/20'
                            }`}
                          >
                            {user.role === 'admin' ? (
                              <>
                                <Shield className="mr-1 h-3 w-3" />
                                Admin
                              </>
                            ) : (
                              <>
                                <UserIcon className="mr-1 h-3 w-3" />
                                User
                              </>
                            )}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            <span>{formatDate(user.createdAt)}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Select
                            value={user.role}
                            onValueChange={(newRole) => handleRoleChange(user.id, newRole)}
                            disabled={updatingRole === user.id}
                          >
                            <SelectTrigger className="w-[140px] rounded-xl border-border/50 h-9 bg-background/50 text-sm">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="rounded-2xl">
                              <SelectItem value="user">
                                <div className="flex items-center gap-2">
                                  <UserIcon className="h-4 w-4" />
                                  User
                                </div>
                              </SelectItem>
                              <SelectItem value="admin">
                                <div className="flex items-center gap-2">
                                  <Shield className="h-4 w-4" />
                                  Admin
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          {updatingRole === user.id && (
                            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
                              <Loader2 className="h-3 w-3 animate-spin" />
                              Updating...
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && !searchQuery && (
          <div className="max-w-7xl mx-auto mt-8 flex items-center justify-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={!pagination.hasPrevPage || loading}
              className="rounded-full"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                Page {pagination.page} of {pagination.totalPages}
              </span>
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentPage(prev => Math.min(pagination.totalPages, prev + 1))}
              disabled={!pagination.hasNextPage || loading}
              className="rounded-full"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default UsersPage;
