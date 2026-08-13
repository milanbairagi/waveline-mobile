import type { Tokens, UserResponse } from "@/types";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../constants";
import api from "../utils/api";
import { saveData } from "../utils/aStorage";

const UserContext = createContext<{
  user: UserResponse | null;
  setUser: React.Dispatch<React.SetStateAction<UserResponse | null>>;
  loading: boolean;
  fetchUser: () => Promise<void>;
  loginUser: (tokens: Tokens) => Promise<UserResponse>;
  logoutUser: () => void;
}>({
  user: null,
  setUser: () => {},
  loading: true,
  fetchUser: async () => {},
  loginUser: async () => {
    throw new Error("loginUser function not implemented");
  },
  logoutUser: () => {},
});

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    try {
      setLoading(true);
      const response = await api.get("/accounts/me/");
      setUser(response.data);
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const loginUser = async (tokens: Tokens) => {
    try {
      // Store tokens
      const accessToken = tokens.access;
      const refreshToken = tokens.refresh;
      await saveData(ACCESS_TOKEN, accessToken);
      await saveData(REFRESH_TOKEN, refreshToken);

      // Fetch and set user data
      const userResponse = await api.get("/accounts/me/");
      setUser(userResponse.data);

      return userResponse.data;
    } catch (error) {
      // console.error("Error setting user after login:", error);
      // Clear tokens if user fetch fails
      await clearStorage();
      throw error;
    }
  };

  const logoutUser = () => {
    clearStorage();
    setUser(null);
  };

  const clearStorage = async () => {
    await saveData(ACCESS_TOKEN, null);
    await saveData(REFRESH_TOKEN, null);
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <UserContext.Provider
      value={{ user, setUser, loading, fetchUser, loginUser, logoutUser }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  return useContext(UserContext);
};
