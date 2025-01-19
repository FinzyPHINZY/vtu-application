### **Payment Endpoints**

#### **1. Initialize Payment**

**URL**: `/api/payment/initialize`  
**Method**: `POST`  
**Authentication Required**: `Yes (Bearer Token)`

**Description**: Initializes a payment by generating a payment link using Paystack and creates a pending transaction in the database.

**Request Headers**:

```json
{
  "Authorization": "Bearer <JWT_TOKEN>",
  "Content-Type": "application/json"
}
```

**Request Body**:

```json
{
  "email": "user@example.com",
  "amount": 100000, // Amount in kobo (e.g., 100000 kobo = 1000 Naira)
  "currency": "NGN", // Default: NGN
  "callback_url": "https://yourapp.com/callback",
  "metadata": {
    "purpose": "wallet_funding"
  },
  "transaction_charge": 5000 // Optional
}
```

**Success Response**:

- **Code**: `201 Created`
- **Body**:

```json
{
  "success": true,
  "message": "Payment initialization successful",
  "data": {
    "authorization_url": "https://paystack.com/authorization-url",
    "access_code": "access_code_here",
    "reference": "transaction_reference_here"
  }
}
```

**Error Responses**:

- **Code**: `400 Bad Request`  
  Invalid request body (e.g., missing or invalid fields).
  ```json
  {
    "success": false,
    "errors": [
      {
        "msg": "Email must be valid",
        "param": "email",
        "location": "body"
      }
    ]
  }
  ```
- **Code**: `401 Unauthorized`  
  Missing or invalid token.
  ```json
  {
    "success": false,
    "message": "No token provided"
  }
  ```
- **Code**: `500 Internal Server Error`  
  Paystack API or server-side failure.
  ```json
  {
    "success": false,
    "message": "Internal server error"
  }
  ```

---

#### **2. Verify Payment**

**URL**: `/api/payment/verify/:reference`  
**Method**: `GET`  
**Authentication Required**: `Yes (Bearer Token)`

**Description**: Verifies a transaction's status using Paystack, updates the database, and adjusts the user's account balance if successful.

**Request Headers**:

```json
{
  "Authorization": "Bearer <JWT_TOKEN>"
}
```

**Path Parameters**:

- `reference` (string): The unique transaction reference to verify.

**Success Response**:

- **Code**: `200 OK`
- **Body**:

```json
{
  "success": true,
  "message": "Transaction verified successfully",
  "data": {
    "reference": "transaction_reference_here",
    "amount": 100000,
    "status": "success",
    "accountBalance": 5000,
    "currency": "NGN",
    "paidAt": "2025-01-19T14:32:00Z"
  }
}
```

**Error Responses**:

- **Code**: `400 Bad Request`  
  Transaction already processed or invalid reference.
  ```json
  {
    "success": false,
    "message": "Transaction completed already"
  }
  ```
- **Code**: `404 Not Found`  
  Transaction or user not found.
  ```json
  {
    "success": false,
    "message": "Transaction not found"
  }
  ```
- **Code**: `403 Forbidden`  
  Unauthorized access to the transaction.
  ```json
  {
    "success": false,
    "message": "Unauthorized transaction access"
  }
  ```
- **Code**: `500 Internal Server Error`  
   Paystack API or server-side failure.

  ```json
  {
    "success": false,
    "message": "Internal server error"
  }
  ```
