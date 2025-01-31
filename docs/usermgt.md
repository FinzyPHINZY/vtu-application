## **User Management**

### Overview

This section describes the endpoints used for managing user-specific actions, including requesting a password reset, resetting a password, and setting a transaction PIN.

---

### 1. **Request Password Reset**

**HTTP Method**: `POST`  
**URL**: `/api/user/request-password-reset`

**Headers**: None

**Body Parameters**:

- `email` (required): finzyphinzy@gmail.com.

**Validation**:

- The email must be in a valid format.

**Response**:

- **Success** (`200`):
  ```json
  {
    "success": true,
    "message": "Password reset OTP sent successfully."
  }
  ```
- **Error** (`404`): User not found.
- **Error** (`500`): Internal server error.

---

### 2. **Reset Password**

**HTTP Method**: `POST`  
**URL**: `/api/user/reset-password`

**Headers**:

- `Authorization` (required): Bearer token obtained after verifying OTP.

**Body Parameters**:

- `email` (required): finzyphinzy@gmail.com
- `password` (required): password

**Validation**:

- The email must be in a valid format.
- The password must:
  - Be at least 8 characters long.
  - Contain at least one uppercase letter, one number, and one special character.

**Response**:

- **Success** (`200`):
  ```json
  {
    "success": true,
    "message": "Password reset successful."
  }
  ```
- **Error** (`400`): Invalid input.
- **Error** (`404`): User not found.
- **Error** (`500`): Internal server error.

---

### 3. **Set Transaction PIN**

**HTTP Method**: `POST`  
**URL**: `/api/user/set-transaction-pin`

**Headers**:

- `Authorization` (required): Bearer token obtained after login or registration.

**Body Parameters**:

- `pin` (required): A 4-digit transaction PIN.

```
{
  "transactionPin": "0000"
}
```

**Validation**:

- The PIN must:
  - Be exactly 4 digits long.
  - Contain only numeric characters.

**Rate Limiting**:

- Maximum of 5 attempts per 15 minutes.

**Response**:

- **Success** (`200`):
  ```json
  {
    "success": true,
    "message": "Transaction PIN set successfully."
  }
  ```
- **Error** (`400`): Invalid input (e.g., PIN not meeting requirements).
- **Error** (`404`): User not found.
- **Error** (`429`): Too many attempts.
- **Error** (`500`): Internal server error.

---

### Middleware

1. **Token Extractor**:

   - Extracts the Bearer token from the `Authorization` header and validates it.
   - Attaches the token to the `req.token` object.

2. **User Extractor**:

   - Decodes the token and attaches the user object to `req.user`.
   - Returns `401 Unauthorized` if the token is invalid or the user does not exist.

3. **Validation**:

   - Ensures that input data meets the required formats and constraints.
   - Returns `400 Bad Request` if validation fails.

4. **Rate Limiting**:
   - Password reset and transaction PIN endpoints are protected against abuse using rate limiters.

---

### Notes

1. Ensure that the frontend handles proper token management and error messages for rate-limited actions.
2. Enhance email delivery reliability with fallback providers or retry logic.
