import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const apiService = createApi({
  reducerPath: 'apiService',
  baseQuery: fetchBaseQuery({ baseUrl: 'https://bolddata-bills-payment-1.onrender.com/api' }),
  endpoints: (builder) => ({
    requestOtp: builder.mutation({
      query: (email) => ({
        url: 'auth/request-otp',
        method: 'POST',
        body: { email },
      }),
    }),
    verifyOtp: builder.mutation({
      query: ({ email, otp }) => ({
        url: 'auth/verify-otp',
        method: 'POST',
        body: { email, otp },
      }),
    }),
    completeSignup: builder.mutation({
      query: ({ firstName, lastName, email, phoneNumber, password }) => ({
        url: 'auth/complete-signup',
        method: 'POST',
        body: { firstName, lastName, email, phoneNumber, password },
      }),
    }),
    login: builder.mutation({
      query: ({ email, password }) => ({
        url: 'auth/login',
        method: 'POST',
        body: { email, password },
      }),
    }),
    initiateVerification: builder.mutation({
      query: ({ type, async, number, debitAccountNumber, token }) => ({
        url: 'verification/initiate',
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: { type, async, number, debitAccountNumber },
      }),
    }),
    validateVerification: builder.mutation({
      query: ({ type, otp, identityId, token }) => ({
        url: 'verification/validate',
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: { type, otp, identityId },
      }),
    }),
    googleLogin: builder.mutation({
      query: ({ idToken }) => ({
        url: 'auth/google',
        method: 'POST',
        body: { idToken },
      }),
    }),
    getAccountDetails: builder.query({
      query: (data) => ({
        url: `account/${data.id}`,
        method: 'GET',
        headers: {
          Authorization: `Bearer ${data.token}`,
        },
      }),
    }),
    getAllAccounts: builder.query({
      query: ({token}) => ({
        url: 'account',
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
    }),
    fetchServices: builder.query({
      query: ({token}) => ({
        url: 'services',
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
    }),
    fetchServiceById: builder.query({
      query: ({id, token}) => ({
        url: `services/${id}/service`,
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
    }),
    fetchServiceCategories: builder.query({
      query: ({id, token}) => ({
        url: `services/${id}/service-categories`,
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
    }),
    verifyPowerTVData: builder.mutation({
      query: ({ serviceCategoryId, entityNumber, token }) => ({
        url: 'services/verify',
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: { serviceCategoryId, entityNumber },
      }),
    }),
    purchaseAirtime: builder.mutation({
      query: ({ serviceCategoryId, amount, token, channel, debitAccountNumber, phoneNumber, statusUrl }) => ({
        url: 'services/pay/airtime',
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: { serviceCategoryId, amount, channel, debitAccountNumber, phoneNumber, statusUrl },
      }),
    }),
    purchaseData: builder.mutation({
      query: ({ serviceCategoryId, bundleCode, token, amount, channel, debitAccountNumber, phoneNumber, statusUrl }) => ({
        url: 'services/pay/data',
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: { serviceCategoryId, bundleCode, amount, channel, debitAccountNumber, phoneNumber, statusUrl },
      }),
    }),
    purchaseCableTV: builder.mutation({
      query: ({ serviceCategoryId, bundleCode, token, amount, channel, debitAccountNumber, cardNumber }) => ({
        url: 'services/pay/cable-tv',
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: { serviceCategoryId, bundleCode, amount, channel, debitAccountNumber, cardNumber },
      }),
    }),
    payUtilityBill: builder.mutation({
      query: ({ serviceCategoryId, meterNumber, token, amount, channel, debitAccountNumber, vendType }) => ({
        url: 'services/pay/utility',
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: { serviceCategoryId, meterNumber, amount, channel, debitAccountNumber, vendType },
      }),
    }),
    getAllTransactions: builder.query({
      query: ({token}) => ({
        url: 'services/transactions',
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
    }),
    createSubAccount: builder.mutation({
      query: ({ firstName, lastName, phoneNumber, token, emailAddress, externalReference, bvn, identityId, identityNumber, identityType, otp, callbackUrl, autoSweep, autoSweepDetails }) => ({
        url: 'account/subaccount',
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: { firstName, lastName, phoneNumber, emailAddress, externalReference, bvn, identityId, identityNumber, identityType, otp, callbackUrl, autoSweep, autoSweepDetails },
      }),
    }),
    purchaseAirtime2: builder.mutation({
      query: ({ serviceCategoryId, amount, token, phoneNumber, debitAccountNumber, transactionPin }) => ({
        url: 'transactions/airtime',
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: { serviceCategoryId, amount, phoneNumber, debitAccountNumber, transactionPin },
      }),
    }),
    purchaseData2: builder.mutation({
      query: ({ serviceCategoryId, bundleCode, token, amount, phoneNumber, debitAccountNumber, transactionPin }) => ({
        url: 'transactions/data',
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: { serviceCategoryId, bundleCode, amount, phoneNumber, debitAccountNumber, transactionPin },
      }),
    }),
    purchaseCableTV2: builder.mutation({
      query: ({ serviceCategoryId, bundleCode, token, amount, cardNumber, debitAccountNumber, transactionPin }) => ({
        url: 'transactions/cable-tv',
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: { serviceCategoryId, bundleCode, amount, cardNumber, debitAccountNumber, transactionPin },
      }),
    }),
    purchaseUtilityBill2: builder.mutation({
      query: ({ serviceCategoryId, meterNumber, token, amount, vendType, debitAccountNumber, transactionPin }) => ({
        url: 'transactions/utility',
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: { serviceCategoryId, meterNumber, amount, vendType, debitAccountNumber, transactionPin },
      }),
    }),
    getBankList: builder.query({
      query: ({token}) => ({
        url: 'transfers/banks',
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
    }),
    verifyBankAccount: builder.mutation({
      query: ({ bankCode, accountNumber, token }) => ({
        url: 'transfers/verify',
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: { bankCode, accountNumber },
      }),
    }),
    getTransferStatus: builder.mutation({
      query: ({ sessionId, token }) => ({
        url: 'transfers/status',
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: { sessionId },
      }),
    }),
    transferFunds: builder.mutation({
      query: ({ nameEnquiryReference, token, debitAccountNumber, beneficiaryBankCode, beneficiaryAccountNumber, amount, saveBeneficiary, narration }) => ({
        url: 'transactions/transfer',
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: { nameEnquiryReference, debitAccountNumber, beneficiaryBankCode, beneficiaryAccountNumber, amount, saveBeneficiary, narration },
      }),
    }),
    requestPasswordReset: builder.mutation({
      query: ({ email, token }) => ({
        url: 'user/request-password-reset',
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: { email },
      }),
    }),
    resetPassword: builder.mutation({
      query: ({ email, password, token }) => ({
        url: 'user/reset-password',
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: { email, password },
      }),
    }),
    setTransactionPin: builder.mutation({
      query: ({ transactionPin, token }) => ({
        url: 'user/set-transaction-pin',
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: { transactionPin },
      }),
    }),
    // Add other endpoints here as needed
  }),
});

export const { useRequestOtpMutation,
  useVerifyOtpMutation,
  useCompleteSignupMutation,
  useLoginMutation,
  useInitiateVerificationMutation,
  useValidateVerificationMutation,
  useGoogleLoginMutation,
  useGetAccountDetailsQuery,
  useGetAllAccountsQuery,
  useFetchServicesQuery,
  useFetchServiceByIdQuery,
  useFetchServiceCategoriesQuery,
  useVerifyPowerTVDataMutation,
  usePurchaseAirtimeMutation,
  usePurchaseDataMutation,
  usePurchaseCableTVMutation,
  usePayUtilityBillMutation,
  useGetAllTransactionsQuery,
  useCreateSubAccountMutation,
  usePurchaseAirtime2Mutation,
  usePurchaseData2Mutation,
  usePurchaseCableTV2Mutation,
  usePurchaseUtilityBill2Mutation,
  useGetBankListQuery,
  useVerifyBankAccountMutation,
  useGetTransferStatusMutation,
  useTransferFundsMutation,
  useRequestPasswordResetMutation,
  useResetPasswordMutation,
  useSetTransactionPinMutation,
 } = apiService;

