"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import BackLink from "@/components/BackLink";
import { exchangeRatesApi } from "@/api/exchange-rates";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Interface for Rate Data
interface Rate {
  id: string;
  name: string;
  rate: string;
  value: number;
  sign: string;
  created_at: string;
  status: string;
}

export default function ViewRate() {
  const { rateId } = useParams();
  const [rate, setRate] = useState<Rate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchRate() {
      try {
        const response = await exchangeRatesApi.getRateById(rateId as string);
        if (response.status === "success") {
          setRate(response.data);
        } else {
          setError("Rate not found.");
          toast.error("Rate not found");
        }
      } catch (err: any) {
        setError(err.message || "Failed to fetch exchange rate");
        toast.error(err.message || "Failed to fetch exchange rate");
      } finally {
        setLoading(false);
      }
    }

    if (rateId) fetchRate();
  }, [rateId]);

  // Handle loading and error states
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <ToastContainer />
      <div className="mb-8">
        <BackLink href="/exchange-rates" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span className="font-medium">Back to Exchange Rates</span>
        </BackLink>
      </div>

      <div className="space-y-8">
        <section className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-semibold mb-6">
            Rate Details
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">
                Rate ID
              </h3>
              <p className="text-base font-medium">{rate?.id}</p>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">
                Exchange Rate
              </h3>
              <p className="text-2xl font-semibold text-primary">
                {rate?.rate} {rate?.sign}
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">
                Effective Date
              </h3>
              <p className="text-base font-medium">
                {new Intl.DateTimeFormat("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                }).format(new Date(rate?.created_at || ""))}
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">
                Status
              </h3>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium
                ${rate?.status === "active" 
                  ? "bg-green-100 text-green-800" 
                  : "bg-yellow-100 text-yellow-800"
                }`}>
                {rate?.status === "active" ? "Active" : "Inactive"}
              </span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
