import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "/api",
  withCredentials: true,
});

const AUTH_PATHS = ["/auth/login", "/auth/signup", "/auth/check"];

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url ?? "";
    const isAuthRequest = AUTH_PATHS.some((p) => url.includes(p));

    if (status === 401 && !isAuthRequest) {
      window.location.href = "/login";
    }

    return Promise.reject(error);
  },
);

export default axiosInstance;
