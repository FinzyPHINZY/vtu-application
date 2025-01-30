# Account Management API Documentation

## Overview

This documentation provides details on the Account Management API, which includes endpoints for creating sub-accounts and retrieving account details.

### Base URL

```
/api/account
```

---

### Middleware

All routes under `/api/account` use the following middleware:

1. `tokenExtractor`: Extracts the user’s token from the request.
2. `userExtractor`: Extracts the authenticated user's details.
3. `validateHeaders`: Validates the headers for required fields.
4. `validateRequest`: Validates the request body, query, or params based on the specified rules.

---

### Endpoints

#### 1. Create Sub-Account

**URL:** `/subaccount`

**Method:** `POST`

**Description:** Creates a sub-account for the authenticated user.

**Request Headers:**

- `Authorization`: Bearer token
- `Content-Type`: application/json

**Request Body:**

```json
{
  "phoneNumber": "+2348167817217",
  "emailAddress": "finzyphinzy@gmail.com",
  "identityId": "679aeb1df8c48148ecb48ce3",
  "identityNumber": "22474927531",
  "identityType": "BVN",
  "otp": "234532"
}
```

**Validation Rules:**

- `phoneNumber`: Must be a valid phone number including the country code.
- `emailAddress`: Must be a valid email address.
- `identityType`: Must be `BVN`. `NIN` isn't functioning at the moment.
- `identityNumber`: Must be 11 digits.
- `identityId`: Required string field.
- `otp`: Required string field.

**Response:**

- **201 Created**

```json
{
  "success": true,
  "message": "Sub-account created successfully",
  "data": {
    "accountNumber": "1234567890",
    "bankName": "Safe Haven Bank",
    "accountName": "John Doe",
    "accountType": "Savings",
    "status": "Active",
    "createdAt": "2025-01-23T12:00:00Z"
  }
}
```

- **404 Not Found** (If user is not found)
- **409 Conflict** (If user already has a sub-account)
- **500 Internal Server Error**

---

#### 2. Get Account Details

**URL:** `/:id`

**Method:** `GET`

**Description:** Retrieves the details of a specific account using its ID.

**Request Headers:**

- `Authorization`: Bearer token

**URL Parameters:**

- `id`: The account ID (string, required).

**Validation Rules:**

- `id`: Must be a valid alphanumeric string with optional hyphens.

**Response:**

- **200 OK**

```json
{
  "success": true,
  "message": "Account details retrieved successfully",
  "data": {
    "accountNumber": "1234567890",
    "bankName": "Safe Haven Bank",
    "accountName": "John Doe",
    "accountType": "Savings",
    "status": "Active",
    "balance": 10000.0
  }
}
```

- **500 Internal Server Error**

---

#### 3. Get All Accounts

**URL:** `/`

**Method:** `GET`

**Description:** Retrieves all accounts for the authenticated user, with optional query parameters for pagination and filtering.

**Request Headers:**

- `Authorization`: Bearer token

**Query Parameters:**

- `page` (optional): The page number (non-negative integer, default: 0).
- `limit` (optional): Number of records per page (1-100, default: 100).
- `isSubAccount` (optional): Filter by sub-accounts (boolean, default: false).

**Validation Rules:**

- `page`: Optional non-negative integer.
- `limit`: Optional integer between 1 and 100.
- `isSubAccount`: Optional boolean.

**Response:**

- **200 OK**

```json
{
  "success": true,
  "message": "Accounts retrieved successfully",
  "data": [
    {
      "accountNumber": "1234567890",
      "bankName": "Safe Haven Bank",
      "accountName": "John Doe",
      "accountType": "Savings",
      "status": "Active",
      "balance": 10000.0
    },
    {
      "accountNumber": "9876543210",
      "bankName": "Safe Haven Bank",
      "accountName": "Jane Doe",
      "accountType": "Current",
      "status": "Inactive",
      "balance": 0.0
    }
  ],
  "pagination": {
    "currentPage": 0,
    "pageSize": 100,
    "totalCount": 2,
    "totalPages": 1
  }
}
```

- **500 Internal Server Error**

---

### Notes

- Ensure all requests include valid tokens and required headers.
- Pagination and filtering are optional for `GET /`.
- All dates in responses are in ISO 8601 format.
