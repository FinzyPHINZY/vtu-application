# API Documentation: Home Page Endpoints

This documentation describes the endpoints required to retrieve data for the Home Page. The data includes user account details, notifications, previous transactions, and available services. The endpoints are designed to ensure seamless integration with the frontend.

## Base URL

```
/api
```

---

## Authentication Routes

### Login Endpoint

**Route:**

```
POST /api/auth/login
```

**Description:**
Authenticates the user and retrieves their account information, including account balance, previous transactions, and notification settings.

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Signed in successfully",
  "data": {
    "hasSetTransactionPin": false,
    "failedPinAttempts": 0,
    "accountBalance": 0,
    "transactions": [],
    "isVerified": true,
    "status": "active",
    "accountDetails": {
      "accountName": "BOLDDATABILLSPA / JOHN DOE",
      "accountType": "Current",
      "accountBalance": "0",
      "status": "Active"
    },
    "firstName": "Bob",
    "lastName": "Bobberson",
    "accountNumber": "8027900837"
  },
  "token": "jwt-token"
}
```

**Key Data Returned:**

- `accountBalance`: Current balance of the user's account.
- `transactions`: List of previous transactions.
- `hasSetTransactionPin`: Indicates if the user has set a transaction pin.
- `accountDetails`: Detailed information about the user's account.

**Error Responses:**

- **400:** Missing required fields.
- **401:** Invalid credentials.
- **500:** Internal server error.

---

## Services Routes

### Fetch Services

**Route:**

```
GET /api/services
```

**Description:**
Fetches the list of services available for use on the platform.

**Headers:**

```json
{
  "Authorization": "Bearer <jwt-token>"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Services fetched successfully",
  "data": [
    {
      "_id": "61e985180e69308aa37a7a94",
      "name": "Mobile Recharge",
      "identifier": "AIRTIME",
      "description": "Airtime Recharge",
      "createdAt": "2022-01-20T15:51:52.311Z",
      "updatedAt": "2022-01-20T15:51:52.311Z",
      "__v": 0
    },
    {
      "_id": "61e9854bbce8e444a497663e",
      "name": "DATA PURCHASE",
      "identifier": "DATA",
      "description": "Data bundle subscription",
      "createdAt": "2022-01-20T15:52:43.385Z",
      "updatedAt": "2022-01-20T15:52:43.385Z",
      "__v": 0
    },
    {
      "_id": "61e9857bbce8e444a4976641",
      "name": "CABLE TV",
      "identifier": "CABLETV",
      "description": "Cable tv subscription",
      "createdAt": "2022-01-20T15:53:31.994Z",
      "updatedAt": "2022-01-20T15:53:31.994Z",
      "__v": 0
    },
    {
      "_id": "61e985a3bce8e444a4976643",
      "name": "UTILITY BILLS",
      "identifier": "UTILITY",
      "description": "Power and Disco bills",
      "createdAt": "2022-01-20T15:54:11.083Z",
      "updatedAt": "2022-01-20T15:54:11.083Z",
      "__v": 0
    }
  ]
}
```

**Key Data Returned:**

- List of services: `TV`, `Data`, `Airtime`, `Utility`.

**Error Responses:**

- **400:** Missing or invalid Authorization header.
- **401:** Invalid token.
- **500:** Internal server error.

---

## Middleware

### Token Extractor

**Functionality:**
Extracts the JWT token from the `Authorization` header and attaches it to the request object as `req.token`.

### User Extractor

**Functionality:**
Verifies the JWT token and retrieves the user details from the database. Attaches the user details to `req.user`.

### Validate Headers

**Functionality:**
Ensures the `Authorization` header is present and valid.

---

## Home Page Data

The data required for the Home Page is fetched via the following:

1. **User Data** (via `/api/auth/login`):

   - `accountBalance`: Displayed to the user.
   - `transactions`: Used to show the user's transaction history.
   - `hasSetTransactionPin`: Determines if a notification to set a transaction pin should be shown.
   - `accountDetails`: Determines if a notification for identity and credit check should be shown.

2. **Services List** (via `/api/services`):
   - Displays the list of available services: `TV`, `Data`, `Airtime`, and `Utility`.

---

**Notes:**

- The information for the Home Page is available upon successful login.
- Ensure proper handling of tokens and secure storage of sensitive data.
