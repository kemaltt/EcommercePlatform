import { User as DrizzleUser } from "../../../shared/schema";

export {};

declare global {
  namespace Express {
    interface User extends DrizzleUser {}
  }
}
