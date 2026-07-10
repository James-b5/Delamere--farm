"use client";

import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export interface AuthUser {
  id: string;
  name: string | null;
  email: string;
  phone?: string | null;
  address?: string;
  county?: string;
  role: "USER" | "ADMIN" | "MODERATOR";
}

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  register: (
    name: string,
    email: string,
    password: string,
    confirmPassword: string,
    phone?: string
  ) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<AuthUser>) => void;
  isAdmin: boolean;
  isModerator: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const token = localStorage.getItem("auth_token");
    const storedUser = localStorage.getItem("auth_user");

    if (token && storedUser) {
      try {
        setUser(JSON.parse(storedUser) as AuthUser);
      } catch (e) {
        localStorage.removeItem("auth_token");
        localStorage.removeItem("auth_user");
      }
    }
    setIsLoading(false);
  }, []);

  const redirectToDashboard = () => {
    // Prefer client-side replace; fall back to push on the server and a hard navigation
    if (typeof window !== "undefined") {
      try {
        router.replace("/dashboard");
      } catch (e) {
        // If client-side routing fails for any reason, do a hard navigation
        window.location.href = "/dashboard";
      }
      // Force a hard navigation shortly after to avoid SPA timing races in E2E
      // (router.replace may be delayed under test harnesses)
      setTimeout(() => {
        try {
          if (typeof window !== "undefined" && window.location.pathname === "/login") {
            window.location.replace("/dashboard");
          }
        } catch (e) {
          // best-effort
          try { window.location.href = "/dashboard"; } catch (e) {}
        }
      }, 200);
    } else {
      router.push("/dashboard");
    }
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    confirmPassword: string,
    phone?: string
  ) => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          password,
          confirmPassword,
          phone: phone || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Registration failed");
      }

      localStorage.setItem("auth_token", data.token);
      localStorage.setItem("auth_user", JSON.stringify(data.user));
      setUser(data.user);
      // Notify other listeners/tabs that auth changed and give consumers a moment
      try {
        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("auth:updated"));
          // small delay to ensure localStorage is read by subsequent navigation/renders (helps E2E timing)
          await new Promise((r) => setTimeout(r, 50));
        }
      } catch (e) {
        // ignore
      }

      toast.success("Account created successfully!");
      redirectToDashboard();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Registration failed";
      toast.error(message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      console.log('auth-context-login-start', { email, password });
      setIsLoading(true);
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ email, password }).toString(),
      });

      const data = await response.json();
      console.log("auth-login-response", response.status, data);

      if (!response.ok) {
        throw new Error(data.error || "Login failed");
      }

      localStorage.setItem("auth_token", data.token);
      localStorage.setItem("auth_user", JSON.stringify(data.user));
      setUser(data.user);
      // Notify other listeners/tabs that auth changed and give consumers a moment
      try {
        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("auth:updated"));
          await new Promise((r) => setTimeout(r, 50));
        }
      } catch (e) {
        // ignore
      }

      toast.success("Logged in successfully!");

      // All logged in users go to dashboard
      redirectToDashboard();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Login failed";
      toast.error(message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
    setUser(null);
    toast.success("Logged out successfully");
    router.push("/");
  };

  const updateProfile = (data: Partial<AuthUser>) => {
    if (user) {
      const updated = { ...user, ...data };
      setUser(updated);
      localStorage.setItem("auth_user", JSON.stringify(updated));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        register,
        login,
        logout,
        updateProfile,
        isAdmin: user?.role === "ADMIN",
        isModerator: user?.role === "MODERATOR",
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
