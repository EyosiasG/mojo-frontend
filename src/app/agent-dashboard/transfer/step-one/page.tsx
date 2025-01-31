"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CardContent } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import NotificationProfile from "@/components/NotificationProfile";
import BackLink from "@/components/BackLink";
import Swal from 'sweetalert2';

const Page = () => {
  const [amount, setAmount] = useState<string>("");
  const exchangeRate = 127.65;
  const transactionFee = 0.0;

  const calculateETB = (usd: string): number => {
    const numAmount = parseFloat(usd) || 0;
    return numAmount * exchangeRate;
  };

  const formatCurrency = (value: number): string => {
    return value.toFixed(2);
  };

  const handleNext = () => {
    const numAmount = parseFloat(amount) || 0;
    if (numAmount <= 0) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid Amount',
        text: 'Please enter an amount greater than 0',
      });
      return;
    }
    window.location.href = `step-two?amount=${amount}`;
  };

  return (
    <div className="min-h-screen bg-blue-50">
      <div className=" max-w-5xl mx-30 p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl ml-8 font-semibold text-primary">
            Transfer Money
          </h1>
          <div className="flex items-center gap-4">
            <NotificationProfile
              profileLink="/agent-dashboard/settings"
              notificationLink="/agent-dashboard/notifications"
            />
          </div>
        </div>

        {/* Main Content */}
        <main className="p-4 max-w-xl mx-auto">
          <div className="mb-6">
            <BackLink>
              <ArrowLeft className="h-4 w-4" />
              Send Money
            </BackLink>
          </div>

          <>
            <CardContent className="p-6">
              {/* Progress Steps */}
              <div className="flex gap-2  mb-8">
                <div className="h-1 w-20 rounded bg-primary" />
                <div className="h-1 w-20 rounded bg-gray-200" />
              </div>

              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold mb-1">Enter Amount</h2>
                  <p className="text-sm text-muted-foreground mb-4">
                    The amount below is based on the current exchange rate of 1
                    USD to ETB
                  </p>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        To Be Sent
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2">
                          $
                        </span>
                        <Input
                          type="text"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          className="pl-7 bg-white"
                          placeholder="0.00"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Amount in ETB</span>
                        <span>1 $ = {formatCurrency(exchangeRate)} ETB</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Transaction Fee</span>
                        <span>{formatCurrency(transactionFee)} ETB</span>
                      </div>
                      <div className="flex justify-between text-sm font-medium pt-2 border-t">
                        <span>Total Receivable</span>
                        <span>
                          ETB = {formatCurrency(calculateETB(amount))} ETB
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between pt-4">
                  <BackLink>
                    <ArrowLeft className="h-4 w-4" />
                    Go Back
                  </BackLink>
                 
                  <Button onClick={handleNext}>Next</Button>
                </div>
              </div>
            </CardContent>
          </>
        </main>
      </div>
    </div>
  );
};

export default Page;
