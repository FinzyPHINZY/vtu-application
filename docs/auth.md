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
    "name": "John Doe",
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
        "name": "John Doe",
        "email": "user@example.com",
        "phoneNumber": "1234567890"
      },
      "token": "jwtToken"
    }
    ```
  - **400:**
    ```json
    {
      "success": false,
      "message": "Name must be at least 3 characters long"
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

- **Endpoint:** `/login`
- **Method:** `POST`
- **Description:** Authenticates the user and provides a JWT token.
- **Request Body:**
  ```json
  {
    "email": "user@example.com",
    "password": "securePassword123"
  }
  ```
- **Response:**
  - **200:**
    ```json
    {
      "success": true,
      "message": "Signed in successfully",
      "data": {
        "_id": "userId",
        "name": "John Doe",
        "email": "user@example.com",
        "phoneNumber": "1234567890"
      },
      "token": "jwtToken"
    }
    ```
  - **401:**
    ```json
    {
      "success": false,
      "message": "Invalid Credentials"
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

### 5. **Get Token**

- **Endpoint:** `/token`
- **Method:** `POST`
- **Description:** Retrieves an access token for client credentials.
- **Request Body:**
  ```json
  {
    "grant_type": "client_credentials",
    "client_id": "clientId",
    "client_assertion": "jwtToken",
    "client_assertion_type": "urn:ietf:params:oauth:client-assertion-type:jwt-bearer"
  }
  ```
- **Response:**
  - **200:**
    ```json
    {
      "access_token": "token",
      "expires_in": 3600
    }
    ```
  - **400:**
    ```json
    {
      "success": false,
      "message": "Error message from API"
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
