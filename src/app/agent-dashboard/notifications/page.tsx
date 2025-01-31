"use client"

import { CheckCircle2, Search, XCircle, Bell } from "lucide-react";
import { Input } from "@/components/ui/input";
import NotificationProfile from "@/components/NotificationProfile";
import { useEffect, useState } from "react";
import Image from "next/image";
import { fetchWithAuth } from "@/components/utils/fetchwitAuth";

interface Notification {
  id: number;
  success: boolean;
  message: string;
  recipient: string;
  timestamp: string;
}

export default function NotificationPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await fetchWithAuth('https://mojoapi.crosslinkglobaltravel.com/api/notifications'); // Replace with your API endpoint
        const data = await response.json();
        setNotifications(data);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  return (
    <div className="container mx-auto p-4 min-h-screen bg-blue-50">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Notification</h1>
        <div className="flex items-center gap-4">

          <NotificationProfile
            profileLink="/agent-dashboard/settings"
            notificationLink="/agent-dashboard/notifications"
          />
        </div>
      </div>

      <div className="rounded-lg border bg-card">
        <div className="border-b p-4">
          <h2 className="font-semibold">Most Recent</h2>
        </div>
        
        {loading ? (
          <div className="p-8 text-center">
            <p>Loading notifications...</p>
          </div>
        ) : notifications.length > 0 ? (
          <div className="divide-y">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className="flex items-start gap-3 p-4 transition-colors hover:bg-muted/50"
              >
                {notification.success ? (
                  <CheckCircle2 className="mt-1 h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="mt-1 h-5 w-5 text-red-500" />
                )}
                <div className="flex-1">
                  <p className="font-medium">
                    {notification.message}{" "}
                    <span className="text-muted-foreground">
                      To {notification.recipient}
                    </span>
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {notification.timestamp}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-8">
            <Bell className="h-16 w-16 text-gray-300 mb-4" />
            <p className="text-lg font-medium text-gray-500">No notifications yet</p>
            <p className="text-sm text-gray-400">When you receive notifications, they will appear here</p>
          </div>
        )}
      </div>
    </div>
  );
}
