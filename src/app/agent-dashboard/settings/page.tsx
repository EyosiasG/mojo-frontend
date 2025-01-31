"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useRouter } from "next/navigation";
import Swal from 'sweetalert2';
import { Loader2 } from "lucide-react";
import { usersApi } from "@/api/users"; 
import { authApi } from "@/api/auth";
import NotificationProfile from "@/components/NotificationProfile";
import React from "react";


export default function SettingsPage() {
  // State management for different forms and UI states
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    idImage: null,
    idImageUrl: null,
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const router = useRouter();
  const [logoutPassword, setLogoutPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [userData, setUserData] = useState({});
  const [validationErrors, setValidationErrors] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });
  const [isDataLoading, setIsDataLoading] = useState(true);

  // Fetch user data on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      setIsDataLoading(true);
      try {
        const data = await usersApi.getUser();
        setUserData(data);
        // Populate form with existing user data
        setFormData({
          firstName: data.first_name || "",
          lastName: data.last_name || "",
          email: data.email || "",
          phone: data.phone,
          idImage: data.id_image || null,
          idImageUrl: data.profile_photo_url || null,
        });
      } catch (err: unknown) {
        setError(err.message);
      } finally {
        setIsDataLoading(false);
      }
    };
    fetchUserData();
  }, []);

  // Handle form input changes for profile information
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value || "" }));
  };

  // Handle password form input changes
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData((prevData) => ({ ...prevData, [name]: value || "" }));
  };

  // Handle profile form submission with validation
  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Field validation
    let errorMessages = [];

    if (!formData.firstName.trim()) {
        errorMessages.push("First name is required");
    }
    if (!formData.lastName.trim()) {
        errorMessages.push("Last name is required");
    }
    if (!formData.email.trim()) {
        errorMessages.push("Email is required");
    }
    if (!formData.phone.trim()) {
        errorMessages.push("Phone number is required");
    }

    if (errorMessages.length > 0) {
        Swal.fire({
            title: 'Validation Error',
            html: errorMessages.join('<br>'),
            icon: 'error',
            confirmButtonColor: '#3085d6',
        });
        return;
    }

    setIsLoading(true);
    const userId = userData.id;

    // Prepare data for API request with id_image explicitly set to null
    const updatedData = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        phone: formData.phone || "",
        id_image: null  // Explicitly set to null
    };

    try {
        // Send update request to API
        const response = await usersApi.updateUser(userId, updatedData);
        
        console.log("API Response: ", response); // Log the response for debugging

        // Check if the response indicates success
        if (response && response.message === 'User updated successfully!') {
            setFormData(response.user); // Update form data with the user object
            setError(null);
            Swal.fire({
                title: 'Success!',
                text: 'Profile updated successfully!',
                icon: 'success',
                timer: 2000,
                showConfirmButton: false
            });
            setTimeout(() => {
                router.push("/agent-dashboard");
            }, 2000);
        } else {
            throw new Error(response.message || "Failed to update profile");
        }

    } catch (err: unknown) {
        setError(err.message);
        Swal.fire({
            title: 'Error!',
            text: err.message,
            icon: 'error',
            confirmButtonColor: '#3085d6',
        });
    } finally {
        setIsLoading(false);
    }
  };

  // Handle password change submission
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    let errorMessages = [];

    if (!passwordData.currentPassword.trim()) {
        errorMessages.push("Current password is required");
    }
    if (!passwordData.newPassword.trim()) {
        errorMessages.push("New password is required");
    }
    if (!passwordData.confirmPassword.trim()) {
        errorMessages.push("Please confirm your new password");
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
        errorMessages.push("Passwords do not match");
    }

    if (errorMessages.length > 0) {
        Swal.fire({
            title: 'Validation Error',
            html: errorMessages.join('<br>'),
            icon: 'error',
            confirmButtonColor: '#3085d6',
        });
        return;
    }

    setIsLoading(true);

    const updatedData = {
      first_name: formData.firstName,
      last_name: formData.lastName,
      email: formData.email,
      phone: formData.phone || "", // Ensure phone is included, even if empty
      id_image: formData.idImage, // Assuming this is a base64 string
      // Include password if you want to allow password updates
      password: passwordData.newPassword || "12345678", // Uncomment if needed
    };

    console.log("Request Body: ", updatedData); 

    const userId = userData.id;
    try {
      const response = await usersApi.updateUser(userId, updatedData);
      if (!response.ok) {
        throw new Error("Failed to change password");
      }
      Swal.fire({
        title: 'Success!',
        text: 'Password updated successfully!',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      });
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setError(null);
    } catch (err: unknown) {
      setError(err.message);
      Swal.fire({
        title: 'Error!',
        text: err.message,
        icon: 'error',
        confirmButtonColor: '#3085d6',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle logging out other sessions
  const handleLogoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await authApi.logoutOtherSessions(logoutPassword);
      const data = await response.json();

      if (!response.ok) {
        Swal.fire({
          title: 'Error!',
          text: data.message || 'Failed to logout other sessions',
          icon: 'error',
          confirmButtonColor: '#3085d6',
        });
        throw new Error('Failed to logout other sessions');
      }

      Swal.fire({
        title: 'Success!',
        text: 'Successfully logged out of other sessions',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      });
      setLogoutPassword("");
      setError(null);
      Swal.fire({
        title: 'Success!',
        text: 'Logged out from other sessions successfully!',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      });
      setTimeout(() => {
        router.push("/agent-dashboard");
      }, 2000);
    } catch (err: unknown) {
      setError(err.message);
      Swal.fire({
        title: 'Error!',
        text: err.message,
        icon: 'error',
        confirmButtonColor: '#3085d6',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle account deletion
  const handleDeleteAccount = async () => {
    if (
      confirm(
        "Are you sure you want to delete your account? This action is irreversible."
      )
    ) {
      setIsLoading(true);

      try {
       const response = await usersApi.deleteUser(userId);

        if (!response.ok) {
          throw new Error("Failed to delete account");
        }

        Swal.fire({
          title: 'Success!',
          text: 'Your account has been deleted',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        });
      } catch (err: unknown) {
        setError(err.message);
        Swal.fire({
          title: 'Error!',
          text: err.message,
          icon: 'error',
          confirmButtonColor: '#3085d6',
        });
      } finally {
        setIsLoading(false);
      }
    }
  };
 
  return (
    <div className="bg-blue-50 min-h-screen">
      <ToastContainer
        position="top-center"
        autoClose={2500}
        hideProgressBar={false}
        newestOnTop={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />

      <header className="flex items-center justify-between py-4 px-10">
        <h1 className="text-xl font-semibold text-primary">Settings</h1>
        <div className="flex items-center gap-4">
          <NotificationProfile
            profileLink="/agent-dashboard/settings"
            notificationLink="/agent-dashboard/notifications"
          />

        </div>
      </header>
      <div className="container mx-auto py-10 space-y-8 max-w-3xl">

        {/* Profile Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <p className="text-sm text-muted-foreground">
              Use a permanent address where you can receive mail
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleProfileSubmit}>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  {isDataLoading ? (
                    <div className="flex items-center space-x-2">
                      <Input disabled />
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </div>
                  ) : (
                    <Input
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      placeholder="Enter your first name"
                      className={validationErrors.firstName ? "border-red-500" : ""}
                    />
                  )}
                  {validationErrors.firstName && (
                    <p className="text-red-500 text-sm">{validationErrors.firstName}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  {isDataLoading ? (
                    <div className="flex items-center space-x-2">
                      <Input disabled />
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </div>
                  ) : (
                    <Input
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      placeholder="Enter your last name"
                      className={validationErrors.lastName ? "border-red-500" : ""}
                    />
                  )}
                  {validationErrors.lastName && (
                    <p className="text-red-500 text-sm">{validationErrors.lastName}</p>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email address</Label>
                {isDataLoading ? (
                  <div className="flex items-center space-x-2">
                    <Input disabled />
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                ) : (
                  <Input
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    type="email"
                    placeholder="Enter your email"
                    className={validationErrors.email ? "border-red-500" : ""}
                  />
                )}
                {validationErrors.email && (
                  <p className="text-red-500 text-sm">{validationErrors.email}</p>
                )}
              </div>
              <div className="space-y-2 mb-3">
                <Label htmlFor="phone">Phone Number</Label>
                {isDataLoading ? (
                  <div className="flex items-center space-x-2">
                    <Input disabled />
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                ) : (
                  <Input
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Enter your phone number"
                    className={validationErrors.phone ? "border-red-500" : ""}
                  />
                )}
                {validationErrors.phone && (
                  <p className="text-red-500 text-sm">{validationErrors.phone}</p>
                )}
              </div>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Saving..." : "Save changes"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Password Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Change password</CardTitle>
            <p className="text-sm text-muted-foreground">
              Update your password associated with your account
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handlePasswordSubmit}>
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current password</Label>
                <Input
                  id="currentPassword"
                  name="currentPassword"
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  required
                  className={validationErrors.currentPassword ? "border-red-500" : ""}
                />
                {validationErrors.currentPassword && (
                  <p className="text-red-500 text-sm">{validationErrors.currentPassword}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">New password</Label>
                <Input
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  required
                  className={validationErrors.newPassword ? "border-red-500" : ""}
                />
                {validationErrors.newPassword && (
                  <p className="text-red-500 text-sm">{validationErrors.newPassword}</p>
                )}
              </div>
              <div className="space-y-2 mb-3">
                <Label htmlFor="confirmPassword">Confirm new password</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  required
                  className={validationErrors.confirmPassword ? "border-red-500" : ""}
                />
                {validationErrors.confirmPassword && (
                  <p className="text-red-500 text-sm">{validationErrors.confirmPassword}</p>
                )}
              </div>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Saving..." : "Save password"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Logout other sessions */}
        <Card>
          <CardHeader>
            <CardTitle>Logout from all other sessions</CardTitle>
            <p className="text-sm text-muted-foreground">
              This will log you out from all other devices and sessions
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogoutSubmit}>
              <div className="space-y-2 mb-3">
                <Label htmlFor="logoutPassword">Enter password</Label>
                <Input
                  id="logoutPassword"
                  name="logoutPassword"
                  type="password"
                  value={logoutPassword}
                  onChange={(e) => setLogoutPassword(e.target.value)}
                  required
                  className={validationErrors.logoutPassword ? "border-red-500" : ""}
                />
                {validationErrors.logoutPassword && (
                  <p className="text-red-500 text-sm">{validationErrors.logoutPassword}</p>
                )}
              </div>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Logging out..." : "Logout"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Account Deletion */}
        <Card>
          <CardHeader>
            <CardTitle>Delete Account</CardTitle>
            <p className="text-sm text-muted-foreground">
              Permanently delete your account
            </p>
          </CardHeader>
          <CardContent>
            <Button
              variant="destructive"
              onClick={handleDeleteAccount}
              disabled={isLoading}
            >
              {isLoading ? "Deleting..." : "Delete account"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
