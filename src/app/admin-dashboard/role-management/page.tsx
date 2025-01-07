"use client";

import { useEffect, useState } from "react";
import NotificationProfile from "@/components/NotificationProfile";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  MoreHorizontal,
  PlusCircle,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { fetchWithAuth } from "@/components/utils/fetchwitAuth";
import { toast } from "react-toastify";
import { fetchRoles, deleteRole } from "@/api/role-management";
import Swal from "sweetalert2";

interface Role {
  id: string;
  name: string;
  guard_name: string;
  created_at: string;
  status: "active" | "inactive";
}

const Page = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadRoles = async () => {
      try {
        const data = await fetchRoles();
        setRoles(data.data || []);
      } catch (err) {
        const error = err as Error;
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    loadRoles();
  }, []);

  const handleDelete = async (roleId: string) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        await deleteRole(roleId);
        setRoles(roles.filter(role => role.id !== roleId));
        Swal.fire(
          'Deleted!',
          'Role has been deleted.',
          'success'
        );
      } catch (error) {
        console.error("Error deleting role:", error);
        Swal.fire(
          'Error!',
          'Failed to delete role.',
          'error'
        );
      }
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-screen">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Role Management</h1>
        <NotificationProfile
          profileLink="/admin-dashboard/settings"
          notificationLink="/admin-dashboard/notifications"
        />
      </div>

      <div className="relative">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div className="flex-1">
            {/* Search bar removed */}
          </div>
          <div className="flex items-center gap-2">
            {/* Removed Trash, Filter, and Export buttons */}
            <Link href="role-management/create-role">
              <Button className="gap-2 bg-primary hover:bg-primary/90">
                <PlusCircle className="h-4 w-4" />
                Create Role
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <Table className="role-table">
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <Checkbox />
            </TableHead>
            <TableHead>Role ID</TableHead>
            <TableHead>Role Name</TableHead>
            <TableHead>Guard Name</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {roles && roles.map((role) => (
            <TableRow key={role.id}>
              <TableCell>
                <Checkbox />
              </TableCell>
              <TableCell>{role.id}</TableCell>
              <TableCell>{role.name}</TableCell>
              <TableCell>{role.guard_name}</TableCell>
              <TableCell>{new Date(role.created_at).toLocaleDateString()}</TableCell>
             
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Open menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <Link href={`/admin-dashboard/role-management/view-role/${role.id}`}>
                      <DropdownMenuItem>View</DropdownMenuItem>
                    </Link>
                    <Link href={`/admin-dashboard/role-management/edit-role/${role.id}`}>
                      <DropdownMenuItem>Edit</DropdownMenuItem>
                    </Link>
                    <DropdownMenuItem 
                      className="text-destructive"
                      onClick={() => handleDelete(role.id)}
                    >
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="flex items-center justify-center gap-2">
        <Button variant="outline" size="icon">
          {"<"}
        </Button>
        <Button variant="outline" size="icon">
          1
        </Button>
        <Button variant="outline" size="icon">
          2
        </Button>
        <Button variant="outline" size="icon">
          {">"}
        </Button>
      </div>
    </div>
  );
};

export default Page;
