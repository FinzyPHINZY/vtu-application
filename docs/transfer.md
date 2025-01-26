# API Documentation: Transfer Endpoints

## Overview

The transfer module provides functionalities for managing bank-related operations such as fetching bank lists, verifying bank accounts, checking transfer statuses, and executing fund transfers. Below are detailed descriptions of the available endpoints.

---

## Endpoints

### 1. **Get Bank List**

#### **Endpoint:**

```
GET /api/transfers/banks
```

#### **Description:**

Fetches a list of supported banks.

#### **Headers:**

- **Authorization**: `Bearer <token>`
- **Content-Type**: `application/json`

#### **Responses:**

- **200 OK**:
  ```json
  {
    "success": true,
    "message": "Banks fetched successfully",
    "data": [
      {
        "bankCode": "123",
        "bankName": "Bank Name"
      }
    ]
  }
  ```
- **500 Internal Server Error**:
  ```json
  {
    "success": false,
    "message": "Internal Server Error"
  }
  ```

---

### 2. **Verify Bank Account**

#### **Endpoint:**

```
POST /api/transfers/verify
```

#### **Description:**

Verifies a bank account by checking its validity and retrieving account details.

#### **Headers:**

- **Authorization**: `Bearer <token>`
- **Content-Type**: `application/json`

#### **Body Parameters:**

- **bankCode** (string): Code of the bank.
- **accountNumber** (string): The bank account number to verify.

#### **Responses:**

- **200 OK**:
  ```json
  {
    "success": true,
    "message": "Account verified successfully",
    "data": {
      "accountName": "John Doe",
      "accountNumber": "1234567890"
    }
  }
  ```
- **400 Bad Request**:
  ```json
  {
    "success": false,
    "message": "Invalid bank code or account number"
  }
  ```
- **500 Internal Server Error**:
  ```json
  {
    "success": false,
    "message": "Internal Server Error"
  }
  ```

---

### 3. **Get Transfer Status**

#### **Endpoint:**

```
POST /api/transfers/status
```

#### **Description:**

Retrieves the status of a specific transfer.

#### **Headers:**

- **Authorization**: `Bearer <token>`
- **Content-Type**: `application/json`

#### **Body Parameters:**

- **sessionId** (string): Unique identifier for the transfer session.

#### **Responses:**

- **200 OK**:
  ```json
  {
    "success": true,
    "message": "Transfer status fetched successfully",
    "data": {
      "status": "success",
      "timestamp": "2025-01-24T10:00:00Z"
    }
  }
  ```
- **400 Bad Request**:
  ```json
  {
    "success": false,
    "message": "Invalid session ID"
  }
  ```
- **500 Internal Server Error**:
  ```json
  {
    "success": false,
    "message": "Failed to check transfer status"
  }
  ```

---

### 4. **Transfer Funds**

#### **Endpoint:**

```
POST /api/transactions/transfer
```

#### **Description:**

Executes a funds transfer from the user’s account to a specified beneficiary account.

#### **Headers:**

- **Authorization**: `Bearer <token>`
- **Content-Type**: `application/json`

#### **Body Parameters:**

- **nameEnquiryReference** (string): Reference from a prior account verification.
- **debitAccountNumber** (string): Account number to debit.
- **beneficiaryBankCode** (string): Bank code of the beneficiary.
- **beneficiaryAccountNumber** (string): Beneficiary’s account number.
- **amount** (number): Amount to transfer.
- **saveBeneficiary** (boolean): Whether to save the beneficiary for future use.
- **narration** (string): Description of the transfer.

#### **Responses:**

- **200 OK**:
  ```json
  {
    "success": true,
    "message": "Fund transfer successful",
    "data": {
      "reference": "TR20250124120000",
      "amount": 5000,
      "beneficiaryAccountNumber": "1234567890",
      "status": "success",
      "timestamp": "2025-01-24T12:00:00Z"
    }
  }
  ```
- **400 Bad Request**:
  ```json
  {
    "success": false,
    "message": "Invalid account number"
  }
  ```
- **429 Too Many Requests**:
  ```json
  {
    "success": false,
    "message": "PIN locked for 30 minutes due to too many failed attempts"
  }
  ```
- **500 Internal Server Error**:
  ```json
  {
    "success": false,
    "message": "Internal Server Error"
  }
  ```

---

## Middleware

### 1. **Token Extractor**

Extracts the bearer token from the Authorization header.

### 2. **User Extractor**

Validates the token and retrieves the user from the database.

### 3. **Validate Request**

Checks for errors in the request body.

### 4. **Validate Headers**

Ensures that the Authorization header is present and properly formatted.

### 5. **Transaction PIN Validation**

Validates the user’s transaction PIN and enforces security measures like locking after multiple failed attempts.

---

## Notes

- All endpoints require a valid JWT token in the Authorization header.
- Transaction PIN security is enforced to prevent unauthorized transfers.
- Ensure proper environment variable configurations for Safe Haven API access.
