'use client'

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, CheckCircle2, Eye, Download, Loader2 } from "lucide-react";
import Image from "next/image";
import NotificationProfile from "@/components/NotificationProfile";
import BackLink from "@/components/BackLink";
import { useParams } from 'next/navigation';
import { fetchWithAuth } from "@/components/utils/fetchwitAuth";
import { useEffect } from "react";
import { generateTransactionPDF } from '@/utils/pdfGenerator';
import { Button } from "@/components/ui/button";
import {transactionsApi} from "@/api/transactions";

const page = () => {
  const { transactionId } = useParams();
  const [transaction, setTransaction] = useState({});
  const [currencySign, setCurrencySign] = useState('$');
  const [isLoading, setIsLoading] = useState(true);

  const fetchTransaction = async () => {
    try {
      const data = await transactionsApi.getTransactionById(transactionId);
      return data.data;
    } catch (error) {
      console.error('Error fetching transaction:', error);
      // You might want to handle the error appropriately here
      throw error;
    }
  };

  const fetchCurrency = async (currencyId) => {
    try {
      console.log("Currency ID: ", currencyId);
      const response = await fetchWithAuth(`https://mojoapi.crosslinkglobaltravel.com/api/currencies/${currencyId}`);
      const data = await response.json();
      
      // Check if data and data.data exist before accessing sign
      return data?.data?.sign || '$'; // Return default '$' if sign is not available
    } catch (error) {
      console.error('Error fetching currency:', error);
      return '$'; // Return default '$' in case of any error
    }
  };

  const handleView = async () => {
    const pdfData = await generateTransactionPDF(transaction);
    const pdfUrl = URL.createObjectURL(new Blob([pdfData], { type: 'application/pdf' }));
    window.open(pdfUrl, '_blank');
  };
  
  const handleDownload = async () => {
    const pdfData = await generateTransactionPDF(transaction);
    const pdfUrl = URL.createObjectURL(new Blob([pdfData], { type: 'application/pdf' }));
    
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.setAttribute('download', 'transaction_details.pdf');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    const fetchAndSetTransaction = async () => {
      try {
        const transactionData = await fetchTransaction();
        setTransaction(transactionData);
        
        if (transactionData.currency_id) {
          const sign = await fetchCurrency(transactionData.currency_id);
          setCurrencySign(sign);
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchAndSetTransaction();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-blue-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-blue-50">
      {/* Header */}
      <header className="flex items-center justify-between p-4">
        <h1 className="text-xl font-semibold text-primary">
          Transaction History
        </h1>
        <div className="flex items-center gap-4">
          <NotificationProfile
            profileLink="/agent-dashboard/settings"
            notificationLink="/agent-dashboard/notifications"
          />
          <div className="h-8 w-8 rounded-full bg-gray-200 overflow-hidden">
            <Image
              src="/placeholder.svg?height=32&width=32"
              alt="Profile"
              width={32}
              height={32}
              className="object-cover"
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-4 max-w-4xl mx-auto">
        <div className="mb-6">
          <BackLink>
            <ArrowLeft className="h-4 w-4" />
            View Transaction
          </BackLink>
        </div>

        <Card>
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold mb-6">View Information</h2>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Sender Information */}
              <div>
                <div className="space-y-4">
                  <h3 className="text-md text-muted-foreground">
                    Sender Information
                  </h3>
                  <div className="grid gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Full name</p>
                      <p className="text-sm">{transaction.sender_name}</p>
                    </div>
                  </div>
                </div>
                <div className="md:col-span-1 grid md:grid-cols-1 pt-6 mt-5 border-t">
                <h3 className="text-md text-muted-foreground">
                Transaction Information
                </h3>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground mt-2">Amount</p>
                    <p className="font-medium">$ {transaction.amount}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Amount in ETB</p>
                    <p className="font-medium">{transaction.etb_amount}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Time</p>
                      <p className="font-medium">
                        {new Date(transaction.created_at).toLocaleDateString("en-US", {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                          hour12: true
                        })}
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle2 className="h-4 w-4" />
                      <span className="font-medium">{transaction.status}</span>
                    </div>
                  </div>
                </div>
               

                </div>

              </div>


              {/* Recipient Information */}
              <div className="space-y-4">
                <h3 className="text-md text-muted-foreground">
                  Recipient Information
                </h3>
                <div className="grid gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Full name</p>
                    <p className="font-medium">{transaction.receiver_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Account No.</p>
                    <p className="font-medium">{transaction.account_number}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Bank Name</p>
                    <p className="font-medium">{transaction.bank_name}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-muted-foreground">12/2/2024</p>
                    <Button variant="ghost" size="icon" onClick={() => handleView()}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDownload()}>
                      <Download className="h-4 w-4" />
                    </Button>
              </div> 
                </div>
              </div>
         
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default page;
