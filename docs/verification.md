# Verification Endpoints Documentation

## Overview

This document describes the verification endpoints used to integrate Safe Haven Identity and Credit Check services. These endpoints ensure that customer consent is explicitly validated for identity verification using BVN.

---

### **Base URL**

`/api/verification`

---

### **Initiate Verification**

**Endpoint:**  
`POST /api/verification/initiate`

**Description:**  
Initiates a BVN verification process by sending the BVN and debit account number for validation.

**Headers:**

- `Authorization` (required): Bearer token generated upon login.
- `Content-Type`: `application/json`

**Request Body:**

```json
{
  "type": "BVN",
  "async": false,
  "number": "12345678901", // bvn number
  "debitAccountNumber": "0119017579"
}
```

**Validation Rules:**

- `type`: Must be "BVN".
- `async`: Boolean, specifies whether the request is asynchronous.
- `number`: Must be a string containing exactly 11 digits.
- `debitAccountNumber`: Required string, cannot be empty.

**Response:**

- **Success (200):**
  ```json
  {
    "success": true,
    "message": "Verification initiated successfully",
    "data": {
      "_id": "unique-verification-id",
      "clientId": "client-id",
      "type": "BVN",
      "amount": "amount-deducted",
      "status": "pending",
      "debitAccountNumber": "1234567890",
      "providerResponse": "provider-specific-message"
    }
  }
  ```
- **Error (500):**
  ```json
  {
    "success": false,
    "message": "Internal server error"
  }
  ```

---

### **Validate Verification**

**Endpoint:**  
`POST /api/verification/validate`

**Description:**  
Validates an ongoing BVN verification process using the OTP provided by the user.

**Headers:**

- `Authorization` (required): Bearer token generated upon login.
- `Content-Type`: `application/json`

**Request Body:**

```json
{
  "identityId": "verification-id",
  "type": "BVN",
  "otp": "123456"
}
```

**Validation Rules:**

- `identityId`: Must be a string, required.
- `type`: Must be "BVN".
- `otp`: Required string, cannot be empty.

**Response:**

- **Success (200):**
  ```json
  {
    "statusCode": 200,
    "data": {
      "_id": "verification-id",
      "clientId": "client-id",
      "type": "BVN",
      "amount": "amount-deducted",
      "status": "validated",
      "debitAccountNumber": "1234567890",
      "providerResponse": "provider-specific-response",
      "transaction": {
        "transactionId": "transaction-id",
        "status": "success"
      },
      "createdAt": "timestamp",
      "updatedAt": "timestamp"
    },
    "message": "Verification validated successfully"
  }
  ```
- **Error (500):**
  ```json
  {
    "success": false,
    "message": "Internal server error"
  }
  ```

---

### **Middleware Overview**

1. **`tokenExtractor`:** Extracts the bearer token from the `Authorization` header.
2. **`userExtractor`:** Verifies the token and retrieves the associated user.
3. **`validateHeaders`:** Ensures the presence of a valid `Authorization` header.
4. **`validateRequest`:** Validates the request body based on predefined rules (`verificationValidation` or `validationValidation`).

---
