import axiosInstance from '../config/axios.config';

const orderService = {
  createOrder: async (payload) => {
    try {
      const response = await axiosInstance.post('/Order/create', payload);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  payOrderWithWallet: async ({ orderId, walletType }) => {
    try {
      const response = await axiosInstance.post('/Order/pay/wallet', {
        orderId,
        walletType
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

export default orderService;

