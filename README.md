# 🎟️ Seat Booking API (Node.js + PostgreSQL)

A simple backend system implementing **authentication + transactional seat booking** using Node.js and PostgreSQL.

---

## 🚀 Features

* 🔐 Authentication with Access & Refresh Tokens
* 🍪 Refresh token stored securely in cookies
* 🪑 Seat booking with **database transactions & row-level locking**
* ⚡ Concurrency-safe booking system
* 🧠 Clean backend architecture

---

## 📂 API Endpoints

### 🔐 Auth Routes (`/api/auth`)

#### ➤ Register User

```
POST /api/auth/register
```

* Register using:

  * `name`
  * `email`
  * `password` (hashed using bcrypt)

---

#### ➤ Login User

```
POST /api/auth/login
```

* Login with:

  * `email`
  * `password`
* Returns:

  * Access Token (short-lived)
  * Refresh Token (stored in cookies)

---

#### ➤ Refresh Access Token

```
POST /api/auth-prefix/refresh
```

* Generates new access token using refresh token
* Used when access token expires

---

## 🪑 Seat Routes

### ➤ Book a Seat (Authenticated)

```
PUT /:id/:name
```

* Requires: Access Token (Authorization header)
* Uses:

  * Database **transaction**
  * `SELECT ... FOR UPDATE` (row locking)
* Prevents:

  * Double booking
  * Race conditions

---

### ➤ Get All Seats (Public)

```
GET /seats
```

* No authentication required
* Returns list of all seats

---

## ⚙️ Environment Variables

Create a `.env` file in root:

```
DB_USER=your_db_username
DB_PASSWORD=your_db_password
DB_NAME=your_db_name
```

---

## 🛠️ Tech Stack

* Node.js
* Express.js
* PostgreSQL
* bcrypt
* JWT (Access + Refresh Tokens)

---

## 🔒 Security Highlights

* Passwords hashed using **bcrypt**
* JWT-based authentication
* Refresh tokens stored in **httpOnly cookies**
* SQL Injection prevention using parameterized queries

---

## 🧠 Concurrency Handling

* Uses **transactions (`BEGIN`, `COMMIT`, `ROLLBACK`)**
* Uses **row-level locking (`FOR UPDATE`)**
* Ensures:

  * No double booking
  * Data consistency under parallel requests

---

## ▶️ Getting Started

```bash
# Install dependencies
npm install

# Run server
npm run dev
```

## 👨‍💻 Author

Built with ❤️ for backend learning & system design practice.
