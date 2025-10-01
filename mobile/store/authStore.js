import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const useAuthStore = create((set) => ({
  user: null,
  token: null,
  isLoading: false,

  register: async (username, email, password) => {
    set({ isLoading: true });

    try {
      const response = await fetch(
        "https://book-store-react-native-app-10kh.onrender.com/api/auth/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username,
            email,
            password,
          }),
        }
      );

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
}));
