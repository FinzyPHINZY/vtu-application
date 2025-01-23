# Verification Endpoints Documentation

## Overview

This document describes the verification endpoints used to integrate Safe Haven Identity and Credit Check services. These endpoints ensure that customer consent is explicitly validated for identity verification using BVN.

---

## Base URL

`/api/verification`

---

## Endpoints

### 1. **Initiate Verification**

- **Endpoint:** `/initiate`
- **Method:** `POST`
- **Middleware:**
  - `validateHeaders`
  - `verificationValidation`
  - `validateRequest`
- **Description:** Initiates the verification process for a customer.
- **Request Headers:**
  - `Authorization`: Bearer token
- **Request Body:**
  ```json
  {
    "type": "BVN",
    "async": false,
    "number": "{bvn number}",
    "debitAccountNumber": "{safe haven account number}" // 0119017579
  }
  ```
- **Response:**
  - **200:**
    ```json
    {
      "success": true,
      "message": "Verification initiated successfully",
      "data": {
        "_id": "verificationId",
        "clientId": "clientId",
        "type": "BVN",
        "amount": 50.0,
        "status": "Pending",
        "debitAccountNumber": "{safe haven account number}",
        "providerResponse": "Provider-specific details"
      }
    }
    ```
  - **400:**
    ```json
    {
      "success": false,
      "message": "Missing or invalid request parameters"
    }
    ```
  - **500:**
    ```json
    {
      "success": false,
      "message": "Internal server error"
    }
    ```

---

### 2. **Validate Verification**

- **Endpoint:** `/validate`
- **Method:** `POST`
- **Middleware:**
  - `validateHeaders`
  - `validationValidation`
  - `validateRequest`
- **Description:** Validates a previously initiated verification request.
- **Request Headers:**

  - `Authorization`: Bearer token

- **Request Body:**
  ```json
  {
    "identityId": "verificationId", // _id received from the /initiate endpoint response
    "type": "BVN",
    "otp": "123456" // use any random 6 digit string.
  }
  ```
- **Response:**
  - **200:**
    ```json
    {
      "statusCode": 200,
      "data": {
        "_id": "verificationId",
        "clientId": "clientId",
        "type": "BVN",
        "amount": 50.0,
        "status": "Verified",
        "debitAccountNumber": "1234567890", // 0119017579
        "providerResponse": "Provider-specific details",
        "transaction": "transactionDetails",
        "createdAt": "2025-01-08T12:00:00.000Z",
        "updatedAt": "2025-01-08T12:05:00.000Z"
      },
      "message": "Verification validated successfully"
    }
    ```
  - **400:**
    ```json
    {
      "success": false,
      "message": "Missing or invalid OTP"
    }
    ```
  - **500:**
    ```json
    {
      "success": false,
      "message": "Internal server error"
    }
    ```

---

## Middleware Used

### 1. `validateHeaders`

- Ensures that:
  - The `Authorization` header contains a valid Bearer token.
  - The `Content-Type` header is `application/json`.

### 2. `validateRequest`

- Validates request body parameters against predefined rules.

---

## Request Validations

### 1. `verificationValidation`

- **Rules:**
  - `type`: Must be `BVN`.
  - `async`: Must be a boolean value.
  - `number`: Must be an 11-digit BVN.
  - `debitAccountNumber`: Must not be empty.

### 2. `validationValidation`

- **Rules:**
  - `identityId`: Must be a non-empty string.
  - `type`: Must be `BVN`.
  - `otp`: Must be a non-empty string.

---

## Error Handling

- Logs errors to the console for debugging.
- Returns meaningful error messages to clients with appropriate HTTP status codes.

---
