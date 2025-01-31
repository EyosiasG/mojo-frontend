"use client";
import { useState, useEffect, SetStateAction } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CardContent } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import NotificationProfile from "@/components/NotificationProfile";
import BackLink from "@/components/BackLink";
import { fetchWithAuth } from "@/components/utils/fetchwitAuth";
import { useSearchParams } from "next/navigation";
import Swal from 'sweetalert2';
import { useRouter } from "next/navigation";
import { banksApi} from "@/api/banks/index";
import { usersApi } from "@/api/users/index";
import { transactionsApi } from "@/api/transactions/index";

const Page = () => {
  const searchParams = useSearchParams();
  const amount = searchParams.get("amount") || "";
  console.log({ amount });
  const [bank, setBank] = useState<string | null>(null);
  const [accountNumber, setAccountNumber] = useState<string>("");
  const [senderName, setSenderName] = useState<string>("");
  const [recieverName, setRecieverName] = useState<string>("");
  const [accountName, setAccountName] = useState<string>("");
  const [banks, setBanks] = useState([]);
  const [customers, setCustomers] = useState<string[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<string[]>([]);
  const [filteredRecievers, setFilteredRecievers] = useState<string[]>([]);
  const [users, setUsers] = useState<string[]>([]);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [senderId, setSenderId] = useState<string | null>(null);
  const [recieverId, setRecieverId] = useState<string | null>(null);
  const [customerMap, setCustomerMap] = useState<{ [key: string]: string }>({});
  const router = useRouter();

  const exchangeRate = 127.65; 

  const calculateETB = (usd: string): number => {
    const numAmount = parseFloat(usd) || 0;
    return numAmount * exchangeRate;
  };


  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        // Fetch banks using banksApi
        const banksData = await banksApi.getAllBanks();
        if (isMounted) {
          setBanks(banksData);
          console.log("banks: ", banks);
        }

        // Fetch users using usersApi
        const usersData = await usersApi.getAllUsers();
        if (isMounted) {
          const userNames = usersData.map((user: { first_name: string; last_name: string }) =>
            `${user.first_name} ${user.last_name}`
          );
          const userMap = usersData.reduce((map: { [key: string]: string }, user: { id: string; first_name: string; last_name: string }) => {
            map[`${user.first_name} ${user.last_name}`] = user.id;
            return map;
          }, {});
          setCustomers(userNames);
          setCustomerMap(userMap);
          setUsers(userNames);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Add validation checks for amount
    if (!amount || isNaN(parseFloat(amount))) {
      Swal.fire({
        icon: 'error',
        title: 'Validation Error',
        text: 'Please enter a valid amount'
      });
      return;
    }

    // Validation checks
    if (!bank) {
      Swal.fire({
        icon: 'error',
        title: 'Validation Error',
        text: 'Please select a bank'
      });
      return;
    }

    if (!senderId) {
      Swal.fire({
        icon: 'error',
        title: 'Validation Error',
        text: 'Please select a valid sender from the suggestions'
      });
      return;
    }

    if (!recieverId) {
      Swal.fire({
        icon: 'error',
        title: 'Validation Error',
        text: 'Please select a valid receiver from the suggestions'
      });
      return;
    }

    if (!accountNumber) {
      Swal.fire({
        icon: 'error',
        title: 'Validation Error',
        text: 'Please enter an account number'
      });
      return;
    }

    try {
      const token = localStorage.getItem('access_token');
      console.log('Token:', token);

      if (!token) {
        throw new Error('No authentication token found');
      }

      const requestData = {
        currency_id: 1,
        amount: parseFloat(amount),
        bank_name: bank,
        etb_amount: calculateETB(amount),
        sender_name: senderName,
        receiver_name: accountName,
        account_number: accountNumber,
        sender_id: senderId,
        receiver_id: recieverId
      };

      const response = await fetch("https://mojoapi.crosslinkglobaltravel.com/api/transfers", {
        method: "POST",
        body: JSON.stringify(requestData),
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
          "Accept": "application/json"
        },
        mode: 'cors'
      });
      
      console.log('Response Status:', response.status);
      
      if (response.status === 403) {
        throw new Error('You do not have permission to perform this action. Please contact your administrator.');
      }

      if (!response.ok) {
        const errorData = await response.json();
        console.log('Error Response:', errorData); // Log the error response
        throw new Error(errorData?.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Success Response:', data); // Log the success response
      
      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'Transaction successfully added! Redirecting to transfers page',
      });
      
      setTimeout(() => {
        router.push("/agent-dashboard/transfer");
      }, 2000);

    } catch (error) {
      console.error("Full Error:", error);
      
      // More specific error message for 403
      const errorMessage = error instanceof Error && error.message.includes('permission') 
        ? 'You do not have permission to perform this action. Please contact your administrator.'
        : error instanceof Error 
          ? error.message 
          : 'An unexpected error occurred. Please try again.';
      
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: errorMessage,
      });

      // If it's a permission error, you might want to redirect to a different page
      if (error instanceof Error && error.message.includes('permission')) {
        // router.push('/unauthorized'); // Uncomment if you have an unauthorized page
      }
    }
  };

  const handleBankChange = (value: SetStateAction<string | null>) => {
    setBank(value);
    setFilteredCustomers([]);
  };

  const handleCustomerNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    setSenderName(inputValue);

    // Filter customers based on input
    const suggestions = customers.filter(customer =>
      customer.toLowerCase().includes(inputValue.toLowerCase())
    );
    setFilteredCustomers(suggestions);

    // Clear suggestions if input is empty
    if (!inputValue) {
      setFilteredCustomers([]); // Clear suggestions if input is empty
    }
  };

  const handleSuggestionClick = (customer: string) => {
    setSenderName(customer);
    setFilteredCustomers([]); // Clear suggestions when a suggestion is selected
    setSenderId(customerMap[customer]); // Set senderId based on selected customer
    console.log("SenderID: ", senderId);
  };


  const handleRecieverNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    setRecieverName(inputValue);

    // Filter users (not customers) based on input
    const suggestions = users.filter(user =>
      user.toLowerCase().includes(inputValue.toLowerCase())
    );
    setFilteredRecievers(suggestions);

    // Clear suggestions if input is empty
    if (!inputValue) {
      setFilteredRecievers([]);
    }
  };

  const handleRecieverSuggestionClick = (customer: string) => {
    setRecieverName(customer);
    setAccountName(customer);
    setFilteredRecievers([]);
    setRecieverId(customerMap[customer]);
  };

  const closePopup = () => {
    setSuccessMessage(null);
  };

  return (
    <div className="min-h-screen bg-blue-50">
      <style jsx>{`
        .suggestions-list {
          border: 1px solid #ddd;
          border-top: none;
          background-color: white;
          position: absolute;
          width: 100%;
          z-index: 1000;
        }

        .suggestions-list li {
          padding: 8px 12px;
          cursor: pointer;
        }

        .suggestions-list li:hover {
          background-color: #f0f0f0;
        }
      `}</style>
      <div className="min-h-screen bg-blue-50">
        {successMessage && (
          <div className="fixed top-0 left-0 right-0 z-50 flex justify-center">
            <div className="bg-green-500 text-white p-4 rounded shadow-md">
              {successMessage}
              <button onClick={closePopup} className="ml-4 text-black">Close</button>
            </div>
          </div>
        )}
        <div className="max-w-5xl mx-30 p-8">
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

            <CardContent className="p-6">
              {/* Progress Steps */}
              <div className="flex gap-2 mb-8">
                <div className="h-1 w-20 rounded bg-primary" />
                <div className="h-1 w-20 rounded bg-primary" />
              </div>

              <div className="space-y-6">
                <form onSubmit={handleSubmit}>
                  <div>
                    <h2 className="text-lg font-semibold mb-1">Enter Amount</h2>
                    <p className="text-sm text-muted-foreground mb-6">
                      The amount below is based on the current exchange rate of 1
                      USD to ETB
                    </p>

                    <div className="space-y-6">
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm mb-1">Amount</label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2">
                              $
                            </span>
                            <Input
                              type="text"
                              value={amount}
                              // onChange={(e) => setAmount(e.target.value)}
                              className="pl-7 bg-gray-100"
                              disabled
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm mb-1">
                            Amount in ETB received
                          </label>
                          <Input
                            type="text"
                            value={`${calculateETB(amount)} ETB`}
                            disabled
                            className="bg-gray-100"
                          />
                        </div>
                      </div>
                      <div>
                          <label className="block text-sm text-muted-foreground mb-1">
                            Customer Name
                          </label>
                          <Input
                            type="text"
                            value={senderName}
                            onChange={handleCustomerNameChange}
                            placeholder="Enter sender name"
                            className="bg-white"
                          />
                          {filteredCustomers.length > 0 && (
                            <ul className="suggestions-list" style={{ maxHeight: '150px', overflowY: 'auto' }}>
                              {filteredCustomers.map((customer, index) => (
                                <li key={index} onClick={() => handleSuggestionClick(customer)}>
                                  {customer}
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm text-muted-foreground mb-1">
                            Bank Name
                          </label>
                          <select
                            value={bank || ""}
                            onChange={(e) => handleBankChange(e.target.value)}
                            className="block w-full border rounded p-2"
                          >
                            <option value="" disabled>Select a bank</option>
                            {banks.map((bank) => (
                              <option key={bank.id} value={bank.id}>
                                {bank.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm text-muted-foreground mb-1">
                            Recipient Account Number
                          </label>
                          <Input
                            type="text"
                            value={accountNumber}
                            onChange={(e) => setAccountNumber(e.target.value)}
                            placeholder="Enter account number"
                            className="bg-white"
                          />
                        </div>
                       

                        <div>
                          <label className="block text-sm text-muted-foreground mb-1">
                            Recipient Name
                          </label>
                          <Input
                            type="text"
                            value={recieverName}
                            onChange={handleRecieverNameChange}
                            placeholder="Enter recipient name"
                            className="bg-white"
                          />
                          {filteredRecievers.length > 0 && (
                            <ul className="suggestions-list" style={{ maxHeight: '150px', overflowY: 'auto' }}>
                              {filteredRecievers.map((customer, index) => (
                                <li key={index} onClick={() => handleRecieverSuggestionClick(customer)}>
                                  {customer}
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>


                  <div className="flex justify-between pt-4">
                    <Button 
                      variant="ghost" 
                      onClick={() => router.back()} 
                      className="flex items-center gap-2"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Go Back
                    </Button>
                    <Button type="submit">Confirm Payment</Button>
                  </div>

                </form>
              </div>
            </CardContent>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Page;
