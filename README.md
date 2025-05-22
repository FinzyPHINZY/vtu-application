

# VTU Application Backend

A robust backend for a Nigerian Virtual Top-Up (VTU) and payments platform. This system handles everything from airtime/data purchase to secure money transfers and admin analytics — built with scalability, security, and speed in mind. The platform integrates multiple third-party APIs to provide a seamless user experience.


---

## 🔥 Core Features

### 1. 💸 Atomic Internal Transfers

* MongoDB transactions power atomic operations (even faster than OPay's implementation — yeah, i said it 😎).
* Session-based operations ensure no half-done transfers.
* Real-time balance updates and dual transaction logging (debit & credit).
* Automatic rollback if anything goes sideways.
* Clean reference generation for both parties.

### 2. 📊 Advanced MongoDB Aggregation & Analytics

* Track every kobo with sophisticated aggregations.
* Real-time balance and transaction histories.
* Profits segmented by service types.
* Processing time metrics and logs for nerds who love performance.

### 3. 🔐 Robust Security Implementation

* JWT authentication with session tracking.
* OTP system that doesn't slack.
* Google OAuth (because why type passwords?).
* Secure transaction PIN verification.
* Rate limiting to avoid yahoos.
* Strong password hashing with bcrypt.

### 4. 📦 Smooth Verification Flow

* Multi-step user verification.
* OTP + email + phone = tight security.
* KYC ready (plug in any provider).
* Real-time verification status updates.

### 5. 🔁 Transaction Management

* All money moves are atomic.
* Automatic rollback when a wahala occurs.
* Track transaction status & processing time.
* Reference generation and email receipts.

### 6. 🧱 High-Quality Models

* Mongoose schemas with solid structure.
* Indexed for high performance.
* Relational design and validation rules.
* Activity logs and audit trails included.

### 7. 🚏 Well-Defined Routes

* RESTful design with clear endpoint naming.
* Layered middleware.
* Swagger API documentation.
* Rate limiting + validation = less headache.

### 8. 📧 Email Integration

* HTML emails for receipts, OTPs, and updates.
* Works with any SMTP provider.
* Tracks delivery status too.

### 9. 🔌 Service Integrations

* PalmPay for payments and virtual accounts.
* Airtime & data APIs.
* Utility bills, cable TV, and more.

### 10. 🧠 Advanced Features

* Bulk processing, reconciliation, and admin controls.
* Real-time system monitoring.
* Activity tracking and analytics dashboard.

### 11. 🚨 Error Handling & Logging

* Centralized error handlers.
* Transaction-level logging.
* Friendly messages for users, detailed logs for devs.

### 12. 🚀 Performance Optimizations

* Indexing, caching, and query tuning.
* Efficient connection pooling.
* Minimal payloads, validated requests.

### 13. 🧮 Business Logic

* Service-based profit & commission calculation.
* Limits, restrictions, and availability checks.

### 14. 📟 Monitoring & Maintenance

* Real-time health checks.
* Transaction audits.
* Log-based alerting.

### 15. Administrative Features

- System status management
- Transaction monitoring
- User activity tracking
- Analytics dashboard

---

## 🛠 Tech Stack

* **Backend:** Node.js, Express
* **Database:** MongoDB (Mongoose)
* **Job Queues:** BullMQ (Redis)
* **Authentication:** JWT, OTP, Google OAuth
* **Email:** Nodemailer, Resend
* **Docs:** Postman

---

### Key Components

- **SystemStatus**: Manages application-wide operational status
- **Transaction Processing**: Handles all financial operations
- **Error Handling**: Centralized error management
- **Rate Limiting**: Prevents API abuse



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

---

## 📬 Contact

Built by FinzyPhinzy — for real-life fintech challenges. Want a similar backend? Hit me up 🔥
For inquiries, reach out to [finzyphinzyy@proton.me](mailto:finzyphinzyy@proton.me)


