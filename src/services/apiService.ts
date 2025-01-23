import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const apiService = createApi({
  reducerPath: 'apiService',
  baseQuery: fetchBaseQuery({ baseUrl: 'https://bolddata-bills-payment-1.onrender.com/api/auth' }),
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
      query: ({ firstName, lastName, email, phoneNumber, password }) => ({
        url: 'complete-signup',
        method: 'POST',
        body: { firstName, lastName, email, phoneNumber, password },
      }),
    }),
    login: builder.mutation({
      query: ({ email, password }) => ({
        url: 'login',
        method: 'POST',
        body: { email, password },
      }),
    }),
    // Add other endpoints here as needed
  }),
});

export const { useRequestOtpMutation, useVerifyOtpMutation, useCompleteSignupMutation, useLoginMutation } = apiService;

