# Verification Endpoints Documentation

This documentation outlines the endpoints for user identity verification, which are utilized in various parts of the application, such as:

- The notifications section on the home page to alert users about pending identity checks.
- Identity verification screens for users to complete the verification process.

### Base URL:

`/api/verification`

## Endpoints

### 1. Initiate Verification

**URL:** `/initiate`

**Method:** `POST`

**Headers:**

- `Token`: Bearer token (Required) // token from login

**Request Body:**
| Field | Type | Required | Description |
|---------------------|---------|----------|------------------------------------------|
| type | string | Yes | Must be `BVN`. |
| async | boolean | Yes | Indicates whether the process is async. |
| number | string | Yes | BVN (must be 11 digits). |
| debitAccountNumber | string | Yes | Account number to debit for verification.|

**Response:**

- **200 OK:** Verification initiated successfully.

  ```json
  {
    "success": true,
    "message": "Verification initiated successfully",
    "data": {
      "_id": "string",
      "clientId": "string",
      "type": "string",
      "amount": "number",
      "status": "string",
      "debitAccountNumber": "string",
      "providerResponse": "object"
    }
  }
  ```

- **500 Internal Server Error:** An error occurred while initiating verification.

### 2. Validate Verification

**URL:** `/validate`

**Method:** `POST`

**Headers:**

- `Token`: Bearer token (Required) // token from login

**Request Body:**
| Field | Type | Required | Description |
|------------|--------|----------|----------------------------------|
| identityId | string | Yes | ID of the initiated verification.|
| type | string | Yes | Must be `BVN`. |
| otp | string | Yes | OTP sent to the user. |

**Response:**

- **200 OK:** Verification validated successfully.

  ```json
  {
    "statusCode": 200,
    "data": {
      "_id": "string",
      "clientId": "string",
      "type": "string",
      "amount": "number",
      "status": "string",
      "debitAccountNumber": "string",
      "providerResponse": "object",
      "transaction": "object",
      "createdAt": "string",
      "updatedAt": "string"
    },
    "message": "string"
  }
  ```

- **500 Internal Server Error:** An error occurred while validating verification.

# Account Creation Endpoint

This endpoint automatically creates a virtual account for users. For seamless integration, the validation endpoint can handle account creation and return account details to the frontend.

### Base URL:

`/api/account`

## Endpoint

### 1. Create Sub-Account

**URL:** `/subaccount`

**Method:** `POST`

**Headers:**

- `Token`: Bearer token (Required) // token from login

**Request Body:**
| Field | Type | Required | Description |
|-------------------|---------|----------|-------------------------------------------------|
| phoneNumber | string | Yes | Must include country code (e.g., +1234567890). |
| emailAddress | string | Yes | Valid email address. |
| externalReference | string | Yes | External reference for the account. |
| identityType | string | No | Default is `BVN`. |
| identityNumber | string | Yes | BVN (must be 11 digits). |
| identityId | string | Yes | Identity verification ID. |
| otp | string | Yes | OTP for verification. |
| autoSweep | boolean | No | Default is `false`. |
| autoSweepDetails | object | No | Default is `{ schedule: 'Instant' }`. |

**Response:**

- **201 Created:** Sub-account created successfully.

  ```json
  {
    "success": true,
    "message": "Sub-account created successfully",
    "data": {
      "accountNumber": "string",
      "bankName": "string",
      "accountName": "string",
      "accountType": "string",
      "status": "string",
      "createdAt": "string"
    }
  }
  ```

- **409 Conflict:** User already has a sub-account.

  ```json
  {
    "success": false,
    "message": "User already has a sub-account"
  }
  ```

- **500 Internal Server Error:** An error occurred while creating a sub-account.
