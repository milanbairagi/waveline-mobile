import { getData, saveData } from "@/utils/aStorage";
import axios from "axios";
import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY } from "../constants";
import { getApiBaseURL } from "./getBaseUrl";

// Create an Axios instance with a base URL and timeout
const api = axios.create({
  timeout: 10000,
});

// Add a request interceptor to include the access token in the headers
api.interceptors.request.use(
  async (config) => {
    const token = await getData(ACCESS_TOKEN_KEY);
    const apiBaseURL = await getApiBaseURL();
    if (config.url && !config.url.startsWith("http")) {
      config.url = `${apiBaseURL}${config.url}`;
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // If the error is a 401 Unauthorized and the request has not been retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = await getData(REFRESH_TOKEN_KEY);
      if (refreshToken) {
        try {
          const response = await axios.post(
            `${await getApiBaseURL()}/token/refresh/`,
            {
              refresh: refreshToken,
            },
          );
          saveData(ACCESS_TOKEN_KEY, response.data.access);
          originalRequest.headers.Authorization = `Bearer ${response.data.access}`;
          return api(originalRequest);
        } catch (refreshError) {
          console.log("Refresh token failed:", refreshError);
        }
      }
    }

    return Promise.reject(error);
  },
);

export default api;
