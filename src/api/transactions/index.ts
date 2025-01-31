import { fetchWithAuth } from '@/components/utils/fetchwitAuth';

const BASE_URL = 'https://mojoapi.crosslinkglobaltravel.com/api';

export const transactionsApi = {
  // Get dashboard statistics
  getDashboardStats: async () => {
    const response = await fetchWithAuth(`${BASE_URL}/agent/dashboard`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return {
      totalTransactions: data.total_transactions,
      transactionsByStatus: data.transactionsByStatus,
    };
  },

  // Get all transactions
  getAllTransactions: async () => {
    const response = await fetchWithAuth(`${BASE_URL}/transfers`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return response.json();
  },

  // Get single transaction
  getTransactionById: async (id: string) => {
    const response = await fetchWithAuth(`${BASE_URL}/transactions/${id}`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return response.json();
  },
  
  // Add new search method
  searchTransactions: async (searchTerm: string) => {
    const response = await fetchWithAuth(`${BASE_URL}/transactions/search/${searchTerm}`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return response.json();
  },

  // Create new transfer
  createTransfer: async (requestData: any) => {
    const response = await fetchWithAuth(`${BASE_URL}/transfers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw error;
    }
    
    return response.json();
  },
}; 