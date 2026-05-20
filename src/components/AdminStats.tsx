"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

type Payment = {
  id: number;
  table_id: number;
  waiter_name: string;
  cashier_name: string | null;
  amount: number;
  created_at: string;
};

type Period = "day" | "week" | "month" | "year" | "all";

export default function AdminStats() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [period, setPeriod] = useState<Period>("day");

  useEffect(() => {
    fetchPayments();
  }, [period]);

  const getStartDate = () => {
    const now = new Date();
    const start = new Date(now);

    if (period === "day") {
      start.setHours(0, 0, 0, 0);
      return start.toISOString();
    }

    if (period === "week") {
      const day = start.getDay();
      const diff = day === 0 ? 6 : day - 1;
      start.setDate(start.getDate() - diff);
      start.setHours(0, 0, 0, 0);
      return start.toISOString();
    }

    if (period === "month") {
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
      return start.toISOString();
    }

    if (period === "year") {
  start.setMonth(0);
  start.setDate(1);
  start.setHours(0, 0, 0, 0);
  return start.toISOString();
}

    return null;
  };

  const fetchPayments = async () => {
    const startDate = getStartDate();

    let query = supabase
      .from("payments")
      .select("*")
      .order("created_at", { ascending: false });

    if (startDate) {
      query = query.gte("created_at", startDate);
    }

    const { data, error } = await query;

    if (error) {
      console.error(error);
      return;
    }

    setPayments(data ?? []);
  };

  const totalSales = payments.reduce((acc, p) => acc + p.amount, 0);
  const totalTables = payments.length;

  const waiterStats = payments.reduce((acc, payment) => {
    const waiter = payment.waiter_name || "Sin mesero";

    if (!acc[waiter]) {
      acc[waiter] = {
        tables: 0,
        sales: 0,
      };
    }

    acc[waiter].tables += 1;
    acc[waiter].sales += payment.amount;

    return acc;
  }, {} as Record<string, { tables: number; sales: number }>);

  const cashierStats = payments.reduce((acc, payment) => {
    const cashier = payment.cashier_name || "Sin cajero";

    if (!acc[cashier]) {
      acc[cashier] = 0;
    }

    acc[cashier] += payment.amount;

    return acc;
  }, {} as Record<string, number>);

  return (
    <section className="mt-10">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <h3 className="text-2xl font-bold">Estadísticas</h3>

        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value as Period)}
          className="p-3 rounded-xl border border-zinc-300 bg-white"
        >
          <option value="day">Hoy</option>
          <option value="week">Esta semana</option>
          <option value="month">Este mes</option>
          <option value="year">Este año</option>
          <option value="all">Todo</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-2xl p-6 border border-zinc-200">
          <p className="text-zinc-500">Ventas del período</p>
          <h4 className="text-4xl font-bold text-green-600">
            ${totalSales.toLocaleString("es-CO")}
          </h4>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-zinc-200">
          <p className="text-zinc-500">Mesas cobradas</p>
          <h4 className="text-4xl font-bold">{totalTables}</h4>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <div className="bg-white rounded-2xl p-6 border border-zinc-200">
          <h4 className="text-xl font-bold mb-4">Rendimiento por mesero</h4>

          {Object.keys(waiterStats).length === 0 ? (
            <p className="text-zinc-500">No hay datos en este período.</p>
          ) : (
            Object.entries(waiterStats).map(([waiter, stats]) => (
              <div key={waiter} className="border-b border-zinc-100 py-3">
                <p className="font-bold">{waiter}</p>
                <p className="text-zinc-500">
                  Mesas: {stats.tables} · Ventas: $
                  {stats.sales.toLocaleString("es-CO")}
                </p>
              </div>
            ))
          )}
        </div>

        <div className="bg-white rounded-2xl p-6 border border-zinc-200">
          <h4 className="text-xl font-bold mb-4">Dinero manejado por cajero</h4>

          {Object.keys(cashierStats).length === 0 ? (
            <p className="text-zinc-500">No hay datos en este período.</p>
          ) : (
            Object.entries(cashierStats).map(([cashier, amount]) => (
              <div key={cashier} className="border-b border-zinc-100 py-3">
                <p className="font-bold">{cashier}</p>
                <p className="text-zinc-500">
                  Total cobrado: ${amount.toLocaleString("es-CO")}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}