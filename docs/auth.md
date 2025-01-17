# API Documentation for Authentication Endpoints

## Base URL

```
/api/auth
```

---

## 1. Request OTP

**Endpoint**: `/request-otp`

**Method**: `POST`

### Description

Generates a one-time password (OTP) for the given email and sends it to the user.

### Request Body

```json
{
  "email": "user@example.com"
}
```

### Responses

- **200 OK**:

  ```json
  {
    "success": true,
    "message": "OTP sent successfully",
    "otp": "1234"
  }
  ```

- **400 Bad Request**:

  ```json
  {
    "success": false,
    "message": "Invalid email address"
  }
  ```

- **500 Internal Server Error**:
  ```json
  {
    "success": false,
    "message": "Internal Server Error - Failed to send OTP",
    "error": "Error details"
  }
  ```

---

## 2. Verify OTP

**Endpoint**: `/verify-otp`

**Method**: `POST`

### Description

Validates the OTP provided by the user.

### Request Body

```json
{
  "email": "user@example.com",
  "otp": "1234"
}
```

### Responses

- **200 OK**:

  ```json
  {
    "success": true,
    "message": "OTP verified successfully",
    "email": "user@example.com"
  }
  ```

- **400 Bad Request**:

  ```json
  {
    "success": false,
    "message": "Invalid OTP"
  }
  ```

- **500 Internal Server Error**:
  ```json
  {
    "success": false,
    "message": "Internal Server Error - Failed to verify OTP",
    "error": "Error details"
  }
  ```

---

## 3. Complete Signup

**Endpoint**: `/complete-signup`

**Method**: `POST`

### Description

Completes the signup process by saving user details and generating a token.

### Request Body

```json
{
  "name": "John Doe",
  "email": "user@example.com",
  "phoneNumber": "+123456789"
}
```

### Responses

- **201 Created**:

  ```json
  {
    "success": true,
    "message": "Signed up successfully",
    "data": {
      "_id": "unique_user_id",
      "name": "John Doe",
      "email": "user@example.com",
      "phoneNumber": "+123456789"
    },
    "token": "jwt_token_here"
  }
  ```

- **400 Bad Request**:

  ```json
  {
    "success": false,
    "message": "Email already exists"
  }
  ```

- **500 Internal Server Error**:
  ```json
  {
    "success": false,
    "message": "Internal Server error"
  }
  ```

---

## 4. Login

**Endpoint**: `/login`

**Method**: `POST`

### Description

Authenticates a user by verifying their OTP and generates a token.

### Request Body

```json
{
  "email": "user@example.com",
  "otp": "1234"
}
```

### Responses

- **200 OK**:

  ```json
  {
    "success": true,
    "message": "Signed in successfully",
    "data": {
      "_id": "unique_user_id",
      "name": "John Doe",
      "email": "user@example.com",
      "phoneNumber": "+123456789"
    },
    "token": "jwt_token_here"
  }
  ```

- **404 Not Found**:

  ```json
  {
    "success": false,
    "message": "User not found"
  }
  ```

- **400 Bad Request**:

  ```json
  {
    "success": false,
    "message": "Invalid OTP"
  }
  ```

- **500 Internal Server Error**:
  ```json
  {
    "success": false,
    "message": "Internal Server error"
  }
  ```
