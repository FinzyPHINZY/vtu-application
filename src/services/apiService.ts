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
    // Add other endpoints here as needed
  }),
});

export const { useRequestOtpMutation } = apiService;
