import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface User {
    id: string;
    name: string;
    email: string;
    role: string;
}

interface AuthState {
    user: User | null;
    token: string | null;
}

const initialState: AuthState = {
    user: null,
    token: null,
};

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        setAuth: (state, action: PayloadAction<AuthState>) => {
            state.user = action.payload.user;
            state.token = action.payload.token;
        },
        logout: (state) => {
            state.user = null;
            state.token = null;
        },
    },
});

export const { setAuth, logout } = authSlice.actions;
export default authSlice.reducer;