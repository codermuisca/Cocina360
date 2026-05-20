"use client";

import { useEffect, useState } from "react";
import Login from "../components/Login";
import { User } from "../types";
import { supabase } from "../lib/supabase";
import WaiterPanel from "../components/WaiterPanel";
import KitchenPanel from "../components/KitchenPanel";
import CashierPanel from "../components/CashierPanel";
import AdminPanel from "../components/AdminPanel";

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

      {user.role === "waiter" && <WaiterPanel user={user} />}

      {/* KITCHEN */}

      {user.role === "kitchen" && <KitchenPanel />}

      {/* CASHIER */}

      {user.role === "cashier" && <CashierPanel user={user} />}

      {/* ADMIN */}

      {user.role === "admin" && <AdminPanel />}


    </main>
  );
}