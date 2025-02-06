# VTU Service API Documentation

## Authentication

All requests must be authenticated using a **Bearer Token** in the `Authorization` header.

Example:

```http
Authorization: Bearer <your_token>
```

---

## 1. Buy Airtime

### **Endpoint:** `/api/v1/airtime`

**Method:** `POST`

### **Request Body:**

```json
{
  "mobile_number": "08123456789",
  "amount": 500,
  "network": 1
}
```

### **Request Parameters:**

- `mobile_number` (string, required): The recipient's phone number.
- `amount` (number, required): The amount of airtime to purchase.
- `network` (number, required): The network provider (1 = MTN, 2 = GLO, 3 = Airtel, 4 = 9Mobile).

### **Response:**

#### Success:

```json
{
  "success": true,
  "message": "Airtime purchase successful.",
  "transaction_id": "12345",
  "balance": 9500
}
```

#### Errors:

- `400 BAD REQUEST`: Invalid request body.
- `401 UNAUTHORIZED`: Invalid or missing token.
- `402 PAYMENT REQUIRED`: Insufficient balance.
- `500 INTERNAL SERVER ERROR`: Server-side processing failure.

---

## 2. Buy Data Plan

### **Endpoint:** `/api/v1/data`

**Method:** `POST`

### **Request Body:**

```json
{
  "mobile_number": "08123456789",
  "plan_id": "mtn_1gb_30days",
  "network": 1
}
```

### **Request Parameters:**

- `mobile_number` (string, required): The recipient's phone number.
- `plan_id` (string, required): The data plan ID.
- `network` (number, required): The network provider (1 = MTN, 2 = GLO, 3 = Airtel, 4 = 9Mobile).

### **Response:**

#### Success:

```json
{
  "success": true,
  "message": "Data purchase successful.",
  "transaction_id": "67890",
  "balance": 8500
}
```

#### Errors:

- `400 BAD REQUEST`: Invalid request body.
- `401 UNAUTHORIZED`: Invalid or missing token.
- `402 PAYMENT REQUIRED`: Insufficient balance.
- `500 INTERNAL SERVER ERROR`: Server-side processing failure.

---

## 3. Fetch Transaction Status

### **Endpoint:** `/api/v1/transactions/:transaction_id`

**Method:** `GET`

### **Path Parameters:**

- `transaction_id` (string, required): The ID of the transaction.

### **Response:**

#### Success:

```json
{
  "success": true,
  "transaction": {
    "id": "12345",
    "status": "completed",
    "amount": 500,
    "type": "airtime",
    "timestamp": "2025-02-05T10:15:30Z"
  }
}
```

#### Errors:

- `404 NOT FOUND`: Transaction ID not found.
- `401 UNAUTHORIZED`: Invalid or missing token.

---

## 4. Fetch User Balance

### **Endpoint:** `/api/v1/user/balance`

**Method:** `GET`

### **Response:**

#### Success:

```json
{
  "success": true,
  "balance": 9500
}
```

#### Errors:

- `401 UNAUTHORIZED`: Invalid or missing token.
- `500 INTERNAL SERVER ERROR`: Server-side processing failure.

---

## 5. Fetch Available Data Plans

### **Endpoint:** `/api/v1/data/plans`

**Method:** `GET`

### **Response:**

#### Success:

```json
{
  "success": true,
  "plans": [
    {
      "id": "mtn_1gb_30days",
      "network": "MTN",
      "data_size": "1GB",
      "validity": "30 days",
      "price": 1000
    },
    {
      "id": "glo_2gb_30days",
      "network": "GLO",
      "data_size": "2GB",
      "validity": "30 days",
      "price": 1500
    }
  ]
}
```

#### Errors:

- `401 UNAUTHORIZED`: Invalid or missing token.
- `500 INTERNAL SERVER ERROR`: Server-side processing failure.

---

### Notes:

- All monetary transactions are in **Naira (₦)**.
- Ensure network IDs are correctly mapped.
- Transactions are **non-reversible** once completed.
- If a transaction fails, contact support with the transaction ID.
