import axios, {
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
} from 'axios';
import { getAccessToken } from '../auth-storage';

export const axiosBaseInstance: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:4000',
  headers: { 'Content-Type': 'application/json' },
});

axiosBaseInstance.interceptors.request.use((config) => {
  const token = getAccessToken();
  console.log('[Axios Interceptor] Token found:', !!token, 'URL:', config.url);
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const axiosInstance = async <TResponse>(
  config: AxiosRequestConfig,
  _options?: unknown,
): Promise<AxiosResponse<TResponse>> => {
  return axiosBaseInstance.request<TResponse>(config);
};
