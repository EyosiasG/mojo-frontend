"use client";

import React, { useEffect, useState } from "react";
import {
  ChevronDown,
  Download,
  Filter,
  MoreVertical,
  PlusCircle,
  Search,
  Trash2,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/badge";
import Link from "next/link";
import NotificationProfile from "@/components/NotificationProfile";
import { format } from "date-fns";
import { usersApi } from '@/api/users';
import Swal from 'sweetalert2';

export default function UserManagementPage() {
  // Add proper TypeScript interface for User
  interface User {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    created_at: string;
  }

  // Add proper typing to state variables
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Add debouncing for search to improve performance
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (searchQuery) {
        handleSearch();
      }
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  // Function to fetch users
  const fetchUsers = async () => {
    try {
      console.log('Attempting to fetch users...');
      const sortedUsers = await usersApi.getAllUsers();
      setUsers(sortedUsers);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(); // Call the fetchUsers function here
  }, []);

  // Function to delete a user
  const handleDelete = async (userId) => {
    const isConfirmed = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => result.isConfirmed);

    if (isConfirmed) {
      try {
        await usersApi.deleteUser(userId);
        setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId));
        Swal.fire('Deleted!', 'User has been deleted.', 'success');
      } catch (err) {
        setError(err.message);
        Swal.fire('Error!', 'Failed to delete user.', 'error');
      }
    }
  };

  // Modify search handler to remove manual button click
  const handleSearch = async () => {
    setLoading(true);
    try {
      const results = searchQuery.trim() 
        ? await usersApi.searchUsers(searchQuery)
        : await usersApi.getAllUsers();
      setUsers(results);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      Swal.fire('Error', errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading users...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="bg-blue-50 min-h-screen">
      <div className="py-4">
        <div className="flex flex-col sm:flex-row items-center justify-between px-4 py-3 md:px-6 md:py-4">
          <h1 className="text-lg font-semibold md:text-xl ml-8 mb-3 sm:mb-0 text-primary">User Management</h1>
          <div className="flex w-full sm:w-auto justify-center sm:justify-end gap-4">
            <NotificationProfile
              profileLink="/agent-dashboard/settings"
              notificationLink="/agent-dashboard/notifications"
            />
          </div>
        </div>
      </div>


      <div className="p-6">
        <div className="mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative flex-1 w-full md:w-auto">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
            <Input
              className="pl-10 w-full bg-white"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex flex-col md:flex-row items-center gap-2 w-full md:w-auto">
            <Link href="user-management/create-user" className="w-full md:w-auto">
              <Button className="gap-2 bg-primary hover:bg-primary/90 w-full">
                <PlusCircle className="h-4 w-4" />
                Create User
              </Button>
            </Link>
          </div>
        </div>

        <div className="rounded-lg border bg-white">
          <div className="overflow-x-auto">
            <div className="min-w-full inline-block align-middle">
              <div className="overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12 hidden md:table-cell">
                        <Checkbox />
                      </TableHead>
                      <TableHead className="hidden md:table-cell">
                        <div className="flex items-center gap-2">
                          User ID
                          <ChevronDown className="h-4 w-4" />
                        </div>
                      </TableHead>
                      <TableHead>First Name</TableHead>
                      <TableHead>Last Name</TableHead>
                      <TableHead className="hidden md:table-cell">Email</TableHead>
                      <TableHead className="hidden md:table-cell">Phone</TableHead>
                      <TableHead className="hidden md:table-cell">Created At</TableHead>
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user, i) => (
                      <TableRow
                        key={user.id || i}
                        className="border-b last:border-b-0"
                      >
                        <TableCell className="hidden md:table-cell">
                          <Checkbox />
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {user.id}
                        </TableCell>
                        <TableCell>
                          {user.first_name}
                        </TableCell>
                        <TableCell>
                          {user.last_name}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {user.email}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {user.phone}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {user.created_at
                            ? format(new Date(user.created_at), "MMMM d, yyyy")
                            : "N/A"}
                        </TableCell>
                     
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="h-4 w-4" />
                                <span className="sr-only">Open menu</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem asChild>
                                <Link
                                  href={`user-management/view-user/${user.id}`}
                                  className="w-full"
                                >
                                  View
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link href={`user-management/edit-user/${user.id}`}>
                                  Edit
                                </Link>
                              </DropdownMenuItem>

                              <DropdownMenuItem onClick={() => handleDelete(user.id)}>
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>

          {users.length > 0 ? (
            <div className="flex items-center justify-between px-4 py-4 flex-wrap">
              <div className="text-sm text-gray-500 w-full text-center md:text-left md:w-auto">
                Showing 1 to 10 of {users.length} results
              </div>
            </div>
          ) : (
            <div className="text-red-500 text-center py-4">No Users found!</div>
          )}
        </div>
      </div>
    </div>
  );
}
