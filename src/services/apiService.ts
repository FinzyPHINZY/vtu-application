import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const apiService = createApi({
  reducerPath: 'apiService',
  baseQuery: fetchBaseQuery({ baseUrl: 'https://www.bolddatapay.com/api' }),
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
      query: ({  number,  token }) => ({
        url: 'verification/initiate',
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: {  number,  },
      }),
    }),
    validateVerification: builder.mutation({
      query: ({  otp, identityId, token }) => ({
        url: 'verification/validate',
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: {  otp, identityId },
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
      query: ({ token }) => ({
        url: 'account',
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
    }),
    fetchNetworks: builder.query({
      query: ({ token }) => ({
        url: 'transactions/networks',
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
    }),
    fetchDataPlans: builder.query({
      query: ({ token }) => ({
        url: `transactions/data-plans`,
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
    }),
    fetchCableList: builder.query({
      query: ({ token }) => ({
        url: `transactions/cable-list`,
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
    }),
    fetchPowerProviders: builder.query({
      query: ({ token }) => ({
        url: `transactions/utility-providers`,
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
    }),
    fetchCablePlans: builder.query({
      query: ({ token }) => ({
        url: `transactions/cable-plans`,
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
      query: ({ token }) => ({
        url: 'transactions',
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
    }),
    createSubAccount: builder.mutation({
      query: ({  phoneNumber, token, emailAddress, identityId, identityNumber, identityType, otp, }) => ({
        url: 'account/subaccount',
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: {  phoneNumber, emailAddress, identityId, identityNumber, identityType, otp, },
      }),
    }),
    purchaseAirtime2: builder.mutation({
      query: ({ network, mobile_number, airtime_type, Ported_number, amount, transactionPin, token }) => ({
        url: 'transactions/airtime',
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: { network, mobile_number, airtime_type, Ported_number, amount, transactionPin },
      }),
    }),
    purchaseData2: builder.mutation({
      query: ({ network, mobile_number, plan, Ported_number, amount, transactionPin, token }) => ({
        url: 'transactions/data',
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: { network, mobile_number, plan, Ported_number, amount, transactionPin },
      }),
    }),
    purchaseCableTV2: builder.mutation({
      query: ({ cablename, cableplan, smart_card_number, amount, token, transactionPin }) => ({
        url: 'transactions/cable-tv',
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: { cablename, cableplan, smart_card_number, amount, transactionPin },
      }),
    }),
    purchaseUtilityBill2: builder.mutation({
      query: ({ disco_name, meter_number, meterType, token, amount, transactionPin }) => ({
        url: 'transactions/utility',
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: { amount, disco_name, meter_number, meterType, transactionPin },
      }),
    }),
    getBankList: builder.query({
      query: ({ token }) => ({
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
      query: ({ nameEnquiryReference, token, debitAccountNumber, beneficiaryBankCode, beneficiaryAccountNumber, amount, saveBeneficiary, narration, transactionPin }) => ({
        url: 'transfers',
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: { nameEnquiryReference, debitAccountNumber, beneficiaryBankCode, beneficiaryAccountNumber, amount, saveBeneficiary, narration, transactionPin },
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
    getUserDetails: builder.query({
      query: ({ token }) => ({
        url: 'user',
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },

      }),
    }),
    createVirtualAccount: builder.mutation({
      query: ({ token, amount}) => ({
        url: 'account/virtual',
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: { amount },
      }),
    }),

  }),
});

export const { useRequestOtpMutation,
  useCreateVirtualAccountMutation,
  useGetUserDetailsQuery,
  useVerifyOtpMutation,
  useCompleteSignupMutation,
  useLoginMutation,
  useInitiateVerificationMutation,
  useValidateVerificationMutation,
  useGoogleLoginMutation,
  useGetAccountDetailsQuery,
  useGetAllAccountsQuery,
  useFetchNetworksQuery,
  useFetchDataPlansQuery,
  useFetchCableListQuery,
  useVerifyPowerTVDataMutation,
  usePurchaseAirtimeMutation,
  usePurchaseDataMutation,
  usePurchaseCableTVMutation,
  usePayUtilityBillMutation,
  useFetchPowerProvidersQuery,
  useGetAllTransactionsQuery,
  useFetchCablePlansQuery,
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

