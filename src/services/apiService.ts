import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const apiService = createApi({
  reducerPath: 'apiService',
  baseQuery: fetchBaseQuery({ baseUrl: 'https://bolddata-bills-payment.onrender.com/api/auth' }),
  endpoints: (builder) => ({
    requestOtp: builder.mutation({
      query: (email) => ({
        url: 'request-otp',
        method: 'POST',
        body: { email },
      }),
    }),
    verifyOtp: builder.mutation({
      query: ({ email, otp }) => ({
        url: 'verify-otp',
        method: 'POST',
        body: { email, otp },
      }),
    }),
    completeSignup: builder.mutation({
      query: ({ name, email, phoneNumber }) => ({
        url: 'complete-signup',
        method: 'POST',
        body: { name, email, phoneNumber },
      }),
    }),
    login: builder.mutation({
      query: ({ email, otp }) => ({
        url: 'login',
        method: 'POST',
        body: { email, otp },
      }),
    }),
    // Add other endpoints here as needed
  }),
});

export const { useRequestOtpMutation, useVerifyOtpMutation, useCompleteSignupMutation, useLoginMutation } = apiService;

