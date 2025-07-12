import firebaseAdmin, { ServiceAccount } from "firebase-admin";
import { DecodedIdToken } from "firebase-admin/auth";

// INIT
export const initFirebase = (key: ServiceAccount) => {
  if (!firebaseAdmin.apps.length) {
    firebaseAdmin.initializeApp({
      credential: firebaseAdmin.credential.cert(key),
    });
  }
};

export interface AuthCBParams<T extends Record<string, any>> {
  claims: DecodedIdToken;
  ctx: Record<string, any>;
  token: string;
  res: T;
}

type StopObject = {
  status: number;
  message: string;
};

export const authMiddleware =
  (cb: (params: AuthCBParams<any>) => void | Promise<StopObject> = () => {}) =>
  async (req: any, res: any, next: () => void) => {
    const authHeader = req.headers["authorization"] || "";
    const token = authHeader.split(" ")[1];

    if (!token) {
      res.writeHead(403, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Unauthorized" }));
      return;
    }

    try {
      const claims = await firebaseAdmin.auth().verifyIdToken(token);

      if (!claims) {
        res.writeHead(403, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Unauthorized" }));
        return;
      }

      const shouldReturn = await cb({
        claims,
        ctx: res.locals ?? {},
        token,
        res,
      });

      if (shouldReturn) {
        return;
      }

      res.locals = res.locals || {};
      res.locals.claims = claims;
      res.locals.token = token;

      next();
    } catch (error: any) {
      if (error.code === "auth/id-token-expired") {
        res.writeHead(401, {
          "Content-Type": "application/json",
          "x-firebase-token-refresh": "true",
        });
        res.end(
          JSON.stringify({ error: "Token expired. Please refresh your token." })
        );
        return;
      }

      res.writeHead(403, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Unauthorized" }));
    }
  };
