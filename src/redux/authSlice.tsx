import {createSlice, PayloadAction} from "@reduxjs/toolkit";

interface AuthState {
    username: string;
    planet: string;
}

const initialState: AuthState = {
    username: "",
    planet: "",
}

const authSlice = createSlice({
    name: "authSlice",
    initialState,
    reducers: {
        login: (state, action: PayloadAction<{ username: string; planet: string }>) => {
            state.username = action.payload.username;
            state.planet = action.payload.planet;
        },
        logout: (state) => {
            state.username = "";
            state.planet = "";
        }
    }
})

export const { login, logout } = authSlice.actions;

export default authSlice.reducer;