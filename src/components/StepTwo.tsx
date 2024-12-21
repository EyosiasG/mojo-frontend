"use client";
import { useState, useEffect, SetStateAction } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CardContent } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import NotificationProfile from "@/components/NotificationProfile";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import BackLink from "@/components/BackLink";
import { fetchWithAuth } from "@/components/utils/fetchwitAuth";
import { useSearchParams } from "next/navigation";

const Page = () => {
  const searchParams = useSearchParams();
  const amount = searchParams.get("amount") || "";
  console.log({ amount });
  const [bank, setBank] = useState<string | null>(null);
  const [accountNumber, setAccountNumber] = useState<string>("");
  const [senderName, setSenderName] = useState<string>("");
  const [accountName, setAccountName] = useState<string>("");
  const [banks, setBanks] = useState([]);
  const [customers, setCustomers] = useState<string[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<string[]>([]);
  const [users, setUsers] = useState<string[]>([]);

  const exchangeRate = 122.5; // 1 USD = 122.5 ETB for this example

  const calculateETB = (usd: string): number => {
    const numAmount = parseFloat(usd) || 0;
    return numAmount * exchangeRate;
  };
 

  useEffect(() => {
    let isMounted = true; // track whether the component is mounted

    const fetchBanks = async () => {
      try {
        const response = await fetchWithAuth("https://mojoapi.siltet.com/api/transfers/create");
        if (!response.ok) {
          throw new Error("Failed to fetch banks");
        }
        const data = await response.json();
        if (isMounted) {
          setBanks(data.banks);
        }
      } catch (error) {
        console.error("Error:", error);
      }
    };


    const fetchUsers = async () => {
      try {
        const response = await fetchWithAuth(
          "https://mojoapi.siltet.com/api/users"
        );
        if (!response.ok) {
          throw new Error("Failed to fetch users");
        }
        const data = await response.json();
        if (!data.users) {
          throw new Error('Invalid response format from server');
        }
        console.log("Fetched Users:", data.users);
        const userNames = data.users.map(user => `${user.first_name} ${user.last_name}`);
        setCustomers(userNames);
        console.log("Fetched Users:", userNames);
      } catch (error) {
        console.error("Error:", error);
      }
    } 
    fetchBanks();
    fetchUsers();
    return () => {
      isMounted = false; // cleanup function to set isMounted to false
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const requestData = {
      currency_id: 1,
      amount: amount,
      bank_name: bank,
      etb_amount: calculateETB(amount),
      sender_name: senderName,
      receiver_name: accountName,
      account_number: accountNumber,
    };

    console.log("Request Data:", requestData);

    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        alert("No authentication token found.");
        return;
      }
    
      const response = await fetch("https://mojoapi.siltet.com/api/transfers", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });
    
      if (!response.ok) {
        const error = await response.json();
        console.error("API Error:", error);
        alert(`Error: ${error.message}`);
        return;
      }
    
      const data = await response.json();
      console.log("Transfer successful", data);
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred while making the request.");
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
  };

  const dummyCustomers = [
    "John Doe",
    "Jane Smith",
    "Alice Johnson",
    "Bob Brown",
    "Charlie Davis",
  ];

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-5xl mx-30 p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-primary">
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
                            className="pl-7"
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
                          className="bg-gray-50"
                        />
                      </div>
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
                        />
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

                      <div>
                        <label className="block text-sm text-muted-foreground mb-1">
                          Recipient Account Name
                        </label>
                        <Input
                          type="text"
                          value={accountName}
                          onChange={(e) => setAccountName(e.target.value)}
                          placeholder="Enter account name"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between pt-4">
                  <Button variant="outline">Previous</Button>
                  <Button type="submit">Confirm Payment</Button>
                </div>
              </form>
            </div>
          </CardContent>
        </main>
      </div>
    </div>
  );
};

export default Page;
