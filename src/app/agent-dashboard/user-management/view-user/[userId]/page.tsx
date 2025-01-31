"use client";

import React, { useEffect, useState } from "react";
import BackLink from "@/components/BackLink";
import NotificationProfile from "@/components/NotificationProfile";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Eye, Download, FileText, Maximize2, X, Loader } from "lucide-react";
import Image from "next/image";
import { useParams } from "next/navigation";
import { fetchWithAuth } from "@/components/utils/fetchwitAuth";
import { PDFDocument, rgb } from 'pdf-lib'; // Import PDF generation library
import { usersApi } from "@/api/users";
import { generateUserPDF } from '@/utils/pdfGenerator';


export default function Page() {
  const { userId } = useParams();
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState(null);
  const [userImage, setUserImage] = useState<string | null>(null);
  const [isImageMaximized, setIsImageMaximized] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const data = await usersApi.getUserData(userId as string);
        setUserData(data.user);
        console.log("User Data:", data);
      } catch (err) {
        console.error("Failed to fetch user data:", err);
        setError("Failed to load user data." || err);
      }
    };

    if (userId) {
      fetchUserData();
    }
  }, [userId]);

  useEffect(() => {
    const loadImage = async () => {
      try {
        // Assuming the image URL is in userData.image_url
        const imageUrl = userData?.image_url;
        if (!imageUrl) return;

        const response = await fetch(imageUrl);
        if (!response.ok) throw new Error('Image not found');

        setUserImage(imageUrl);
      } catch (err) {
        console.log('Failed to load user image, using placeholder');
        setUserImage('https://toppng.com/uploads/preview/user-account-management-logo-user-icon-11562867145a56rus2zwu.png');
      }
    };

    if (userData) {
      loadImage();
    }
  }, [userData]);


  const handleView = async () => {
    try {
      setIsGeneratingPDF(true);
      const imgElement = document.querySelector('img[alt="ID Document"]') as HTMLImageElement;
      const pdfData = await generateUserPDF(userData, imgElement);
      
      // Open PDF in new tab
      const pdfUrl = URL.createObjectURL(new Blob([pdfData], { type: 'application/pdf' }));
      window.open(pdfUrl, '_blank');
      URL.revokeObjectURL(pdfUrl);
    } catch (err) {
      console.error('Failed to generate PDF:', err);
      // Add error notification here
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleDownload = async () => {
    try {
      setIsGeneratingPDF(true);
      const imgElement = document.querySelector('img[alt="ID Document"]') as HTMLImageElement;
      const pdfData = await generateUserPDF(userData, imgElement);
      
      // Trigger download
      const pdfUrl = URL.createObjectURL(new Blob([pdfData], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.setAttribute('download', `${userData?.first_name}_${userData?.last_name}_details.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(pdfUrl);
    } catch (err) {
      console.error('Failed to download PDF:', err);
      // Add error notification here
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  if (error) {
    return <p className="text-red-500 text-center">{error}</p>;
  }

  if (!userData) {
    return (
      <div className="h-screen flex flex-col items-center justify-center">
        <Loader className="h-8 w-8 animate-spin text-primary" />
        <p className="text-gray-500 mt-2">Loading user data...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-blue-50">
      {/* Header */}
      <header className="flex items-center justify-between p-4">
        <h1 className="text-xl font-semibold text-primary">User Management</h1>
        <div className="flex items-center gap-4">
          <NotificationProfile
            profileLink="/agent-dashboard/settings"
            notificationLink="/agent-dashboard/notifications"
          />

        </div>
      </header>

      {/* Main Content */}
      <main className="p-4 max-w-4xl mx-auto">

        <div className="mb-6">
          <BackLink>
            <ArrowLeft className="h-4 w-4" />
            User Details For - {userData.first_name} {userData.last_name}
          </BackLink>
        </div>

        <Card>
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold mb-6 text-center">View Information</h2>
            <div className="flex items-center justify-center gap-4 mb-10">
              <div className="relative w-full max-w-[300px]">
                <div className="aspect-[3/2] bg-gray-200 overflow-hidden rounded-lg">
                  <Image
                    src={userData.id_image || "https://toppng.com/uploads/preview/user-account-management-logo-user-icon-11562867145a56rus2zwu.png"}
                    alt="ID Document"
                    width={300}
                    height={200}
                    className="object-cover w-full h-full"
                  />
                </div>
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute top-2 right-2 bg-white/80 hover:bg-white"
                  onClick={() => setIsImageMaximized(true)}
                >
                  <Maximize2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-x-8 gap-y-6 max-w-2xl mx-auto px-4 sm:px-8">
              <div>
                <p className="text-sm text-muted-foreground mb-1">User ID</p>
                <p className="font-medium">{userData.id}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-1">First Name</p>
                <p className="font-medium">{userData.first_name}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-1">Last Name</p>
                <p className="font-medium">{userData.last_name}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-1">Email</p>
                <p className="font-medium">{userData.email}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-1">Phone no.</p>
                <p className="font-medium">{userData.phone}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-1">Registration Date</p>
                <p className="font-medium">
                  {userData.created_at
                    ? new Date(userData.created_at).toLocaleDateString(
                      "en-US",
                      {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      }
                    )
                    : "N/A"}
                </p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-1">Status</p>
                <p className="font-medium">{userData.status || "Active"}</p>
              </div>

              <div className="col-span-2 pt-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded">
                      <FileText className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">KYC PDF</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <p className="text-sm text-muted-foreground">12/2/2024</p>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleView()}
                      disabled={isGeneratingPDF}
                    >
                      {isGeneratingPDF ? <Loader className="h-4 w-4 animate-spin" /> : <Eye className="h-4 w-4" />}
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleDownload()}
                      disabled={isGeneratingPDF}
                    >
                      {isGeneratingPDF ? <Loader className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      {isImageMaximized && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="relative max-w-[90vw] w-fit h-fit max-h-[90vh] bg-white rounded-lg p-4">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 z-10"
              onClick={() => setIsImageMaximized(false)}
            >
              <X className="h-4 w-4" />
            </Button>
            <Image
              src={userData.id_image || "https://toppng.com/uploads/preview/user-account-management-logo-user-icon-11562867145a56rus2zwu.png"}
              alt="ID Document"
              width={1200}
              height={800}
              className="object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
}
