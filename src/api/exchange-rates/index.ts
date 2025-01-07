import { fetchWithAuth } from "@/components/utils/fetchwitAuth";

const BASE_URL = "https://mojoapi.crosslinkglobaltravel.com/api";

interface ExchangeRate {
  id: string;
  name: string;
  sign: string;
  rate: string;
  status: string;
  created_at: string;
}

interface ExchangeRateFormData {
  currency_id: string;
  rate: string;
  effective_date: string;
}

export const exchangeRatesApi = {
  // Get all exchange rates or search by ID
  getAllRates: async (searchTerm?: string) => {
    const url = searchTerm 
      ? `${BASE_URL}/rates/${searchTerm}`
      : `${BASE_URL}/rates`;

    const response = await fetchWithAuth(url);
    const data = await response.json();

    // Handle single rate response for search
    if (data.status === "success" && !Array.isArray(data.data)) {
      return {
        status: "success",
        data: [data.data] // Wrap single object in array
      };
    }

    // Handle "No Exchange rate found" response
    if (data.status === "failed" && data.message === "No Exchange rate found!") {
      return { 
        status: "success", 
        data: [] 
      };
    }

    return data;
  },

  // Get single exchange rate by ID
  getRateById: async (rateId: string) => {
    const response = await fetchWithAuth(`${BASE_URL}/rates/${rateId}`);
    return response.json();
  },

  // Create new exchange rate
  createRate: async (formData: ExchangeRateFormData) => {
    const response = await fetchWithAuth(`${BASE_URL}/rates`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      },
      body: JSON.stringify(formData),
    });
    return response.json();
  },

  // Update exchange rate
  updateRate: async (rateId: string, formData: ExchangeRateFormData) => {
    const response = await fetchWithAuth(`${BASE_URL}/rates/${rateId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });
    return response.json();
  },

  // Delete exchange rate
  deleteRate: async (rateId: string) => {
    const response = await fetchWithAuth(`${BASE_URL}/rates/${rateId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.ok;
  }
}; 