"use client";

import { User } from "../types";

type Props = {
  onLogin: (user: User) => void;
};

const users: User[] = [
  {
    id: 1,
    name: "Carlos",
    role: "waiter",
  },
  {
    id: 2,
    name: "Diana",
    role: "kitchen",
  },
  {
    id: 3,
    name: "Sofía",
    role: "cashier",
  },
  {
    id: 4,
    name: "Admin",
    role: "admin",
  },
];

export default function Login({ onLogin }: Props) {

  return (
    <main className="min-h-screen bg-zinc-100 flex items-center justify-center p-6">

      <div className="bg-white p-10 rounded-3xl shadow-sm border border-zinc-200 w-full max-w-md">

        <h1 className="text-4xl font-bold mb-2">
          Cocina360 🍽️
        </h1>

        <p className="text-zinc-500 mb-8">
          Selecciona un perfil
        </p>

        <div className="space-y-4">

          {users.map((user) => (

            <button
              key={user.id}
              onClick={() => onLogin(user)}
              className="w-full p-4 rounded-2xl border border-zinc-200 hover:bg-orange-50 hover:border-orange-300 transition text-left"
            >

              <h2 className="font-bold text-lg">
                {user.name}
              </h2>

              <p className="text-zinc-500">
                {user.role}
              </p>

            </button>

          ))}

        </div>

      </div>

    </main>
  );
}