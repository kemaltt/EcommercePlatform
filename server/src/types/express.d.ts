import { User as DrizzleUser } from "../../../shared/schema";

declare global {
  namespace Express {
    interface User extends DrizzleUser {}
  }
}
