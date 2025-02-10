# API Documentation: Internal Transfers

## Base URL

```
/api/transfers
```

---

## 1. Lookup Payee

### Endpoint:

```
POST /lookup
```

### Description:

This endpoint allows users to search for a payee using their email address before making an internal transfer.

### Headers:

- `Authorization: Bearer <token>`

### Request Body:

```json
{
  "email": "payee@example.com"
}
```

### Response:

#### Success (200):

```json
{
  "success": true,
  "message": "Payee found",
  "data": {
    "id": "payee_id",
    "firstName": "John",
    "lastName": "Doe",
    "email": "payee@example.com"
  }
}
```

#### Errors:

- `404`: No user found with this email
- `400`: Cannot transfer to your own account

---

## 2. Perform Internal Transfer

### Endpoint:

```
POST /transfer
```

### Description:

This endpoint allows users to transfer funds to another Bold Data user.

### Headers:

- `Authorization: Bearer <token>`

### Request Body:

```json
{
  "payeeId": "recipient_user_id",
  "amount": 1000,
  "transactionPin": "1234"
}
```

### Response:

#### Success (200):

```json
{
  "success": true,
  "message": "Transfer completed successfully",
  "data": {
    "reference": "TRF_PAYER_ABC123",
    "amount": 1000,
    "timestamp": "2025-02-07T12:00:00Z",
    "payee": {
      "id": "payee_id",
      "email": "payee@example.com"
    },
    "newBalance": 5000
  }
}
```

#### Errors:

- `400`: Amount must be at least 100 naira
- `400`: Insufficient funds
- `404`: Payee account not found
- `403`: Transaction PIN not set
- `429`: Too many failed PIN attempts (locked for 30 minutes)
- `401`: Incorrect transaction PIN
- `500`: Internal Server Error

---

## Rate Limits

### Lookup Payee:

- **30 requests per 15 minutes per IP**
- Exceeding limit results in:
  ```json
  {
    "success": false,
    "message": "Too many lookup requests, please try again later"
  }
  ```

### Transfers:

- **10 transfers per hour per IP**
- Exceeding limit results in:
  ```json
  {
    "success": false,
    "message": "Transfer limit exceeded, please try again later"
  }
  ```
