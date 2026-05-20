"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { User } from "../types";

type RestaurantTable = {
  id: number;
  number: number;
  status: string;
};

type MenuItem = {
  id: number;
  name: string;
  category: string;
  price: number;
  emoji: string;
};

type Props = {
  user: User;
};

export default function WaiterPanel({ user }: Props) {
  const [tables, setTables] = useState<RestaurantTable[]>([]);
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [selectedTable, setSelectedTable] = useState<RestaurantTable | null>(
    null
  );
  const [cart, setCart] = useState<MenuItem[]>([]);

  useEffect(() => {
    fetchTables();
    fetchMenu();
  }, []);

  const fetchTables = async () => {
    const { data, error } = await supabase
      .from("restaurant_tables")
      .select("*")
      .order("number");

    if (error) {
      console.error("Error loading tables:", error);
      return;
    }

    setTables(data ?? []);
  };

  const fetchMenu = async () => {
    const { data, error } = await supabase
      .from("menu_items")
      .select("*")
      .eq("available", true)
      .order("category");

    if (error) {
      console.error("Error loading menu:", error);
      return;
    }

    setMenu(data ?? []);
  };

  const addToCart = (item: MenuItem) => {
    setCart((prev) => [...prev, item]);
  };

  const removeFromCart = (indexToRemove: number) => {
    setCart((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  const cartTotal = cart.reduce((acc, item) => acc + item.price, 0);
const createOrder = async () => {

  if (!selectedTable || cart.length === 0) return;

  // 1. Crear orden

  const { data: orderData, error: orderError } = await supabase
    .from("orders")
    .insert([
      {
        table_id: selectedTable.id,
        waiter_name: user.name,
        status: "pending",
        total: cartTotal,
      },
    ])
    .select()
    .single();

  if (orderError) {
    console.error("Error creating order:", orderError);
    return;
  }

  // 2. Crear items del pedido

  const items = cart.map((item) => ({
    order_id: orderData.id,
    menu_item_id: item.id,
    name: item.name,
    qty: 1,
    price: item.price,
  }));

  const { error: itemsError } = await supabase
    .from("order_items")
    .insert(items);

  if (itemsError) {
    console.error("Error creating order items:", itemsError);
    return;
  }

  // 3. Actualizar estado mesa

  await supabase
    .from("restaurant_tables")
    .update({
      status: "occupied",
    })
    .eq("id", selectedTable.id);

  // 4. Refrescar

  fetchTables();

  // 5. Limpiar carrito

  setCart([]);

  alert("Pedido enviado a cocina 🍽️");
};
  return (
    <section>
      <h2 className="text-3xl font-bold mb-6">Panel de mesero</h2>

      <div className="mb-10">
        <h3 className="text-xl font-bold mb-4">Seleccionar mesa</h3>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {tables.map((table) => (
            <button
              key={table.id}
              onClick={() => {
                setSelectedTable(table);
                setCart([]);
              }}
              className={`p-6 rounded-2xl border text-left transition ${
                selectedTable?.id === table.id
                  ? "bg-orange-500 text-white border-orange-500"
                  : "bg-white border-zinc-200 hover:border-orange-300"
              }`}
            >
              <h4 className="text-2xl font-bold">Mesa {table.number}</h4>
              <p className="opacity-80">
                {table.status === "available" ? "Disponible" : table.status}
              </p>
            </button>
          ))}
        </div>
      </div>

      {selectedTable && (
        <div>
          <h3 className="text-2xl font-bold mb-6">
            Nuevo pedido · Mesa {selectedTable.number}
          </h3>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {menu.map((item) => (
                <article
                  key={item.id}
                  className="bg-white rounded-2xl p-6 border border-zinc-200 shadow-sm"
                >
                  <div className="text-4xl mb-4">{item.emoji}</div>

                  <h4 className="text-xl font-bold">{item.name}</h4>

                  <p className="text-zinc-500 mb-4">{item.category}</p>

                  <p className="text-2xl font-bold text-orange-600 mb-4">
                    ${item.price.toLocaleString("es-CO")}
                  </p>

                  <button
                    onClick={() => addToCart(item)}
                    className="w-full py-3 rounded-xl bg-orange-500 text-white font-bold hover:bg-orange-600 transition"
                  >
                    Agregar
                  </button>
                </article>
              ))}
            </div>

            <aside className="bg-white rounded-2xl p-6 border border-zinc-200 shadow-sm h-fit">
              <h3 className="text-2xl font-bold mb-4">Pedido actual</h3>

              {cart.length === 0 ? (
                <p className="text-zinc-500">
                  Agrega productos para crear el pedido.
                </p>
              ) : (
                <>
                  <div className="space-y-4">
                    {cart.map((item, index) => (
                      <div
                        key={`${item.id}-${index}`}
                        className="flex justify-between gap-4 border-b border-zinc-100 pb-3"
                      >
                        <div>
                          <p className="font-bold">
                            {item.emoji} {item.name}
                          </p>
                          <p className="text-sm text-zinc-500">
                            ${item.price.toLocaleString("es-CO")}
                          </p>
                        </div>

                        <button
                          onClick={() => removeFromCart(index)}
                          className="text-red-500 font-bold"
                        >
                          Quitar
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 flex justify-between items-center">
                    <h4 className="text-xl font-bold">Total</h4>
                    <p className="text-2xl font-bold text-orange-600">
                      ${cartTotal.toLocaleString("es-CO")}
                    </p>
                  </div>

                  <button
  onClick={createOrder}
  className="mt-6 w-full py-3 rounded-xl bg-zinc-900 text-white font-bold hover:bg-zinc-700 transition"
>
  Enviar a cocina
</button>
                </>
              )}
            </aside>
          </div>
        </div>
      )}
    </section>
  );
}