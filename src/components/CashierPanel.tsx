"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { User } from "../types";

type OrderItem = {
  id: number;
  name: string;
  qty: number;
  price: number;
};

type Order = {
  id: number;
  table_id: number;
  waiter_name: string;
  status: string;
  total: number;
  order_items: OrderItem[];
};

type Props = {
  user: User;
};

export default function CashierPanel({ user }: Props) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [paidAmounts, setPaidAmounts] = useState<Record<number, number>>({});

  useEffect(() => {
    fetchOrders();

    const channel = supabase
      .channel("cashier-orders")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        () => {
          fetchOrders();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchOrders = async () => {
    const { data, error } = await supabase
      .from("orders")
      .select(`
        *,
        order_items (
          id,
          name,
          qty,
          price
        )
      `)
      .neq("status", "paid")
      .order("table_id");

    if (error) {
      console.error(error);
      return;
    }

    setOrders(data ?? []);
  };

  const closeTable = async (tableId: number) => {
  const tableOrders = orders.filter((order) => order.table_id === tableId);

  const paidAmount = paidAmounts[tableId] ?? 0;

  for (const order of tableOrders) {
    const changeAmount = Math.max(paidAmount - order.total, 0);

    const { error: paymentError } = await supabase.from("payments").insert([
      {
        order_id: order.id,
        table_id: order.table_id,
        waiter_name: order.waiter_name,
        amount: order.total,
        paid_amount: paidAmount,
        change_amount: changeAmount,
        payment_method: "cash",
        cashier_name: "Sofía",
      },
    ]);

    if (paymentError) {
      console.error("Error creating payment:", paymentError);
      return;
    }
  }

  await supabase
    .from("orders")
    .update({
      status: "paid",
    })
    .eq("table_id", tableId);

  await supabase
    .from("restaurant_tables")
    .update({
      status: "available",
    })
    .eq("id", tableId);

  setPaidAmounts((prev) => {
    const copy = { ...prev };
    delete copy[tableId];
    return copy;
  });

  fetchOrders();

  alert("Cuenta cerrada 💳");
};

  const groupedTables = orders.reduce((acc, order) => {
    if (!acc[order.table_id]) {
      acc[order.table_id] = [];
    }

    acc[order.table_id].push(order);

    return acc;
  }, {} as Record<number, Order[]>);

  return (
    <section>
      <h2 className="text-3xl font-bold mb-6">Panel de caja</h2>

      {Object.keys(groupedTables).length === 0 ? (
        <div className="bg-white rounded-2xl p-10 border border-zinc-200 text-center">
          <p className="text-zinc-500 text-lg">No hay cuentas pendientes.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedTables).map(([tableId, tableOrders]) => {
            const numericTableId = Number(tableId);

            const tableTotal = tableOrders.reduce(
              (acc, order) => acc + order.total,
              0
            );

            const paidAmount = paidAmounts[numericTableId] ?? 0;
            const change = Math.max(paidAmount - tableTotal, 0);

            return (
              <article
                key={tableId}
                className="bg-white rounded-2xl p-6 border border-zinc-200 shadow-sm"
              >
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-3xl font-bold">Mesa {tableId}</h3>

                    <p className="text-zinc-500">
                      {tableOrders.length} pedido(s)
                    </p>
                  </div>

                  <p className="text-3xl font-bold text-green-600">
                    ${tableTotal.toLocaleString("es-CO")}
                  </p>
                </div>

                <div className="space-y-6">
                  {tableOrders.map((order) => (
                    <div
                      key={order.id}
                      className="border rounded-2xl p-4 border-zinc-100"
                    >
                      <div className="flex justify-between mb-4">
                        <div>
                          <p className="font-bold">Pedido #{order.id}</p>

                          <p className="text-zinc-500 text-sm">
                            Mesero: {order.waiter_name}
                          </p>

                          <p className="text-zinc-500 text-sm">
                            Estado: {order.status}
                          </p>
                        </div>

                        <p className="font-bold">
                          ${order.total.toLocaleString("es-CO")}
                        </p>
                      </div>

                      <div className="space-y-2">
                        {order.order_items.map((item) => (
                          <div
                            key={item.id}
                            className="flex justify-between text-sm"
                          >
                            <span>
                              {item.qty}x {item.name}
                            </span>

                            <span>
                              ${(item.qty * item.price).toLocaleString("es-CO")}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 bg-zinc-50 rounded-2xl p-4 border border-zinc-200">
                  <label className="block text-sm font-bold mb-2">
                    Pago recibido
                  </label>

                  <input
                    type="number"
                    value={paidAmounts[numericTableId] ?? ""}
                    onChange={(e) =>
                      setPaidAmounts({
                        ...paidAmounts,
                        [numericTableId]: Number(e.target.value),
                      })
                    }
                    placeholder="Ej: 50000"
                    className="w-full p-3 rounded-xl border border-zinc-300 mb-4"
                  />

                  <div className="flex justify-between items-center">
                    <span className="font-bold">Cambio</span>

                    <span className="text-2xl font-bold text-green-600">
                      ${change.toLocaleString("es-CO")}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => closeTable(numericTableId)}
                  className="mt-4 w-full py-4 rounded-2xl bg-green-600 text-white font-bold hover:bg-green-700 transition"
                >
                  Cerrar cuenta
                </button>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}