import { create } from "zustand";

interface AuthState {
    user: any;
    isAuthReady: boolean;
    setUser: (user: any) => void;
    setAuthReady: (ready: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    isAuthReady: false,
    setUser: (user) => set({ user }),
    setAuthReady: (ready) => set({ isAuthReady: ready }),
}));
