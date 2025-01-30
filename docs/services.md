# Services Endpoints Documentation

This document provides detailed information about the `/api/services` endpoints, including their purposes, request structures, and expected responses.

# API Documentation for VAS Services

## Authentication

All requests require the following headers:

- `Authorization`: Bearer token obtained from Safe Haven API.
- `Content-Type`: `application/json`
- `ClientID`: The client ID associated with your Safe Haven account.

## Endpoints

### Services

#### 1. Get All Services

**URL:** `/api/services`

**Method:** `GET`

**Headers:**

- `Authorization`: Bearer Token
- `Content-Type`: `application/json`

**Description:** Fetch all available VAS services.

**Response:**

- `200 OK`: Successfully fetched services.
- `500 Internal Server Error`: Failed to fetch services.

**Example Response:**

```json
{
  "success": true,
  "message": "Services fetched successfully",
  "data": [
    {
      "id": "service1",
      "name": "Airtime Purchase",
      "description": "Buy airtime from major networks"
    }
  ]
}
```

---

#### 2. Get Service by ID

**URL:** `/api/services/:id/service`

**Method:** `GET`

**Headers:**

- `Authorization`: Bearer Token
- `Content-Type`: `application/json`

**Parameters:**

- `id`: Service ID (path parameter).

**Description:** Fetch details of a specific service by ID.

**Response:**

- `200 OK`: Successfully fetched service.
- `500 Internal Server Error`: Failed to fetch service.

**Example Response:**

```json
{
  "success": true,
  "message": "Service fetched successfully",
  "data": {
    "id": "service1",
    "name": "Airtime Purchase",
    "categories": [
      {
        "id": "category1",
        "name": "MTN Airtime"
      }
    ]
  }
}
```

---

#### 3. Get Service Categories

**URL:** `/api/services/:id/service-categories`

**Method:** `GET`

**Headers:**

- `Authorization`: Bearer Token
- `Content-Type`: `application/json`

**Parameters:**

- `id`: Service ID (path parameter).

**Description:** Fetch categories of a specific service.

**Response:**

- `200 OK`: Successfully fetched service categories.
- `500 Internal Server Error`: Failed to fetch service categories.

**Example Response:**

```json
{
  "success": true,
  "message": "Service categories fetched successfully",
  "data": [
    {
      "id": "category1",
      "name": "MTN Airtime"
    }
  ]
}
```

---

#### 4. Verify Power/TV Data Information

**URL:** `/api/services/verify`

**Method:** `POST`

**Headers:**

- `Authorization`: Bearer Token
- `Content-Type`: `application/json`

**Body:**

```json
{
  "serviceCategoryId": "string",
  "entityNumber": "string"
}


// Example:
{
  "serviceCategoryId": "61e98bf962d9b6a917f93030",
  "entityNumber": "04252204906"
}
```

**Description:** Verify the validity of entity details (e.g., meter or card number).

**Response:**

- `200 OK`: Successfully verified entity.
- `500 Internal Server Error`: Failed to verify entity.

**Example Response:**

```json
{
  "success": true,
  "message": "Entity verification successful",
  "data": {
    "status": "VALID",
    "details": {
      "name": "John Doe",
      "accountNumber": "1234567890"
    }
  }
}
```

---

### VAS Payments

#### 5. Purchase Airtime

**URL:** `/api/services/pay/airtime`

**Method:** `POST`

**Headers:**

- `Authorization`: Bearer Token
- `Content-Type`: `application/json`

**Body:**

```json
{
  "serviceCategoryId": "string",
  "amount": "number",
  "channel": "string",
  "debitAccountNumber": "string",
  "phoneNumber": "string",
  "statusUrl": "string"
}
```

**Description:** Purchase airtime for a specified phone number.

**Response:**

- `200 OK`: Successfully initiated airtime purchase.
- `500 Internal Server Error`: Failed to initiate airtime purchase.

**Example Response:**

```json
{
  "success": true,
  "message": "Airtime purchase initiated successfully",
  "data": {
    "transactionId": "txn_123456",
    "status": "PENDING"
  }
}
```

---

#### 6. Purchase Data

**URL:** `/api/services/pay/data`

**Method:** `POST`

**Headers:**

- `Authorization`: Bearer Token
- `Content-Type`: `application/json`

**Body:**

```json
{
  "serviceCategoryId": "string",
  "bundleCode": "string",
  "amount": "number",
  "channel": "string",
  "debitAccountNumber": "string",
  "phoneNumber": "string",
  "statusUrl": "string"
}
```

**Description:** Purchase a data bundle for a specified phone number.

**Response:**

- `200 OK`: Successfully initiated data purchase.
- `500 Internal Server Error`: Failed to initiate data purchase.

**Example Response:**

```json
{
  "success": true,
  "message": "Data purchase initiated successfully",
  "data": {
    "transactionId": "txn_123457",
    "status": "PENDING"
  }
}
```

---

#### 7. Purchase Cable TV Subscription

**URL:** `/api/services/pay/cable-tv`

**Method:** `POST`

**Headers:**

- `Authorization`: Bearer Token
- `Content-Type`: `application/json`

**Body:**

```json
{
  "serviceCategoryId": "string",
  "bundleCode": "string",
  "amount": "number",
  "channel": "string",
  "debitAccountNumber": "string",
  "cardNumber": "string"
}
```

**Description:** Purchase a cable TV subscription.

**Response:**

- `200 OK`: Successfully initiated subscription purchase.
- `500 Internal Server Error`: Failed to initiate subscription purchase.

**Example Response:**

```json
{
  "success": true,
  "message": "Cable TV subscription initiated successfully",
  "data": {
    "transactionId": "txn_123458",
    "status": "PENDING"
  }
}
```

---

#### 8. Pay Utility Bill

**URL:** `/api/services/pay/utility`

**Method:** `POST`

**Headers:**

- `Authorization`: Bearer Token
- `Content-Type`: `application/json`

**Body:**

```json
{
  "serviceCategoryId": "string",
  "meterNumber": "string",
  "amount": "number",
  "channel": "string",
  "debitAccountNumber": "string",
  "vendType": "string"
}
```

**Description:** Pay a utility bill for a specified meter number.

**Response:**

- `200 OK`: Successfully initiated utility bill payment.
- `500 Internal Server Error`: Failed to initiate payment.

**Example Response:**

```json
{
  "success": true,
  "message": "Utility bill payment initiated successfully",
  "data": {
    "transactionId": "txn_123459",
    "status": "PENDING"
  }
}
```

---

### Transactions

#### 9. Get All Transactions

**URL:** `/api/services/transactions`

**Method:** `GET`

**Headers:**

- `Authorization`: Bearer Token
- `Content-Type`: `application/json`

**Description:** Fetch all VAS transactions for the authenticated user.

**Response:**

- `200 OK`: Successfully fetched transactions.
- `500 Internal Server Error`: Failed to fetch transactions.

**Example Response:**

```json
{
  "success": true,
  "message": "Transactions fetched successfully",
  "data": [
    {
      "transactionId": "txn_123456",
      "type": "AIRTIME",
      "status": "SUCCESS",
      "amount": ...
    }
  ]
}

```
