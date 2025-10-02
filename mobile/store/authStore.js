import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../constants/api";
export const useAuthStore = create((set) => ({
  user: null,
  token: null,
  isLoading: false,

  register: async (username, email, password) => {
    set({ isLoading: true });

    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          email,
          password,
        }),
      });

      const data = await response.json();
      if (!response.ok)
        throw new Error(data?.message || "Something went wrong");

      // once we get the data then we want to store the token
      await AsyncStorage.setItem("user", JSON.stringify(data?.user));
      await AsyncStorage.setItem("token", data?.token);

      set({ token: data?.token, user: data?.user, isLoading: false });

      return { success: true };
    } catch (error) {
      set({ isLoading: false });
      console.log("Error registering user", error);
      return { success: false, message: error?.message };
    }
  },

  checkAuth: async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const userJson = await AsyncStorage.getItem("user");
      const user = userJson ? JSON.parse(userJson) : null;

      set({ token, user });
    } catch (error) {
      console.log("Error checking auth", error);
    }
  },

  logout: async () => {
    try {
      await AsyncStorage.removeItem("token");
      await AsyncStorage.removeItem("user");
      set({ token: null, user: null });
    } catch (error) {
      console.log("Error logging out", error);
    }
  },

  login: async (email, password) => {
    set({ isLoading: true });

    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();
      if (!response.ok)
        throw new Error(data?.message || "Something went wrong");

      // once we get the data then we want to store the token
      await AsyncStorage.setItem("user", JSON.stringify(data?.user));
      await AsyncStorage.setItem("token", data?.token);

      set({ token: data?.token, user: data?.user, isLoading: false });

      return { success: true };
    } catch (error) {
      set({ isLoading: false });
      console.log("Error logging in", error);
      return { success: false, message: error?.message };
    }
  },
}));
