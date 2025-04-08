# VTU Application - Backend

This is a comprehensive Virtual Top-Up (VTU) platform that enables users to perform various digital transactions including airtime purchases, data subscriptions, utility payments, and bank transfers. The platform integrates multiple third-party APIs to provide a seamless user experience.

## Table of Contents

- [Features](#features)
- [Technology Stack](#technology-stack)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [API Documentation](#api-documentation)
- [Security](#security)
- [Error Handling](#error-handling)

## Features

### Core Functionality

- **User Authentication & Authorization**
  - OTP-based authentication
  - Google OAuth integration
  - Role-based access control (User/Admin)
  - Transaction PIN security

### Financial Services

- **Virtual Account Management**
  - Automatic account creation via Safe Haven API
  - Balance tracking
  - Transaction history

### Transaction Types

- **Airtime & Data**

  - Multiple network provider support
  - Bulk purchase capabilities
  - Real-time transaction status

- **Utility Payments**

  - Electricity bill payments
  - Cable TV subscriptions
  - Service verification

- **Bank Transfers**
  - Internal transfers between users
  - External bank transfers
  - Name enquiry verification

### Administrative Features

- System status management
- Transaction monitoring
- User activity tracking
- Analytics dashboard

## Technology Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT, Google OAuth
- **Email Service**: SMTP integration
- **API Integration**: Safe Haven, Payment processors

## Architecture

### Directory Structure

```
├── controllers/ # Request handlers
├── models/ # Database schemas
├── routes/ # API routes
├── services/ # Business logic
├── utils/ # Helper functions
└── middleware/ # Custom middleware
```

### Key Components

- **SystemStatus**: Manages application-wide operational status
- **Transaction Processing**: Handles all financial operations
- **Error Handling**: Centralized error management
- **Rate Limiting**: Prevents API abuse

## Security

- JWT-based authentication
- Rate limiting on sensitive endpoints
- Transaction PIN verification
- Input validation and sanitization
- Error message sanitization

## Error Handling

The application uses a custom `ApiError` class for consistent error handling:

```javascript
class ApiError extends Error {
  constructor(code, success, message, details = null) {
    super(message);
    this.success = success;
    this.code = code;
    this.details = details;
  }
}
```

## Getting Started

### Prerequisites

- Node.js (v14+)
- MongoDB
- Safe Haven API credentials
- SMTP server access

### Installation

#### Clone repository

```bash
git clone https://github.com/yourusername/bold-data-backend.git
```

#### Install dependencies

```bash
npm install
```

#### Set up environment variables

```env
JWT_SECRET=
SAFE_HAVEN_OAUTH_CLIENT_ID=
SAFE_HAVEN_API_BASE_URL=https://api.safehavenmfb.com
SAFE_HAVEN_CLIENT_ID=
SAFE_HAVEN_CLIENT_ASSERTION=<your_client_assertion_token>
TOKEN_URL=https://api.safehavenmfb.com/oauth2/token
FRONTEND_BASE_URL=
SAFE_HAVEN_DEBIT_ACCOUNT_NUMBER=
SAFE_HAVEN_VIRTUAL_ACCOUNT_BANK_CODE=
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=youremail@gmail.com
SMTP_PASS=<your_smtp_password>
SMTP_FROM=example@gmail.com
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
DATASTATION_AUTH_TOKEN=
VTU_SERVICE_ACCOUNT==
```

### Start development server

```bash
npm run dev
```

## API Documentation

Refer to the the Postman documentation here: [Click me!]()

## Security & Best Practices

- **Environment Variables**: Store sensitive credentials securely.
- **Error Handling**: Ensure meaningful error messages.
- **Logging**: Monitor API usage and errors.
- **Rate Limiting**: Prevent API abuse.

## License

MIT License

## Contact

For inquiries, reach out to [finzyphinzyy@proton.me](mailto:finzyphinzyy@proton.me)

<!-- workers -->

```plain
node workers/disableVA.worker.js
# or
pm2 start workers/disableVA.worker.js --name disable-va-worker
```
