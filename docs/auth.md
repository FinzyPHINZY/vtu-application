# User Authentication Endpoints Documentation

## Overview

This document outlines the endpoints and flow for user signup and login functionality in the application. The authentication flow involves requesting an OTP, verifying the OTP, completing the signup process, and logging in. Additional endpoints handle token generation for API communication.

---

## Base URL

`/api/auth`

---

## Endpoints

### 1. **Request OTP**

- **Endpoint:** `/request-otp`
- **Method:** `POST`
- **Rate Limiting:** Yes (via `otpRateLimiter` middleware)
- **Description:** Sends an OTP to the user's email.
- **Request Body:**
  ```json
  {
    "email": "user@example.com"
  }
  ```
- **Response:**
  - **200:**
    ```json
    {
      "success": true,
      "message": "OTP sent successfully",
      "otp": "1234" // (For testing purposes; hidden in production)
    }
    ```
  - **400:**
    ```json
    {
      "success": false,
      "message": "Invalid email address"
    }
    ```
  - **500:**
    ```json
    {
      "success": false,
      "message": "Internal Server Error - Failed to send OTP",
      "error": "Error message"
    }
    ```

---

### 2. **Verify OTP**

- **Endpoint:** `/verify-otp`
- **Method:** `POST`
- **Description:** Verifies the OTP and marks the user as verified.
- **Request Body:**
  ```json
  {
    "email": "user@example.com",
    "otp": "1234"
  }
  ```
- **Response:**
  - **200:**
    ```json
    {
      "success": true,
      "message": "OTP verified successfully",
      "email": "user@example.com"
    }
    ```
  - **400:**
    ```json
    {
      "success": false,
      "message": "Invalid OTP"
    }
    ```
  - **500:**
    ```json
    {
      "success": false,
      "message": "Internal Server Error - Failed to verify OTP",
      "error": "Error message"
    }
    ```

---

### 3. **Complete Signup**

- **Endpoint:** `/complete-signup`
- **Method:** `POST`
- **Description:** Completes the signup process by collecting user details and setting a password.
- **Request Body:**
  ```json
  {
    "firstName": "John",
    "lastName": "Doe",
    "email": "user@example.com",
    "phoneNumber": "1234567890",
    "password": "securePassword123"
  }
  ```
- **Response:**
  - **201:**
    ```json
    {
      "success": true,
      "message": "Signed up successfully",
      "data": {
        "_id": "userId",
        "firstName": "John",
        "lastName": "Doe"
        "email": "user@example.com",
        "phoneNumber": "1234567890",
        ...
      },
    }
    ```
  - **400:**
    ```json
    {
      "success": false,
      "message": "Name must be at least 2 characters long"
    }
    ```
  - **500:**
    ```json
    {
      "success": false,
      "message": "Internal Server error"
    }
    ```

---

### 4. **Login**

#### **POST /api/auth/login**

Logs in a user, verifies their credentials, and generates an access token for interacting with the Safe Haven API.

---

### Request

#### **Headers**

- `Content-Type: application/json`

#### **Body**

```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

---

### Response

#### **Success (200)**

Returns a success message, user data, and a JSON Web Token (JWT) containing the Safe Haven access token.

##### **Example Response**

```json
{
  "success": true,
  "message": "Signed in successfully",
  "data": {
    "_id": "63d9f0f0e4e7e20a7c123abc",
    "email": "user@example.com",
    "isVerified": true,
    "firstName": "John",
    "lastName": "Doe",
    "phoneNumber": "+123456789"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### **Error (400)**

Occurs if required fields are missing.

```json
{
  "success": false,
  "message": "Missing required fields"
}
```

#### **Error (401)**

Occurs if the user credentials are invalid or the user is not verified.

```json
{
  "success": false,
  "message": "Invalid Credentials"
}
```

#### **Error (500)**

Occurs if there is an internal server error during login or when generating the Safe Haven access token.

```json
{
  "success": false,
  "message": "Internal Server error"
}
```

---

### Description

1. **Input Validation**:

   - Verifies that the email and password fields are provided.
   - Ensures the email exists in the database and that the user is verified.

2. **Password Verification**:

   - Compares the input password with the stored, hashed password.

3. **Safe Haven Access Token Generation**:

   - A request is made to the Safe Haven OAuth2 token endpoint using the app's client credentials.
   - The access token, its expiration time, and the IBS Client ID are extracted from the response.

4. **JWT Creation**:

   - Combines user information and the Safe Haven access token into a JWT for secure reuse across the application.

5. **Response**:
   - Returns the generated JWT and the user data to the client.

---

### Safe Haven Token Details in JWT

The JWT generated on login contains the following payload structure:

```json
{
  "id": "63d9f0f0e4e7e20a7c123abc",
  "safeHavenAccessToken": {
    "access_token": "eyJhbGciOiJIUzI1Ni...",
    "expires_in": 3600,
    "ibs_client_id": "SH12345678"
  },
  "iat": 1674674377,
  "exp": 1674760777
}
```

- **`access_token`**: The access token provided by the Safe Haven API for authenticated requests.
- **`expires_in`**: Token validity period in seconds (e.g., 3600 = 1 hour).
- **`ibs_client_id`**: The client identifier associated with the Safe Haven account.

---

### Notes

- Ensure environment variables for Safe Haven credentials (`SAFE_HAVEN_CLIENT_ID`, `SAFE_HAVEN_CLIENT_ASSERTION`, and `SAFE_HAVEN_API_BASE_URL`) are properly configured.
- The Safe Haven access token is securely embedded in the JWT for use across API endpoints that interact with Safe Haven services.

---

---

## Middleware Used

### 1. `otpRateLimiter`

Limits the frequency of OTP requests to prevent abuse.

### 2. `validateRequest`

Ensures incoming requests conform to validation rules defined in the routes.

---

## Models

### User Model

- Fields: `email`, `name`, `phoneNumber`, `password`, `isVerified`, `failedLoginAttempts`, `lastLoginAttempt`

### OTP Model

- Fields: `email`, `codeHash`, `createdAt`, `verified`

---

## Additional Services

### Email Service

- **Description:** Sends OTPs via email using NodeMailer.
- **Environment Variables Required:**
  - `SMTP_HOST`
  - `SMTP_PORT`
  - `SMTP_SECURE`
  - `SMTP_USER`
  - `SMTP_PASS`
  - `SMTP_FROM`
