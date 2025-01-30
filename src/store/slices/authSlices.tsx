// src/store/slices/authSlice.ts

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
  expires_in: string;
}

const initialState: AuthState = {
  isAuthenticated: false,
  token: null,
  expires_in: "",
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginUser: (state, action: PayloadAction<string>) => {
      state.isAuthenticated = true;
      state.token = action.payload;
    },
    logoutUser: (state) => {
      state.isAuthenticated = false;
      state.token = null;
    },
  },
});

export const { loginUser, logoutUser } = authSlice.actions;
export default authSlice.reducer;
