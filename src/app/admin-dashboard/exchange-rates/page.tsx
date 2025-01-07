"use client";

import { useState, useEffect } from "react";
import { Search, Filter, Download, MoreVertical, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import Link from "next/link";
import NotificationProfile from "@/components/NotificationProfile";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { exchangeRatesApi } from "@/api/exchange-rates";

interface CurrencyEntry {
  id: string;
  name: string;
  sign: string;
  rate: string;
  status: string;
  created_at: string;
}

export default function Page() {
  const [rates, setRates] = useState<CurrencyEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchId, setSearchId] = useState<string>("");

  const fetchRates = async (searchTerm = "") => {
    try {
      const response = await exchangeRatesApi.getAllRates(searchTerm);
      
      if (response.status === "success") {
        setRates(Array.isArray(response.data) ? response.data : []);
      } else {
        setError("Failed to load exchange rates.");
        toast.error("Failed to load exchange rates");
        setRates([]);
      }
    } catch (err) {
      setError("Failed to load exchange rates.");
      toast.error("Failed to load exchange rates");
      console.error(err);
      setRates([]);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch on component mount
  useEffect(() => {
    fetchRates();
  }, []);

  const handleSearch = () => {
    fetchRates(searchId);
  };

  const handleDelete = async (id: string) => {
    const isConfirmed = window.confirm(
      "Are you sure you want to delete this exchange rate?"
    );
    if (!isConfirmed) return;

    try {
      const success = await exchangeRatesApi.deleteRate(id);
      if (success) {
        setRates(rates.filter((rate) => rate.id !== id));
        toast.success("Exchange rate deleted successfully");
      } else {
        toast.error("Failed to delete the exchange rate");
      }
    } catch (error) {
      console.error("Failed to delete:", error);
      toast.error("Failed to delete exchange rate");
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-lg font-medium text-gray-600">Loading exchange rates...</p>
      </div>
    </div>
  );
  
  if (error) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-red-50 p-6 rounded-lg">
        <p className="text-red-600 font-medium">{error}</p>
        <Button 
          variant="outline" 
          className="mt-4"
          onClick={() => fetchRates()}
        >
          Try Again
        </Button>
      </div>
    </div>
  );

  return (
    <div className="p-6 mx-auto">
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-primary">
          Currency Exchange Rates
        </h1>
        <div className="flex items-center gap-2">
          <NotificationProfile
            profileLink="/admin-dashboard/settings"
            notificationLink="/admin-dashboard/notifications"
          />
          <div className="w-8 h-8 rounded-full bg-gray-200" />
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="relative flex-1 ">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search by Rate ID" 
            className="pl-9 " 
            value={searchId}
            onChange={(e) => {
              setSearchId(e.target.value);
              if (e.target.value === "") {
                fetchRates();
              }
            }}
          />
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2" onClick={handleSearch}>
            <Search className="h-4 w-4" />
            Search
          </Button>
          <Link href="exchange-rates/add-exchange-rate">
            <Button>Create Exchange Rate</Button>
          </Link>
        </div>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Rate ID</TableHead>
              <TableHead>Currency</TableHead>
              <TableHead className="hidden md:table-cell">Rate</TableHead>
              <TableHead className="hidden md:table-cell">Created At</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rates.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-4">
                  No exchange rates found
                </TableCell>
              </TableRow>
            ) : (
              rates.map((rate) => (
                <TableRow key={rate.id}>
                  <TableCell>{rate.id}</TableCell>
                  <TableCell>{rate.name}</TableCell>
                  <TableCell className="hidden md:table-cell">{rate.rate}</TableCell>
                  <TableCell className="hidden md:table-cell">{rate.created_at}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Link
                            href={`./exchange-rates/view-exchange-rate/${rate.id}`}
                          >
                            View
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Link
                            href={`./exchange-rates/edit-exchange-rate/${rate.id}`}
                          >
                            Edit
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => handleDelete(rate.id)}
                        >
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
