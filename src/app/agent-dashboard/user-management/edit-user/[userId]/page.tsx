"use client";
import { use, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import { Camera } from "lucide-react";
import { Layout } from "@/components/AgentLayout";
import { Upload } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useParams, useRouter } from "next/navigation";
import Swal from 'sweetalert2';
import { Loader2 } from "lucide-react";
import { usersApi } from "@/api/users";
import NotificationProfile from "@/components/NotificationProfile";
import React from "react";
import BackLink from "@/components/BackLink";
// import jwt_decode from "jwt-decode";
import { ArrowLeft } from "lucide-react";

export default function SettingsPage() {
  // State management for form data and UI controls
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    idImage: null,      // Stores the base64 image data for API
    idImageUrl: "",     // Stores the full URL for display
  });

  const { userId } = useParams();
  const router = useRouter();
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

  // Fetch user data when component mounts
  useEffect(() => {
    const getUserData = async () => {
      setIsDataLoading(true);
      try {
        const data = await usersApi.getUserData(userId as string);
        setUserData(data.user);
        // Populate form with existing user data, using empty strings as fallbacks
        setFormData({
          firstName: data.user.first_name || "",
          lastName: data.user.last_name || "",
          email: data.user.email || "",
          phone: data.user.phone,
          idImage: null,
          idImageUrl: data.user.id_image || "",
        });
        setIsDataLoading(false);
      } catch (err: unknown) {
        setError(err.message);
        setIsDataLoading(false);
      }
    };
    getUserData();
  }, []);

  // Handle input changes for text fields
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value || "" }));
  };

  // Form submission handler
  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all required fields
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

    // Prepare data for API submission
    const updatedData: any = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        phone: formData.phone || "",
    };

    // Only include image data if a new image was uploaded
    if (formData.idImage) {
        updatedData.id_image = formData.idImage;
    }

    try {
        const data = await usersApi.updateUser(userId, updatedData);
        setFormData(data);
        setError(null);
        // Show success message and redirect
        Swal.fire({
            title: 'Success!',
            text: 'Profile updated successfully!',
            icon: 'success',
            timer: 2000,
            showConfirmButton: false
        }).then(() => {
            router.push("/agent-dashboard");
        });

    } catch (err: unknown) {
        setError(err.message);
        toast.error(err.message);
    } finally {
        setIsLoading(false);
    }
  };

  // Handle image upload and processing
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        alert("File size exceeds 5MB. Please choose a smaller file.");
        return;
      }
  
      // Convert uploaded image to base64
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64String = event.target?.result as string;
        // Remove data URL prefix for API submission
        const cleanBase64 = base64String.replace('data:image/png;base64,', '');
        setFormData((prevData) => ({ 
          ...prevData, 
          idImage: cleanBase64,    // Clean base64 for API
          idImageUrl: base64String // Full data URL for display
        }));
      };
      reader.readAsDataURL(file);
    }
  };
  
  return (
    <div className="bg-blue-50 min-h-full">
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
        <header className="flex items-center justify-between p-4">
        <h1 className="text-xl font-semibold text-primary">User Management</h1>
        <div className="flex items-center gap-4">
          <NotificationProfile
            profileLink="/agent-dashboard/settings"
            notificationLink="/agent-dashboard/notifications"
          />

        </div>
      </header>
      <div className="container mx-auto py-10 space-y-8 max-w-3xl">
          <BackLink>
            <ArrowLeft className="h-4 w-4" />
            User Details For - {userData.first_name} {userData.last_name}
          </BackLink>
       
        {error && <p className="text-red-500">{error}</p>}

        {/* Profile Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <p className="text-sm text-muted-foreground">
              Use a permanent address where you can receive mail
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                {isDataLoading ? (
                  <div className="w-[100px] h-[100px] rounded-lg flex items-center justify-center bg-gray-100">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                ) : (
                  <>
                    {formData.idImageUrl ? (
                      <Image
                        src={formData.idImageUrl}
                        alt="Profile picture"
                        width={100}
                        height={100}
                        className="rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-[100px] h-[100px] rounded-lg flex items-center justify-center bg-gray-100">
                        <Camera className="h-8 w-8 text-gray-400" />
                      </div>
                    )}
                  </>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  id="imageUpload"
                />
                
              </div>
              <Button
                    variant="outline"
                    className="relative flex items-center gap-2"
                  >
                    <Upload className="h-4 w-4" />
                    Change Image
                    <input
                      type="file"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      onChange={handleImageChange}
                      accept="image/*"
                    />
                  </Button>
                  {/*/check*/}
            </div>
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
      </div>
    </div>
  );
}
