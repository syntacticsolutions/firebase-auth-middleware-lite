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
const withDatabaseUser = async ({ claims, ctx, token, res }) => {
  console.log("Authenticated user id:", claims.uid);

  // get user information like permissions or roles for authorization
  const user = await getUserFromDB(claims.uid);

  ctx.user = user // attach user to locals


  // return something to stop the flow
  if (!user) return res.status(403).json({ error: "Forbidden" });

  // if nothing is returned, middleware will add claims and token
  // to res.locals and continue;
};

app.use(authMiddleware(withDatabaseUser));
```

---

## 🔄 Token Expiration Handling

If a token is expired, the middleware will return an error.
You will have to refresh the token using the frontend firebase SDK:

- Set the HTTP header `x-firebase-token-refresh: true`
- Return a `401 Unauthorized` response

---

## 📚 Types

```ts
type AuthContext = { // not exported
  claims: DecodedIdToken; // from firebase-admin
  token: string;
};

type AuthCBParams = {
  claims: DecodedIdToken; // from firebase-admin
  ctx: Record<string, any>;
  token: string;
  res: Response;
};
```

---

## 🛡 License

MIT — use it, hack it, improve it.
