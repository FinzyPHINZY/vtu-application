# Account Management API Documentation

## Overview

This documentation provides details on the Account Management API, which includes endpoints for creating sub-accounts and retrieving account details.

## Base URL

`/api/account`

## Endpoints

### 1. **Create Sub-Account**

- **Endpoint:** `/subaccount`
- **Method:** `POST`
- **Description:** Creates a new sub-account for an authenticated user.
- **Headers:**
  - `Authorization: Bearer {token}`
  - `ClientID: {SAFE_HAVEN_CLIENT_IBS_ID}`
- **Request Body:**
  ```json
  {
    "phoneNumber": "+12345678901",
    "emailAddress": "user@example.com",
    "externalReference": "unique_reference",
    "identityType": "BVN",
    "identityNumber": "12345678901",
    "identityId": "identity_document_id",
    "otp": "123456",
    "autoSweep": false,
    "autoSweepDetails": {
      "schedule": "Instant"
    }
  }
  ```
- **Response:**
  - **201 Created:**
    ```json
    {
      "success": true,
      "message": "Sub-account created successfully",
      "data": {
        "accountNumber": "1234567890",
        "bankName": "Safe Haven Bank",
        "accountName": "John Doe",
        "accountType": "Savings",
        "currency": "NGN",
        "status": "Active",
        "createdAt": "2025-01-22T05:24:43.511Z"
      }
    }
    ```
  - **400 Bad Request:**
    ```json
    {
      "success": false,
      "message": "Validation error: Invalid phone number format. Must include country code"
    }
    ```
  - **401 Unauthorized:**
    ```json
    {
      "success": false,
      "message": "Authentication required"
    }
    ```
  - **409 Conflict:**
    ```json
    {
      "success": false,
      "message": "User already has a sub-account"
    }
    ```
  - **500 Internal Server Error:**
    ```json
    {
      "success": false,
      "message": "Internal Server Error"
    }
    ```

### 2. **Get Account Details**

- **Endpoint:** `/:id`
- **Method:** `GET`
- **Description:** Retrieves details of a specific account by its ID.
- **Headers:**
  - `Authorization: Bearer {token}`
  - `ClientID: {SAFE_HAVEN_CLIENT_IBS_ID}`
- **Parameters:**
  - `id` (string): The unique identifier of the account.
- **Response:**
  - **200 OK:**
    ```json
    {
      "success": true,
      "message": "Account details retrieved successfully",
      "data": {
        "accountNumber": "1234567890",
        "bankName": "Safe Haven Bank",
        "accountName": "John Doe",
        "accountType": "Savings",
        "currency": "NGN",
        "status": "Active",
        "createdAt": "2025-01-22T05:24:43.511Z"
      }
    }
    ```
  - **400 Bad Request:**
    ```json
    {
      "success": false,
      "message": "Validation error: Invalid account ID format"
    }
    ```
  - **401 Unauthorized:**
    ```json
    {
      "success": false,
      "message": "Authentication required"
    }
    ```
  - **404 Not Found:**
    ```json
    {
      "success": false,
      "message": "Account not found"
    }
    ```
  - **500 Internal Server Error:**
    ```json
    {
      "success": false,
      "message": "Internal Server Error"
    }
    ```

## Middleware

### 1. **Authentication (`auth`)**

Ensures that the request is authenticated by verifying the provided token.

### 2. **Header Validation (`validateHeaders`)**

Validates the presence and correctness of required headers, including `Authorization` and `ClientID`.

### 3. **Request Validation (`validateRequest`)**

Validates the request body and parameters against predefined schemas to ensure data integrity.

## Validation Schemas

### 1. **Sub-Account Creation (`subAccountValidation`)**

- `phoneNumber`: Must be a valid E.164 format (e.g., `+12345678901`).
- `emailAddress`: Must be a valid email address.
- `externalReference`: Must be a non-empty string.
- `identityType`: Must be `'BVN'`.
- `identityNumber`: Must be an 11-digit number.
- `identityId`: Must be a non-empty string.
- `otp`: Must be a non-empty string.
- `autoSweep`: Must be a boolean (default: `false`).
- `autoSweepDetails`: Must be an object (default: `{ schedule: 'Instant' }`).

### 2. **Account ID Validation (`accountIdValidation`)**

- `id`: Must be a non-empty string containing only alphanumeric characters and hyphens.
