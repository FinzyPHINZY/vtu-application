## **Authentication Hub**

### Overview

The Authentication Hub serves as the entry point for user authentication. It provides endpoints for requesting OTPs, verifying OTPs, completing signup, logging in, and Google authentication.

---

### 1. **Request OTP**

**HTTP Method**: `POST`  
**URL**: `/api/auth/request-otp`

**Headers**: None

**Body Parameters**:

- `email` (required): The user's email address.

**Rate Limiting**:

- Maximum of 3 requests per minute.

**Response**:

- **Success** (`200`):
  ```json
  {
    "success": true,
    "message": "OTP sent successfully."
  }
  ```
- **Error** (`429`): Too many requests.
- **Error** (`500`): Internal server error.

---

### 2. **Verify OTP**

**HTTP Method**: `POST`  
**URL**: `/api/auth/verify-otp`

**Headers**: None

**Body Parameters**:

- `email` (required): The user's email address.
- `otp` (required): The OTP sent to the user's email.

**Response**:

- **Success** (`200`):
  ```json
  {
    "success": true,
    "message": "OTP verified successfully."
  }
  ```
- **Error** (`400`): Invalid OTP or request format.
- **Error** (`404`): User not found.

---

### 3. **Complete Signup**

**HTTP Method**: `POST`  
**URL**: `/api/auth/complete-signup`

**Headers**: None

**Body Parameters**:

- `email` (required): The user's email address.
- `firstName` (required): The user's first name.
- `lastName` (required): The user's last name.
- `phoneNumber` (optional): The user's phone number.
- `password` (required): The user's password.

**Response**:

- **Success** (`201`):
  ```json
  {
    "success": true,
    "message": "Signup completed successfully."
  }
  ```
- **Error** (`400`): Invalid data.
- **Error** (`404`): User not found.

---

### 4. **Login**

**HTTP Method**: `POST`  
**URL**: `/api/auth/login`

**Headers**: None

**Body Parameters**:

- `email` (required): The user's email address.
- `password` (required): The user's password.

**Rate Limiting**:

- Maximum of 5 login attempts per 15 minutes.

**Response**:

- **Success** (`200`):
  ```json
  {
    "success": true,
    "token": "JWT token here"
  }
  ```
- **Error** (`401`): Incorrect email or password.
- **Error** (`429`): Too many login attempts.

---

### 5. **Google Login**

**HTTP Method**: `POST`  
**URL**: `/api/auth/google`

**Headers**: None

**Body Parameters**:

- `idToken` (required): The ID token from Google OAuth2.

**Rate Limiting**:

- Maximum of 5 login attempts per 15 minutes.

**Response**:

- **Success** (`200`):
  ```json
  {
    "success": true,
    "token": "JWT token here"
  }
  ```
- **Error** (`400`): Invalid or missing ID token.
- **Error** (`429`): Too many login attempts.

---
