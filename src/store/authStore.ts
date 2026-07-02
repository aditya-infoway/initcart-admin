import { create } from "zustand";
import axios from "axios";
import Swal from "sweetalert2";

interface User {
  email: string;
  access: string;
  refresh: string;
  role?: string;
}

// ← UPDATED: boolean ki jagah object
interface LoginResult {
  success: boolean;
  rateLimited: boolean;
}

interface AuthState {
  isAuthenticated: boolean;
  isRestoring: boolean;
  user: User | null;
  inactivityTimer: any;

  login: (credentials: { email: string; password: string }) => Promise<LoginResult>; // ← UPDATED
  logout: () => void;
  logoutAndRedirect: () => void;
  loadSessionFromStorage: () => void;
  startTimers: () => void;
  clearTimers: () => void;
  resetInactivityTimer: () => void;
}

axios.defaults.baseURL = "http://localhost:8000";
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem("access");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── NEW: Auto refresh response interceptor ──────────────────────
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem("refresh");

      if (!refreshToken) {
        useAuthStore.getState().logoutAndRedirect();
        return Promise.reject(error);
      }

      try {
        const res = await axios.post("/api/token/refresh/", {
          refresh: refreshToken,
        });

        const newAccess = res.data.access;
        // Naya refresh bhi update karo agar aaya
        if (res.data.refresh) {
          localStorage.setItem("refresh", res.data.refresh);
        }
        localStorage.setItem("access", newAccess);
        axios.defaults.headers.common["Authorization"] = `Bearer ${newAccess}`;
        originalRequest.headers["Authorization"] = `Bearer ${newAccess}`;

        return axios(originalRequest);
      } catch (refreshError) {
        // Refresh bhi fail — logout
        useAuthStore.getState().logoutAndRedirect();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

const INACTIVITY_TIMEOUT = 60 * 60 * 1000;

const clearStorage = () => {
  localStorage.removeItem("access");
  localStorage.removeItem("refresh");
  localStorage.removeItem("email");
  localStorage.removeItem("role");
  sessionStorage.removeItem("sa_active");
  delete axios.defaults.headers.common["Authorization"];
};

const showSessionAlert = (message: string, onConfirm: () => void) => {
  Swal.fire({
    title: "Session Expired",
    text: message,
    icon: "warning",
    confirmButtonText: "OK",
    allowOutsideClick: false,
  }).then(onConfirm);
};

export const useAuthStore = create<AuthState>((set, get) => ({
  isAuthenticated: false,
  isRestoring: true,
  user: null,
  inactivityTimer: null,

  loadSessionFromStorage: () => {
    const isPageRefresh = sessionStorage.getItem("sa_active");

    if (isPageRefresh) {
      const access  = localStorage.getItem("access");
      const refresh = localStorage.getItem("refresh");
      const email   = localStorage.getItem("email");
      const role    = localStorage.getItem("role");

      if (access && email) {
        axios.defaults.headers.common["Authorization"] = `Bearer ${access}`;
        set({
          isAuthenticated: true,
          isRestoring: false,
          user: { email, access, refresh: refresh || "", role: role || "" },
        });
        get().startTimers();
        return;
      }
    }

    set({ isAuthenticated: false, isRestoring: false });
  },

  // ← UPDATED: ab LoginResult return karta hai
  login: async ({ email, password }): Promise<LoginResult> => {
    try {
      const res = await axios.post("/api/auth/superadmin/login/", { email, password });
      const { access, refresh, role } = res.data;

      localStorage.setItem("access", access);
      localStorage.setItem("refresh", refresh);
      localStorage.setItem("email", email);
      localStorage.setItem("role", role);
      sessionStorage.setItem("sa_active", "true");

      axios.defaults.headers.common["Authorization"] = `Bearer ${access}`;

      set({
        isAuthenticated: true,
        isRestoring: false,
        user: { email, access, refresh, role },
      });
      get().startTimers();

      return { success: true, rateLimited: false };
    } catch (err: any) {
      // 429 = rate limited
      if (err.response?.status === 429) {
        return { success: false, rateLimited: true };
      }
      return { success: false, rateLimited: false };
    }
  },

  logoutAndRedirect: () => {
    get().clearTimers();
    clearStorage();
    set({ isAuthenticated: false, isRestoring: false, user: null });
    window.location.href = "/superadmin/login";
  },

  logout: () => {
    get().clearTimers();
    clearStorage();
    set({ isAuthenticated: false, isRestoring: false, user: null });
  },

  startTimers: () => {
    get().clearTimers();

    const inactivityTimer = setTimeout(() => {
      if (window.location.pathname !== "/superadmin/login") {
        showSessionAlert(
          "You were inactive for 1 hour. Please login again.",
          () => get().logoutAndRedirect()
        );
      }
    }, INACTIVITY_TIMEOUT);

    set({ inactivityTimer });
  },

  clearTimers: () => {
    const { inactivityTimer } = get();
    if (inactivityTimer) clearTimeout(inactivityTimer);
    set({ inactivityTimer: null });
  },

  resetInactivityTimer: () => {
    if (!get().isAuthenticated) return;
    if (get().inactivityTimer) clearTimeout(get().inactivityTimer);

    const inactivityTimer = setTimeout(() => {
      if (window.location.pathname !== "/superadmin/login") {
        showSessionAlert(
          "You were inactive for 1 hour. Please login again.",
          () => get().logoutAndRedirect()
        );
      }
    }, INACTIVITY_TIMEOUT);

    set({ inactivityTimer });
  },
}));