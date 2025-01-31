"use client"

import { Banknote, Send, Loader2 } from "lucide-react";
import { CircleCheck, CircleX, Clock2 } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import BarGraph from "@/components/charts/BarGraph";
import PieChart from "@/components/charts/PieChart";
import ProjectedBarGraph from "@/components/charts/ProjectedBarGraph";
import NotificationProfile from "@/components/NotificationProfile";
import Link from "next/link";
import { useEffect, useState } from "react";
import { transactionsApi } from '@/api/transactions';
import DailyBarGraph from "@/components/charts/DailyBarGraph";

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true);

  const [totalTransactions, setTotalTransactions] = useState(0);
  const [totalTransactionsByStatus, setTotalTransactionsByStatus] = useState({});
  const [monthlyData, setMonthlyData] = useState<{ month: string; total: number }[]>([]);
  const [date, setDate] = useState<Date | null>(null);

  useEffect(() => {
    const getTotal = async () => {
      try {
        const { totalTransactions, transactionsByStatus } = await transactionsApi.getDashboardStats();
        setTotalTransactions(totalTransactions);
        setTotalTransactionsByStatus(transactionsByStatus);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    getTotal();
  }, []);
  //com

  const today = new Date();
  const formattedDate = today.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const statusIcons = {
    success: <CircleCheck color="#11ff00" />,
    failed: <CircleX color="#ff0000" />,
    pending: <Clock2 color="#ff932e" />,
  };

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="bg-blue-50">
      <div className="bg-blue-50 p-4">
        <div className="flex flex-col sm:flex-row h-auto sm:h-16 items-center justify-between px-4 sm:px-6 py-4 sm:py-0">
          <h1 className="text-xl font-semibold text-[#2B3674] ml-8 mb-4 sm:mb-0">
            Main Dashboard
          </h1>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <Link href="agent-dashboard/transfer/step-one">
              <Button className="w-full sm:w-auto gap-2 rounded-full bg-primary hover:bg-primary/90">
                <Send className="h-4 w-4" />
                Send Money
              </Button>
            </Link>
            <NotificationProfile
              profileLink="/agent-dashboard/settings"
              notificationLink="/agent-dashboard/notifications"
            />
          </div>
        </div>
      </div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center px-4 sm:px-12 py-4 mt-10 gap-4 sm:gap-0">
        <div className="w-full sm:w-auto">
          <div className="flex flex-col bg-white rounded-xl px-4 sm:px-6 py-3 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 w-full sm:w-auto">
            <div className="flex flex-col w-full sm:w-auto">
              <span className="text-xs font-medium text-gray-500 mb-1">Exchange Rate</span>
              <div className="flex items-center justify-between sm:justify-start gap-2 mb-2">
                <div className="flex items-center">
                  <span className="text-sm font-bold text-gray-800">1 USD</span>
                  <span className="text-gray-400 mx-2">→</span>
                  <span className="text-lg font-bold text-primary">127.65 ETB</span>
                </div>
                <span className="text-xs text-green-500 bg-green-50 px-2 py-1 rounded-full">+2.3%</span>
              </div>
              <div className="flex items-center text-xs text-gray-500 mt-1 pt-2 border-t border-gray-100">
                <Clock2 className="h-3 w-3 mr-1" />
                <span className="whitespace-nowrap">Last updated: {new Date().toLocaleTimeString()}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="text-sm font-medium text-gray-700 w-full sm:w-auto text-left sm:text-right">
          {formattedDate.toString()}
        </div>
      </div>

      <div className="py-6">
        <div className="px-6">
          <div className="grid gap-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 px-4 md:px-12 lg:px-12">
              <BarGraph />
              <DailyBarGraph />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <ProjectedBarGraph />
              
              <Card className="p-6">
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                      <Banknote className="h-6 w-6 text-primary" />
                    </div>
                    <div className="text-2xl font-bold">${totalTransactions.toFixed(2)}</div>
                    <div className="text-sm text-gray-500 mb-3">Total Transaction</div>
                    <div className="flex space-x-4">
                      {Object.entries(totalTransactionsByStatus).map(([status, count]) => (
                        <div
                          key={status}
                          className="flex flex-col items-center space-y-2 p-4"
                        >
                          <div className="text-2xl">
                            {statusIcons[status] || <span>🔍</span>}
                          </div>
                          <span className="capitalize text-gray-600">{status}</span>
                          <span className="text-lg font-semibold">{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
