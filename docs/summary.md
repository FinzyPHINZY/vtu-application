# Bold Data

- Welcome Page
  - Google Sign up `/api/auth/google`
  - Email Sign up
    - Request OTP `/api/auth/request-otp`
    - Verify OTP `/api/auth/verify-otp`
    - Complete Registration `/api/auth/complete-signup`
  - Login
    - Login `/api/auth/login`
    - Forgot Password
      - Request Password Reset `/api/auth/request-password-reset`
      - Reset Password `/api/auth/reset-password`
- Home Page

  - User
    - Account Balance `/api/auth/login`
    - Previous Transactions `/api/auth/login`
    - Notifications
      - Transaction Pin `api/user/set-transaction-pin`
      - Identity and Credit Check [`api/verification/initiate`, `api/verification/validate`, `api/account/subaccount`]
  - Services
    - List of Services - TV, Data, Airtime, Utility `api/services/`
  - Buy Data

    - Available Plans
    - Takes in the available plans and number

    ```
    - Get Data Providers: `api/services/{data-id}/service-categories
    - Buy Data: `api/transactions/data
    ```

  - Buy Airtime
    - Takes in the amount to purchase
    - Takes in the phone number
    - Endpoints:
    ```
    - Get Airtime Providers: `api/services/{airtime-id}/service-categories`
    - Buy airtime: `api/transactions/airtime`
    ```
  - Buy Electricity

    - Takes in the plan, amount and meter number
    - Provides the available Providers

    ```
    - Get Electricity Providers: `api/services/{utility id}/service-categories`
    - Verify Electricity Card Number if its valid: `api/services/verify`
    - Buy electricity: `api/transactions/utility
    ```

  - Buy Cable (dstv)
    - Available Packages and Providers
    - Takes in the smartcard number.
    ```
    - Get Cable Tv Providers: `api/services/{tv id}/services-categories
    - Verify Cable Number if its valid: `api/services/verify`
    - Buy Cable: `api/transactions/cable-tv
    ```

- Profile
  - User Data - [Name, Email, Transactions, Transaction PIN]
  ```
  Get user information: `api/auth/login`
  Transaction pin: `api/user/set-transaction-pin`
  Reset Password: [
    `api/user/request-password-reset`,
    `api/user/reset-password`
  ]
  ```
- Deposit
  - Provide user account details (safe haven)
  - Implement endpoint to check the status of the transaction
  ```
  - Get User Account details: [`api/auth/login`, `api/account/:id`]. Both would work. The user account data would contain the account information. You could also make a request with the accountDetails.accountId in the user data from login to the latter endpoint.
  ```
- Transfer
  - Takes in amount, account number and bank name
  - Implement endpoint to check the status of the transaction
  ```
  hello
  ```
