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
  hasSetTransactionPin: boolean;
  isVerified: boolean;
  status: string;
  isGoogleUser: boolean;
  firstName: string;
  lastName: string;
  accountNumber: string;
  phoneNumber: string;
  accountDetails: AccountDetails;
}

interface UserState {
  idToken: string;
  user: User;
  otp: string;
  email: string;
  pin: string;
  bvn: string;
}


const initialState: UserState = {
  idToken: '',
  user: {
    _id: '',
    email: '',
    role: '',
    accountBalance: 0,
    hasSetTransactionPin: false,
    isVerified: false,
    status: '',
    isGoogleUser: false,
    firstName: '',
    lastName: '',
    phoneNumber: '',
    accountNumber: '',
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
  bvn: '',
  
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
    setBVN: (state, action: PayloadAction<string>) => {
      state.bvn = action.payload;
    },
    setStatus: (state, action: PayloadAction<string>) => {
      state.user.accountDetails.status = action.payload;
    },
    clearUserInfo: () => initialState,
  },
});

export const { setUserInfo, setOtp, clearUserInfo, setEmail, setStatus, setPin, setBVN } = userSlice.actions;
export default userSlice.reducer;
