import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AccountDetails {
  bankName: string;
  accountName: string;
  accountType: string;
  accountBalance: string;
  status: string;
  _id: string;
}

interface User {
  _id: string;
  email: string;
  role: string;
  accountBalance: number;
  transactions: Record<string, string | number | boolean>[];
  hasSetTransactionPin: boolean;
  isVerified: boolean;
  status: string;
  isGoogleUser: boolean;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  accountDetails: AccountDetails;
}

interface UserState {
  idToken: string;
  user: User;
  otp: string;
  email: string;
  pin: string
}


const initialState: UserState = {
  idToken: '',
  user: {
    _id: '',
    email: '',
    role: '',
    accountBalance: 0,
    transactions: [],
    hasSetTransactionPin: false,
    isVerified: false,
    status: '',
    isGoogleUser: false,
    firstName: '',
    lastName: '',
    phoneNumber: '',
    accountDetails: {
      bankName: '',
      accountName: '',
      accountType: '',
      accountBalance: '',
      status: '',
      _id: '',
    },
  },
  otp: '',
  email: '',
  pin: '',
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUserInfo: (state, action: PayloadAction<User>) => {
      // return { ...state, ...action.payload, status: 'success' };
      state.user = { ...state.user, ...action.payload };
    },
    setOtp: (state, action: PayloadAction<string>) => {
      state.otp = action.payload;
    },
    setEmail: (state, action: PayloadAction<string>) => {
      state.email = action.payload;
    },
    setPin: (state, action: PayloadAction<string>) => {
      state.pin = action.payload;
    },
    setStatus: (state, action: PayloadAction<string>) => {
      state.user.accountDetails.status = action.payload;
    },
    clearUserInfo: () => initialState,
  },
});

export const { setUserInfo, setOtp, clearUserInfo, setEmail, setStatus, setPin } = userSlice.actions;
export default userSlice.reducer;
