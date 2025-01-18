// src/store/slices/userSlice.ts

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface User {
  id: string;
}

interface UserState {
  idToken: string;
  user: User;
  otp: string;
  email: string
}

const initialState: UserState = {
  idToken: '',
  user: {
    id: '',
  },
  otp: '', 
  email: '',
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUserInfo: (state, action: PayloadAction<Partial<UserState>>) => {
      return { ...state, ...action.payload, status: 'success' };
    },
    setOtp: (state, action: PayloadAction<string>) => { 
      state.otp = action.payload;
    },
    setEmail: (state, action: PayloadAction<string>) => { 
      state.email = action.payload;
    },
    clearUserInfo: () => initialState,
  },
});

export const { setUserInfo, setOtp, clearUserInfo, setEmail } = userSlice.actions; // Export setOtp
export default userSlice.reducer;
