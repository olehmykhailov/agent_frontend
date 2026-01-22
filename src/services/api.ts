import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    "Content-Type":"application/json"
  }
});

api.interceptors.request.use((config) => {
  // ⚠️ только в браузере
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("accessToken");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 403 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (typeof window !== "undefined") {
        const refreshToken = localStorage.getItem("refreshToken");
        const userId = localStorage.getItem("userId");

        if (refreshToken && userId) {
          try {
            const { data } = await axios.post(
              "/auth/refresh-token",
              { refreshToken, userId },
              { baseURL: process.env.NEXT_PUBLIC_API_URL }
            );

            localStorage.setItem("accessToken", data.accessToken);
            localStorage.setItem("refreshToken", data.refreshToken);

            originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
            return api(originalRequest);
          } catch (refreshError: any) {
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
            localStorage.removeItem("userId");
            window.location.href = "/auth";
            
            return Promise.reject(refreshError);
          }
        } else {
            window.location.href = "/auth";
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;