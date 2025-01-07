"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import BackLink from "@/components/BackLink";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Swal from 'sweetalert2';
import { exchangeRatesApi } from "@/api/exchange-rates";

interface ExchangeRate {
  id: string;
  name: string;
  sign: string;
  rate: string;
  status: string;
  created_at: string;
}

export default function EditExchangeRate() {
  const { rateId } = useParams();
  const [rate, setRate] = useState<ExchangeRate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();
  const [formData, setFormData] = useState({
    currency_id: "",
    rate: "",
    effective_date: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchRate = async () => {
      try {
        const response = await exchangeRatesApi.getRateById(rateId as string);
        if (response.status === "success") {
          setRate(response.data);
          setFormData({
            currency_id: response.data.currency_id,
            rate: response.data.rate,
            effective_date: response.data.effective_date,
          });
        } else {
          throw new Error("Failed to fetch rate");
        }
      } catch (err: any) {
        setError(err.message);
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (rateId) {
      fetchRate();
    }
  }, [rateId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await exchangeRatesApi.updateRate(rateId as string, formData);
      
      if (response.status === "success") {
        Swal.fire({
          title: 'Success!',
          text: 'Exchange rate updated successfully!',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        }).then(() => {
          router.push("/admin-dashboard/exchange-rates");
        });
      } else {
        throw new Error(response.message || "Failed to update exchange rate");
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="container mx-auto py-10 space-y-8 max-w-3xl">
      <ToastContainer />
      <BackLink href="/admin-dashboard/exchange-rates">
        <ArrowLeft /> Back to Exchange Rates
      </BackLink>
      
      <Card>
        <CardHeader>
          <CardTitle>Edit Exchange Rate</CardTitle>
          <p className="text-sm text-muted-foreground">
            Update the exchange rate details below
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currency_id">Currency ID</Label>
              <Input
                id="currency_id"
                name="currency_id"
                value={formData.currency_id}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="rate">Rate</Label>
              <Input
                id="rate"
                name="rate"
                type="number"
                step="0.01"
                value={formData.rate}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="effective_date">Effective Date</Label>
              <Input
                id="effective_date"
                name="effective_date"
                type="date"
                value={formData.effective_date}
                onChange={handleChange}
                required
              />
            </div>

            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Updating..." : "Update Exchange Rate"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
