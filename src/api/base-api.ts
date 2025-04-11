import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: `${process.env.REACT_APP_DHIS2_BASE_URL}`,
});

export interface FetchResponse<T> {
  count: number;
  next: string | null;
  results: T[];
}

export default axiosInstance;
