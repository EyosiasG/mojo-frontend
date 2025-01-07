import { fetchWithAuth } from "@/components/utils/fetchwitAuth";

export const fetchRoleData = async (roleId: string) => {
  const response = await fetchWithAuth(
    `https://mojoapi.crosslinkglobaltravel.com/api/roles/${roleId}/edit`
  );
  if (!response.ok) throw new Error("Failed to fetch role");
  return await response.json();
};

// Fetch all roles
export const fetchRoles = async () => {
  const response = await fetchWithAuth("https://mojoapi.crosslinkglobaltravel.com/api/roles");
  if (!response.ok) throw new Error("Failed to fetch roles");
  return await response.json();
};

// Create new role
export const createRole = async (data: { name: string; permission: string[] }) => {
  const response = await fetchWithAuth(
    "https://mojoapi.crosslinkglobaltravel.com/api/roles",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }
  );
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to create role");
  }
  return await response.json();
};

// Update existing role
export const updateRole = async (roleId: string, data: { name: string; status: string; permission: string[] }) => {
  const response = await fetchWithAuth(
    `https://mojoapi.crosslinkglobaltravel.com/api/roles/${roleId}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }
  );
  if (!response.ok) throw new Error("Failed to update role");
  return await response.json();
};

// Delete role
export const deleteRole = async (roleId: string) => {
  const response = await fetchWithAuth(
    `https://mojoapi.crosslinkglobaltravel.com/api/roles/${roleId}`,
    {
      method: "DELETE",
    }
  );
  if (!response.ok) throw new Error("Failed to delete role");
  return await response.json();
};

// Fetch permissions for new role
export const fetchNewRolePermissions = async () => {
  const response = await fetchWithAuth(
    `https://mojoapi.crosslinkglobaltravel.com/api/roles/create`
  );
  if (!response.ok) throw new Error("Failed to fetch permissions");
  return await response.json();
};
