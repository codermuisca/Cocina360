"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

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
  created_at: string;
  order_items: OrderItem[];
};

const statusLabels: Record<string, string> = {
  pending: "Pendiente",
  preparing: "Preparando",
  ready: "Listo",
};

export default function KitchenPanel() {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    fetchOrders();

    const channel = supabase
      .channel("kitchen-orders")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        () => {
          fetchOrders();
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "order_items" },
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
      .in("status", ["pending", "preparing", "ready"])
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error loading orders:", error);
      return;
    }

    setOrders(data ?? []);
  };

  const updateOrderStatus = async (orderId: number, status: string) => {
    const { error } = await supabase
      .from("orders")
      .update({ status })
      .eq("id", orderId);

    if (error) {
      console.error("Error updating order:", error);
      return;
    }

    fetchOrders();
  };

  return (
    <section>
      <h2 className="text-3xl font-bold mb-6">Panel de cocina</h2>

      {orders.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 border border-zinc-200 text-center">
          <p className="text-zinc-500 text-lg">No hay pedidos pendientes.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {orders.map((order) => (
            <article
              key={order.id}
              className="bg-white rounded-2xl p-6 border border-zinc-200 shadow-sm"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-2xl font-bold">Pedido #{order.id}</h3>
                  <p className="text-zinc-500">Mesa ID: {order.table_id}</p>
                  <p className="text-zinc-500">Mesero: {order.waiter_name}</p>
                </div>

                <span className="px-3 py-1 rounded-full bg-orange-100 text-orange-700 text-sm font-bold">
                  {statusLabels[order.status] ?? order.status}
                </span>
              </div>

              <div className="space-y-3 mb-6">
                {order.order_items.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between border-b border-zinc-100 pb-2"
                  >
                    <span className="font-medium">
                      {item.qty}x {item.name}
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                {order.status === "pending" && (
                  <button
                    onClick={() => updateOrderStatus(order.id, "preparing")}
                    className="flex-1 py-3 rounded-xl bg-blue-600 text-white font-bold"
                  >
                    Preparar
                  </button>
                )}

                {order.status === "preparing" && (
                  <button
                    onClick={() => updateOrderStatus(order.id, "ready")}
                    className="flex-1 py-3 rounded-xl bg-green-600 text-white font-bold"
                  >
                    Marcar listo
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}