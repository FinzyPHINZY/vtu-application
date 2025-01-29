### **Updated Plan for the BOLD DATA backend Development**

---

### **Phase 1: User Management Revamp ✅**

1. **OTP-Based Sign-In**

   - Backend:
     - Build an API endpoint to send OTP to the user's email.
     - Create an endpoint to verify OTP and return a session or authentication token upon success.

2. **Complete Signup**

   - Backend:
     - After OTP verification, provide an API endpoint for completing user signup.
     - Store user details: name, pre-populated email, and phone number.

3. **Session Management**
   - Ensure the user session is persisted for subsequent actions (e.g., token-based authentication).

---

### **Phase 2: Bank Account Integration ✅**

1. **Virtual Account Creation**

   - Automatically create a virtual account for each user upon successful signup using Safe Haven's API.
   - Store the virtual account details (account number, bank name) in the user’s profile.

2. **Depositing Money**

   - Integrate Safe Haven’s API to enable users to deposit funds into their virtual accounts.
   - Use webhooks or polling to confirm deposits and update the user’s balance in real time.

3. **Withdrawing Money**

   - Add functionality to transfer funds from the virtual account to any bank account.
   - Validate user input and ensure sufficient balances before processing transactions.

4. **Frontend Implementation**

   - Provide an interface to:
     - View account balance.
     - Deposit money (with details on how to fund the virtual account).
     - Transfer money (with recipient details and amount).

5. **Backend Security**
   - Enforce strong validations for transactions.
   - Record all transactions (deposits, withdrawals) in the database for auditing and user history.

---

### **Phase 3: Feature Implementation ✅**

#### **1. Airtime Purchase (Priority Feature)**

- **Frontend:**
  - Create a form for selecting the network, entering the phone number, and specifying the amount.
  - Display a confirmation dialog before purchase.
- **Backend:**
  - Deduct the amount from the user’s virtual account.
  - Call Safe Haven's VAS transaction API to process the airtime purchase.
  - Record the transaction in the database.

#### **2. Cable TV Subscription**

- Follow the same pattern as airtime purchase:
  - Create an interface for users to select the provider, account number, and subscription package.
  - Deduct funds and call the respective API.

#### **3. Internet Data Purchase**

- Allow users to select the network, enter a phone number, and choose a data package.
- Integrate the appropriate API for processing the purchase.

#### **4. Electricity Bill Payment**

- Let users input their meter number and select the payment amount.
- Integrate Safe Haven’s API to process the bill payment.

---

### **Phase 4: Notifications ✅**

- Use Nodemailer for notifications on successful transactions, deposits, and withdrawals.
- Send email notifications for transaction receipts.

---

### **Phase 5: Admin Panel**

- Monitor user activity, balances, and transactions.
- Analyze trends (e.g., total airtime purchases or deposits over time).
- Provide tools for debugging and managing user accounts.

---

### **Key Reasons for This Sequence**

1. **User Management Revamp First:** A seamless authentication system is the foundation for all subsequent features.
2. **Bank Account Second:** This feature is crucial for enabling purchases and transactions.
3. **Other Features:** Once the foundation is ready, these features can be built incrementally without dependency issues.

---

### **How to Get a Domain for Your Backend (api.bolddata.com, etc.)**

To get a domain, you need to **buy one** from a domain registrar and **set it up** to point to your DigitalOcean server.

---

### **Step 1: Buy a Domain**

You can purchase a domain from a **domain registrar** like:

- [Namecheap](https://www.namecheap.com) (Recommended, good prices + free WHOIS protection)
- [Google Domains](https://domains.google/) (Now moved to Squarespace)
- [GoDaddy](https://www.godaddy.com/)
- [Cloudflare](https://www.cloudflare.com/) (Cheap and fast DNS management)

#### **How to Choose a Domain**

- If **bolddata.com** is already taken, try alternatives like:
  - `bolddata.app`
  - `bolddata.io`
  - `bolddata.ng` (Nigerian domain)
  - `bolddata.africa`
- Avoid long or complicated names.
- A `.com` is the best choice, but `.app` and `.io` are also common for tech projects.

**💰 Cost?**

- `.com` domains: $10–$15 per year
- `.ng` (Nigeria domains): More expensive ($20–$40)

---

### **Step 2: Get Your Server’s Public IP**

You already have your **DigitalOcean droplet running**. To get its IP:

```sh
curl ifconfig.me
```

or check the DigitalOcean dashboard.

---

### **Step 3: Set Up DNS (Point Domain to Server)**

Once you buy the domain, go to the **DNS settings** of your domain provider (e.g., Namecheap, GoDaddy).

#### **Create an A Record:**

| Type | Name  | Value                                               |
| ---- | ----- | --------------------------------------------------- |
| A    | `@`   | **Your DigitalOcean server IP**                     |
| A    | `api` | **Your DigitalOcean server IP** (for API subdomain) |

This means:

- `bolddata.com` → Points to your backend
- `api.bolddata.com` → Points to your backend API

⏳ **DNS changes take 5–30 minutes to propagate.**

---

### **Step 4: Set Up Nginx on Your Server**

After DNS is set up, log in to your server:

```sh
ssh root@your-server-ip
```

Then configure Nginx:

```sh
sudo nano /etc/nginx/sites-available/bolddata
```

Add this config:

```nginx
server {
    listen 80;
    server_name api.bolddata.com;

    location / {
        proxy_pass http://localhost:7000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

Save and exit (`CTRL + X`, then `Y`, then `ENTER`).

Enable the config:

```sh
sudo ln -s /etc/nginx/sites-available/bolddata /etc/nginx/sites-enabled/
sudo nginx -t  # Test config
sudo systemctl restart nginx  # Restart Nginx
```

---

### **Step 5: Enable HTTPS (SSL with Let’s Encrypt)**

Run:

```sh
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d api.bolddata.com
```

This will **automatically**:

- Get an SSL certificate
- Configure Nginx for HTTPS

Now, your backend is available at:  
**✅ https://api.bolddata.com** 🎉

---

### **Final Checks**

✔ Run `curl -I https://api.bolddata.com` to check if it's working.  
✔ If using a frontend, update the API URL from `http://your-ip:7000` → `https://api.bolddata.com`.  
✔ Set up **automatic SSL renewal**:

```sh
sudo certbot renew --dry-run
```

---

### **That’s it! 🚀**

Let me know if you need help setting up DNS or anything else!
