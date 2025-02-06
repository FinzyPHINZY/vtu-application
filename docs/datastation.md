# VTU Service API Documentation

## Authentication

All requests must be authenticated using a **Bearer Token** in the `Authorization` header.

Example:

```http
Authorization: Bearer <your_token>
```

---

## 1. Buy Airtime

### **Endpoint:** `/api/transactions/airtime`

**Method:** `POST`

### **Request Body:**

```json
{
  "network": 1,
  "amount": 200,
  "mobile_number": "08167817217",
  "Ported_number": true,
  "airtime_type": "VTU",
  "transactionPin": "0000"
}
```

### **Request Parameters:**

- `mobile_number` (string, required): The recipient's phone number.
- `amount` (number, required): The amount of airtime to purchase.
- `network` (number, required): The network provider (1 = MTN, 2 = GLO, 3 = Airtel, 4 = 9Mobile).
- `Ported_number` (boolean, required): Just leave it as true. Explanation not provided in documentation
- `airtime_type` (string, required): 'VTU'

### **Response:**

#### Success:

```json
{
  "success": true,
  "message": "Airtime purchase successful.",
  "transaction_id": "12345"
}
```

#### Errors:

- `400 BAD REQUEST`: Invalid request body.
- `401 UNAUTHORIZED`: Invalid or missing token.
- `402 PAYMENT REQUIRED`: Insufficient balance.
- `500 INTERNAL SERVER ERROR`: Server-side processing failure.

---

## 2. Buy Data Plan

### **Endpoint:** `/api/transactions/data`

**Method:** `POST`

### **Request Body:**

```json
{
  "network": 1,
  "mobile_number": "08167817217",
  "plan": 213,
  "Ported_number": true,
  "transactionPin": "0000",
  "amount": 2570
}
```

### **Request Parameters:**

- `mobile_number` (string, required): The recipient's phone number.
- `plan_id` (string, required): The data plan ID.
- `network` (number, required): The network provider (1 = MTN, 2 = GLO, 3 = Airtel, 4 = 9Mobile).
- `amount` (number, required): The amount of the plan to be bought. It has to be exact.
- `Ported_number` (boolean, required): Just leave it as true. Explanation not provided in documentation

### **Response:**

#### Success:

```json
{
  "success": true,
  "message": "Data purchase successful.",
  "transaction_id": "67890"
}
```

#### Errors:

- `400 BAD REQUEST`: Invalid request body.
- `401 UNAUTHORIZED`: Invalid or missing token.
- `402 PAYMENT REQUIRED`: Insufficient balance.
- `500 INTERNAL SERVER ERROR`: Server-side processing failure.

---

## 3. Buy Electricity

### **Endpoint:** `/api/transactions/utility`

**Method:** `POST`

### **Request Body:**

```json
{
  "disco_name": 10,
  "amount": 5000,
  "meter_number": "04252204906",
  "meterType": "prepaid",
  "transactionPin": "0000"
}
```

### **Request Parameters:**

- `disco_name` (string, required): The Id of the Disco company - Provided in the electricity companies endpoint.
- `meterType` (string, required): PREPAID or POSTPAID.
- `meter_number` (number, required): The meter number of the customer.
- `amount` (number, required): The amount of the electricity to be bought.

### **Response:**

#### Success:

```json
{
  "success": true,
  "message": "Data purchase successful.",
  "transaction_id": "67890"
}
```

#### Errors:

- `400 BAD REQUEST`: Invalid request body.
- `401 UNAUTHORIZED`: Invalid or missing token.
- `402 PAYMENT REQUIRED`: Insufficient balance.
- `500 INTERNAL SERVER ERROR`: Server-side processing failure.

---

## 4. Buy Cable-Tv

### **Endpoint:** `/api/transactions/cable-tv`

**Method:** `POST`

### **Request Body:**

```json
{
  "cablename": 1,
  "cableplan": 16,
  "smart_card_number": "8061717048",
  "amount": 3300,
  "transactionPin": "0000"
}
```

### **Request Parameters:**

- `cableplan` (string, required): The cablePlanID of the cable plan.
- `cablename` (string, required): The cablename of the cable plan.
- `smart_card_number` (number, required): The card number of the customer.
- `amount` (number, required): The amount of the cable plan. it has to be exact.

### **Response:**

#### Success:

```json
{
  "success": true,
  "message": "Data purchase successful.",
  "transaction_id": "67890"
}
```

#### Errors:

- `400 BAD REQUEST`: Invalid request body.
- `401 UNAUTHORIZED`: Invalid or missing token.
- `402 PAYMENT REQUIRED`: Insufficient balance.
- `500 INTERNAL SERVER ERROR`: Server-side processing failure.

---

## 3. Fetch Transaction Status

### **Endpoint:** `/api/transactions/transactions/:transaction_id`

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

## 5. Fetch Available Data Plans

### **Endpoint:** `/api/transactions/data/plans`

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
