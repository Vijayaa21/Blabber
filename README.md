#  Blabber

Blabber is a modern full-stack social media web application built using the **MERN stack**. It allows users to register, log in, post updates, follow other users, receive notifications, and maintain profiles. It uses **JWT authentication** with secure HttpOnly cookies and Cloudinary for profile image uploads.

---

## 🌐 Live Demo

Hosted on:  
🔗 **Render**: https://blabber-front.onrender.com/


---

## ⭐ Like the Project?

If you find this project useful or interesting, consider **starring** 🌟 the repository to show your support! It motivates me to keep improving and adding more features.  
👉 [Give it a Star on GitHub](https://github.com/vijayaa21/blabber)

---

## 📦 Tech Stack

- **Frontend**: React, React Router DOM, TailwindCSS, React Query, React Hot Toast  
- **Backend**: Node.js, Express.js, MongoDB  
- **Auth**: JWT with HttpOnly Cookies  
- **Image Upload**: Cloudinary  
- **State Management**: React Query  
- **Hosting**: Render  

---

## 🚀 Features

- 🧾 User Authentication (Signup, Login, Logout)
- 🏠 Home Feed
- 🔔 Notifications
- 👥 User Profiles with Follow/Unfollow
- 📸 Profile Image Upload
- 🧠 React Query for Data Fetching
- 🌈 Responsive UI
- 🔐 Secure JWT & Cookie-based Auth

---

## ⚙️ Getting Started Locally

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/blabber.git
cd blabber
```

---

### 2. Install Dependencies

#### Backend

```bash
cd backend
npm install
```

#### Frontend

```bash
cd ../frontend
npm install
```

---

### 3. Create Environment Files

#### ✅ `.env` for Backend (in `/backend`)

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

✅ Make sure your MongoDB database is up and running.

---

### 4. Start the App

#### Option 1: Run Backend and Frontend Separately

```bash
# Start Backend
cd backend
npm run dev
```

```bash
# Start Frontend
cd ../frontend
npm run dev
```

#### Option 2: Use Root-Level Concurrent Script

If your project has a root-level `package.json`, add this:

```json
"scripts": {
  "dev": "concurrently \"npm run server\" \"npm run client\"",
  "server": "cd backend && nodemon server.js",
  "client": "cd frontend && npm run dev"
}
```

Then run:

```bash
npm run dev
```

---

## 🌐 Deployment Notes

### ⚙️ CORS Settings for Production (Backend)

```js
app.use(cors({
  origin: "https://your-frontend-url.onrender.com",
  credentials: true
}));
```

### 🍪 Cookie Settings (for JWT in `generateTokenAndSetCookie.js`)

```js
res.cookie("jwt", token, {
  maxAge: 15 * 24 * 60 * 60 * 1000, // 15 days
  httpOnly: true,
  sameSite: "None",   // ✅ Needed for cross-origin cookies
  secure: true        // ✅ Required for HTTPS (e.g. Render)
});
```

---

## 📁 Project Structure

```
blabber/
├── backend/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   ├── server.js
|
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── App.jsx
│   ├── public/
│   └── .env
├── .env 
└── README.md
```

---

## 👥 Author

Built by [Vijaya Mishra](https://github.com/Vijayaa21) 💻  
Open to contributions, suggestions, and collaboration!

## 📝 License

This project is licensed under the [MIT License](./LICENSE).  
You are free to use, modify, and distribute this software under the terms of the license.
