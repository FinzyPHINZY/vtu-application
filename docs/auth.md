##

## **1. Request OTP**

**Endpoint:** `/api/auth/request-otp`  
**Method:** `POST`  
**Description:** Requests an OTP to be sent to the user's email.

### Request

**Headers:**  
None

**Body:**

```json
{
  "email": "finzyphinzy@gmail.com"
}
```

### Response

**Success (200):**

```json
{
  "success": true,
  "message": "OTP sent successfully",
  "otp": "1234"
}
```

**Error (400):**

```json
{
  "success": false,
  "message": "Invalid email address"
}
```

**Error (409):**

```json
{
  "success": false,
  "message": "Email already registered"
}
```

---

## **2. Verify OTP**

**Endpoint:** `/api/auth/verify-otp`  
**Method:** `POST`  
**Description:** Verifies the OTP sent to the user's email.

### Request

**Headers:**  
None

**Body:**

```json
{
  "email": "finzyphinzy@john.com",
  "otp": "1234"
}
```

### Response

**Success (200):**

```json
{
  "success": true,
  "message": "OTP verified successfully",
  "email": "user@example.com"
}
```

**Error (400):**

```json
{
  "success": false,
  "message": "Invalid OTP"
}
```

**Error (404):**

```json
{
  "success": false,
  "message": "User not found"
}
```

---

## **3. Complete Sign-Up**

**Endpoint:** `/api/auth/complete-signup`  
**Method:** `POST`  
**Description:** Completes the user's registration process with additional details.

### Request

**Headers:**  
None

**Body:**

```json
{
  "firstName": "Boluwatife",
  "lastName": "Adeyemi",
  "email": "finzyphinzy@gmail.com",
  "phoneNumber": "+2347051717507",
  "password": "password"
}
```

### Response

**Success (201):**

```json
{
  "success": true,
  "message": "Signed up successfully",
  "data": {
    "firstName": "Boluwatife",
    "lastName": "Adeyemi",
    "email": "finzyphinzy@gmail.com",
    "phoneNumber": "+2347051717507",
    "accountBalance": 0,
    "accountDetails": {
      "bankName": "",
      "accountName": "Boluwatife Adeyemi",
      "accountType": "Current",
      "accountBalance": "0",
      "status": "Pending"
    }
  }
}
```

**Error (400):**

```json
{
  "success": false,
  "message": "First name and Last name must be provided"
}
```

---

## **4. Login**

**Endpoint:** `/api/auth/login`  
**Method:** `POST`  
**Description:** Authenticates a user and generates a JWT for future requests.

### Request

**Headers:**  
None

**Body:**

```json
{
  "email": "finzyphinzy@gmail.com",
  "password": "password"
}
```

### Response

**Success (200):**

```json
{
  "success": true,
  "message": "Signed in successfully",
  "data": {
    "firstName": "Boluwatife",
    "lastName": "Adeyemi",
    "email": "finzyphinzy@gmail.com",
    "accountBalance": 0
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error (401):**

```json
{
  "success": false,
  "message": "Invalid Credentials"
}
```

---

## Notes:

1. The `Safe Haven` API integration during login ensures the `safeHavenAccessToken` is refreshed for each session.
