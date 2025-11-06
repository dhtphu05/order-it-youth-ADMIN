import axios, {
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
} from 'axios';

export const axiosBaseInstance: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL ?? 'https://api.example.com',
  headers: { 'Content-Type': 'application/json' },
});

export const axiosInstance = async <TResponse>(
  config: AxiosRequestConfig,
  _options?: unknown,
): Promise<AxiosResponse<TResponse>> => {
  return axiosBaseInstance.request<TResponse>(config);
};
