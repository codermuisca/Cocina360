export type Role =
  | "admin"
  | "waiter"
  | "kitchen"
  | "cashier";

export type User = {
  id: number;
  name: string;
  role: Role;
};