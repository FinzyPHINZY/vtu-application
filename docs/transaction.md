### Transaction Endpoints Documentation

#### Base URL

`/api/transactions`

---

### 1. **Purchase Airtime**

#### Endpoint

`POST /api/transactions/airtime`

#### Description

Processes an airtime purchase transaction.

#### Headers

- `Authorization`: `Bearer <JWT token>` (required)

#### Request Body

```json
{
  "serviceCategoryId": "string",
  "amount": "integer (positive)",
  "phoneNumber": "string (E.164 format)",
  "pin": "string (4 digits)"
}
```

#### Example Request

```json
{
  "serviceCategoryId": "61e9892e0e69308aa37a7a9c",
  "phoneNumber": "+2347051717505",
  "amount": 100,
  "transactionPin": "0000"
}
```

#### Response

**Success (200):**

```json
{
  "success": true,
  "message": "Airtime purchase successful",
  "data": {
    "phoneNumber": "+2347051717505"
  }
}
```

**Error (400, 401, 403, 500):**

```json
{
  "success": false,
  "message": "Error message explaining the failure"
}
```

---

### 2. **Purchase Data**

#### Endpoint

`POST /api/transactions/data`

#### Description

Processes a data purchase transaction.

#### Headers

- `Authorization`: `Bearer <JWT token>` (required)

#### Request Body

```json
{
  "serviceCategoryId": "string",
  "bundleCode": "string",
  "amount": "integer (positive)",
  "phoneNumber": "string (E.164 format)",
  "debitAccountNumber": "string",
  "transactionPin": "string (4 digits)"
}
```

#### Example Request

```json
{
  "serviceCategoryId": "6502e9a236208a4de6d1b2ac",
  "bundleCode": "DataPlan 100MB Daily",
  "amount": 100,
  "phoneNumber": "+2348167817217",
  "transactionPin": "0000"
}
```

#### Response

**Success (200):**

```json
{
  "success": true,
  "message": "Data purchase successful",
  "data": {
    "reference": "DAT123456789",
    "amount": 1000,
    "phoneNumber": "+1234567890",
    "status": "success",
    "timestamp": "2025-01-25T12:34:56.789Z"
  }
}
```

**Error (400, 401, 403, 500):**

```json
{
  "success": false,
  "message": "Error message explaining the failure"
}
```

---

### 3. **Pay for Cable TV**

#### Endpoint

`POST /api/transactions/cable-tv`

#### Description

Processes a cable TV payment transaction.

#### Headers

- `Authorization`: `Bearer <JWT token>` (required)

#### Request Body

```json
{
  "serviceCategoryId": "61e9857bbce8e444a4976641",
  "bundleCode": "Jinja",
  "amount": 3300,
  "cardNumber": "8061717048",
  "transactionPin": "0000"
}
```

#### Example Request

```json
{
  "serviceCategoryId": "CTV123",
  "bundleCode": "BUN456",
  "amount": 2000,
  "cardNumber": "1234567890123456",
  "debitAccountNumber": "12345678",
  "pin": "1234"
}
```

#### Response

**Success (200):**

```json
{
  "success": true,
  "message": "Cable TV payment successful",
  "data": {
    "reference": "CTV123456789",
    "amount": 2000,
    "status": "success",
    "timestamp": "2025-01-25T12:34:56.789Z"
  }
}
```

**Error (400, 401, 403, 500):**

```json
{
  "success": false,
  "message": "Error message explaining the failure"
}
```

---

### 4. **Pay Utility Bill**

#### Endpoint

`POST /api/transactions/utility`

#### Description

Processes a utility bill payment transaction.

#### Headers

- `Authorization`: `Bearer <JWT token>` (required)

#### Request Body

```json
{
  "serviceCategoryId": "string",
  "meterNumber": "string",
  "amount": "integer (positive)",
  "vendType": "string",
  "debitAccountNumber": "string",
  "pin": "string (4 digits)"
}
```

#### Example Request

```json
{
  "serviceCategoryId": "UTIL123",
  "meterNumber": "9876543210",
  "amount": 3000,
  "vendType": "prepaid",
  "debitAccountNumber": "12345678",
  "pin": "1234"
}
```

#### Response

**Success (200):**

```json
{
  "success": true,
  "message": "Utility bill payment successful",
  "data": {
    "reference": "UTIL123456789",
    "amount": 3000,
    "status": "success",
    "timestamp": "2025-01-25T12:34:56.789Z"
  }
}
```

**Error (400, 401, 403, 500):**

```json
{
  "success": false,
  "message": "Error message explaining the failure"
}
```

---

### Common Validation Rules

- All endpoints require a valid JWT token in the `Authorization` header.
- Transactions must include a valid `pin`.
- Inputs must meet the validation criteria outlined in the request body sections.
