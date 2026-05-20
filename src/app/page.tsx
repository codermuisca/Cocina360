"use client";

import { useEffect, useState } from "react";
import Login from "../components/Login";
import { User } from "../types";
import { supabase } from "../lib/supabase";

type Table = {
  id: number;
  number: number;
  status: string;
};

export default function Home() {

  const [user, setUser] = useState<User | null>(null);
  const [tables, setTables] = useState<Table[]>([]);

  useEffect(() => {

    const fetchTables = async () => {

      const { data, error } = await supabase
        .from("restaurant_tables")
        .select("*")
        .order("number");

      if (error) {
        console.error(error);
      } else {
        setTables(data);
      }
    };

    fetchTables();

  }, []);

  if (!user) {
    return <Login onLogin={setUser} />;
  }

  return (
    <main className="min-h-screen bg-zinc-100 p-10">

      <div className="flex justify-between items-center mb-10">

        <div>
          <h1 className="text-4xl font-bold">
            Cocina360 🍽️
          </h1>

          <p className="text-zinc-500">
            {user.name} · {user.role}
          </p>
        </div>

        <button
          onClick={() => setUser(null)}
          className="px-4 py-2 rounded-xl bg-zinc-900 text-white"
        >
          Salir
        </button>

      </div>

      {/* WAITER */}

      {user.role === "waiter" && (

        <div>

          <h2 className="text-3xl font-bold mb-6">
            Panel Mesero
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">

            {tables.map((table) => (

              <div
                key={table.id}
                className="bg-white rounded-2xl p-8 shadow-sm border border-zinc-200 hover:border-orange-400 hover:bg-orange-50 transition cursor-pointer"
              >

                <h3 className="text-3xl font-bold">
                  Mesa {table.number}
                </h3>

                <p className="text-zinc-500 mt-2">
                  {table.status}
                </p>

              </div>

            ))}

          </div>

        </div>

      )}

      {/* KITCHEN */}

      {user.role === "kitchen" && (
        <h2 className="text-3xl font-bold">
          Panel Cocina
        </h2>
      )}

      {/* CASHIER */}

      {user.role === "cashier" && (
        <h2 className="text-3xl font-bold">
          Panel Caja
        </h2>
      )}

      {/* ADMIN */}

      {user.role === "admin" && (
        <h2 className="text-3xl font-bold">
          Panel Admin
        </h2>
      )}

    </main>
  );
}