import AsyncStorage from "@react-native-async-storage/async-storage";
import axios, { AxiosInstance } from "axios";
import { useEffect } from "react";

// Create Axios instance with baseURL from .env
const axiosInstance: AxiosInstance = axios.create({
  baseURL: "http://10.0.2.2:8000",
  headers: {
    "Content-Type": "application/json",
  },
});

// Function to get the token asynchronously
const getToken = async () => {
  try {
    const token = await AsyncStorage.getItem("token");
    return token;
  } catch (error) {
    console.error("Error getting token:", error);
    return null;
  }
};

// Set up request interceptor
axiosInstance.interceptors.request.use(
  async (config) => {
    const token = await getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const callApi = async (
  method: "GET" | "POST" | "PUT" | "DELETE",
  url: string,
  data?: any
) => {
  try {
    const response = await axiosInstance({
      method,
      url,
      data,
    });
    return response.data;
  } catch (error) {
    // Handle error
    throw error;
  }
};

// Custom hook to encapsulate Axios logic
export const useAxios = () => {
  // Hook to clear interceptors on component unmount
  useEffect(() => {
    const interceptor = axiosInstance.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        // Handling token expiration or unauthorized
        if (error.response.status === 401) {
          // Logic to refresh token or handle logout
          console.log("Token expired or not authorized");
        }

        // Return any error you need to handle
        return Promise.reject(error);
      }
    );

    // Clean up interceptor on unmount
    return () => {
      axiosInstance.interceptors.response.eject(interceptor);
    };
  }, []);

  return {
    callApi,
  };
};
