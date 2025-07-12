import { ServiceAccount } from "firebase-admin";
import { DecodedIdToken } from "firebase-admin/auth";
export declare const initFirebase: (key: ServiceAccount) => void;
type AuthCBParams = {
    claims: DecodedIdToken;
    ctx: Record<string, any>;
    token: string;
};
export declare const authMiddleware: (cb?: (params: AuthCBParams) => void | Promise<void>) => (req: any, res: any, next: () => void) => Promise<void>;
export {};
