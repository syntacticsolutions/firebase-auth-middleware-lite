
# Firebase Auth Middleware Lite

A minimal and framework-agnostic Firebase ID token verification middleware for Node.js. Works with Express, but does not depend on it.

---

## ✨ Features

- 🔐 Verifies Firebase ID tokens
- 💥 Uses `res.writeHead` + `res.end` (no Express dependency)
- 🧠 Attaches `claims` and `token` to `res.locals` for downstream usage
- 🧩 Plug-and-play with Express, Bun, Node HTTP, etc.

---

## 📦 Installation

```bash
npm install firebase-auth-middleware-lite
```

> Make sure you also install `firebase-admin` and `@google-cloud/firestore` (required by Firebase types):

```bash
npm install firebase-admin @google-cloud/firestore
```

---

## 🧪 Usage

### 1. Initialize Firebase

```ts
import { initFirebase } from "firebase-auth-middleware-lite";
import serviceAccount from "./firebase-key.json";

initFirebase(serviceAccount);
```

### 2. Use the middleware

```ts
import express from "express";
import { authMiddleware } from "firebase-auth-middleware-lite";

const app = express();

app.use(authMiddleware());

app.get("/protected", (req, res) => {
  res.json({ uid: res.locals.claims.uid });
});
```

---

## 🔍 Advanced Usage

You can pass a callback to the middleware if you want to run custom logic when a user is verified:

```ts
app.use(
  authMiddleware(async ({ claims, ctx, token, res }) => {
    console.log("Authenticated user:", claims.uid);
    
    // get user information like permissions or roles for authorization
    
    ctx.user = getUserFromDB();

    if (!user) res.status(403).json({ error: "Forbidden" })
  })
);
```

---

## 🔄 Token Expiration Handling

If a token is expired, the middleware will. You will have to refresh the token using the frontend SDK:

- Set the HTTP header `x-firebase-token-refresh: true`
- Return a `401 Unauthorized` response

---

## 📚 Types

```ts
type AuthContext = {
  claims: DecodedIdToken;
  token: string;
};

type AuthCBParams = {
  claims: DecodedIdToken;
  ctx: Record<string, any>;
  token: string;
};
```

---

## 🛡 License

MIT — use it, hack it, improve it.
