# BoldData - Advanced VTU Platform

A high-performance Virtual Top-Up (VTU) platform built with Node.js, Express, and MongoDB, featuring atomic transactions, real-time processing, and comprehensive financial services.

## 🌟 Key Features

### 1. Atomic Internal Transfers

- **Real-time Processing**: Instant fund transfers between users
- **Transaction Safety**: MongoDB transactions with automatic rollback
- **Dual Transaction Records**: Complete audit trail with debit/credit entries
- **Reference Generation**: Unique transaction references for both parties
- **Balance Validation**: Atomic balance checks and updates
- **Error Recovery**: Automatic rollback on transaction failures

### 2. Advanced Analytics & Reporting

- **MongoDB Aggregation Pipeline**: Sophisticated data analysis
- **Real-time Metrics**: Transaction processing times and success rates
- **Profit Tracking**: Detailed profit analysis per service type
- **User Activity Monitoring**: Comprehensive activity logging
- **Performance Analytics**: System-wide performance metrics
- **Custom Reports**: Flexible reporting capabilities

### 3. Robust Security Implementation

- **Multi-factor Authentication**:
  - JWT-based session management
  - OTP verification system
  - Google OAuth integration
  - Transaction PIN security
- **Advanced Security Features**:
  - Rate limiting on sensitive endpoints
  - Input validation and sanitization
  - Secure password hashing with bcrypt
  - Session management with MongoDB store
  - PIN attempt tracking and lockout
  - Failed login attempt monitoring

### 4. Comprehensive Transaction Management

- **Atomic Operations**: All financial transactions are atomic
- **Error Handling**: Comprehensive error management system
- **Status Tracking**: Real-time transaction status updates
- **Processing Metrics**: Detailed performance monitoring
- **Receipt Generation**: Automated email receipts
- **Reference System**: Unique transaction references
- **Balance Management**: Real-time balance updates

### 5. High-Quality Data Models

- **User Model**:
  - Comprehensive user profile management
  - Account balance tracking
  - Transaction history
  - Security settings
  - Verification status
- **Transaction Model**:
  - Detailed transaction records
  - Status tracking
  - Metadata support
  - Performance metrics
  - Audit trail

### 6. Service Integrations

- **Payment Providers**: Multiple payment gateway support
- **Airtime & Data**: Direct integration with providers
- **Utility Bills**: Electricity and cable TV payments
- **Bank Transfers**: Internal and external transfers
- **Virtual Accounts**: Automated account management

### 7. Email Service

- **Transaction Receipts**: Automated email notifications
- **OTP Delivery**: Secure OTP transmission
- **Account Alerts**: Important account notifications
- **Marketing Communications**: Targeted email campaigns
- **HTML Templates**: Professional email formatting

### 8. Performance Optimizations

- **Database Indexing**: Optimized query performance
- **Caching**: Redis-based caching system
- **Connection Pooling**: Efficient database connections
- **Rate Limiting**: API abuse prevention
- **Request Validation**: Input sanitization

### 9. Business Logic

- **Profit Calculation**: Automated profit tracking
- **Commission Management**: Flexible commission structure
- **Service Availability**: Real-time service status
- **Balance Validation**: Pre-transaction checks
- **Transaction Limits**: Configurable limits
- **User Restrictions**: Role-based access control

## 🛠 Technical Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Cache**: Redis
- **Queue**: BullMQ
- **Authentication**: JWT, Google OAuth
- **Email**: Nodemailer, Resend
- **Documentation**: Swagger
- **Testing**: Vitest

## 📦 Installation

```bash
# Clone repository
git clone https://github.com/yourusername/bold-data-backend.git

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env

# Start development server
pnpm run dev
```

## 🔧 Environment Variables

```env
JWT_SECRET=
SAFE_HAVEN_OAUTH_CLIENT_ID=
SAFE_HAVEN_API_BASE_URL=
SAFE_HAVEN_CLIENT_ID=
SAFE_HAVEN_CLIENT_ASSERTION=
TOKEN_URL=
FRONTEND_BASE_URL=
SAFE_HAVEN_DEBIT_ACCOUNT_NUMBER=
SAFE_HAVEN_VIRTUAL_ACCOUNT_BANK_CODE=
SMTP_HOST=
SMTP_PORT=
SMTP_SECURE=
SMTP_USER=
SMTP_PASS=
SMTP_FROM=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
DATASTATION_AUTH_TOKEN=
VTU_SERVICE_ACCOUNT=
```

## 📚 API Documentation

Comprehensive API documentation is available via Swagger UI at `/api-docs` when running the server.

## 🔐 Security Features

- JWT-based authentication
- Rate limiting
- Input validation
- Error message sanitization
- Transaction PIN verification
- OTP-based verification
- Google OAuth integration
- Session management
- Password hashing
- PIN attempt tracking

## 📊 Monitoring & Maintenance

- System status tracking
- Performance monitoring
- Error tracking
- User activity logging
- Transaction monitoring
- Service health checks

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- **Your Name** - _Initial work_ - [Your GitHub](https://github.com/yourusername)

## 📞 Contact

For inquiries, reach out to [finzyphinzyy@proton.me](mailto:finzyphinzyy@proton.me)

## 🙏 Acknowledgments

- Thanks to all contributors
- Special thanks to the open-source community
- Inspired by modern fintech solutions
