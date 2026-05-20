"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import AdminStats from "./AdminStats";

type MenuItem = {
  id: number;
  name: string;
  category: string;
  price: number;
  emoji: string;
  available: boolean;
};

type AppUser = {
  id: number;
  name: string;
  role: string;
  active: boolean;
};

export default function AdminPanel() {
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [users, setUsers] = useState<AppUser[]>([]);

  const [productName, setProductName] = useState("");
  const [productCategory, setProductCategory] = useState("Platos Fuertes");
  const [productPrice, setProductPrice] = useState("");
  const [productEmoji, setProductEmoji] = useState("🍽️");

  const [userName, setUserName] = useState("");
  const [userRole, setUserRole] = useState("waiter");

  useEffect(() => {
    fetchMenu();
    fetchUsers();
  }, []);

  const fetchMenu = async () => {
    const { data, error } = await supabase
      .from("menu_items")
      .select("*")
      .order("name");

    if (error) {
      console.error(error);
      return;
    }

    setMenu(data ?? []);
  };

  const fetchUsers = async () => {
    const { data, error } = await supabase
      .from("app_users")
      .select("*")
      .order("name");

    if (error) {
      console.error(error);
      return;
    }

    setUsers(data ?? []);
  };

  const createProduct = async () => {
    if (!productName || !productPrice) return;

    const { error } = await supabase.from("menu_items").insert([
      {
        name: productName,
        category: productCategory,
        price: Number(productPrice),
        emoji: productEmoji,
        available: true,
      },
    ]);

    if (error) {
      console.error(error);
      return;
    }

    setProductName("");
    setProductPrice("");
    setProductEmoji("🍽️");
    setProductCategory("Platos Fuertes");

    fetchMenu();
  };

  const toggleProduct = async (item: MenuItem) => {
    const { error } = await supabase
      .from("menu_items")
      .update({
        available: !item.available,
      })
      .eq("id", item.id);

    if (error) {
      console.error(error);
      return;
    }

    fetchMenu();
  };

  const deleteProduct = async (productId: number) => {
  const confirmDelete = confirm("¿Seguro que quieres eliminar este producto?");

  if (!confirmDelete) return;

  const { error } = await supabase
    .from("menu_items")
    .delete()
    .eq("id", productId);

  if (error) {
    console.error(error);
    return;
  }

  fetchMenu();
};

  const createUser = async () => {
    if (!userName) return;

    const { error } = await supabase.from("app_users").insert([
      {
        name: userName,
        role: userRole,
        active: true,
      },
    ]);

    if (error) {
      console.error(error);
      return;
    }

    setUserName("");
    setUserRole("waiter");

    fetchUsers();
  };

  const toggleUser = async (user: AppUser) => {
    const { error } = await supabase
      .from("app_users")
      .update({
        active: !user.active,
      })
      .eq("id", user.id);

    if (error) {
      console.error(error);
      return;
    }

    fetchUsers();
  };

  const deleteUser = async (userId: number) => {
  const confirmDelete = confirm("¿Seguro que quieres eliminar este usuario?");

  if (!confirmDelete) return;

  const { error } = await supabase
    .from("app_users")
    .delete()
    .eq("id", userId);

  if (error) {
    console.error(error);
    return;
  }

  fetchUsers();
};

  return (
    <section>
      <h2 className="text-3xl font-bold mb-6">Panel de administrador</h2>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <div className="bg-white rounded-2xl p-6 border border-zinc-200 shadow-sm">
          <h3 className="text-2xl font-bold mb-4">Crear producto</h3>

          <div className="grid gap-4">
            <input
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder="Nombre del producto"
              className="p-3 rounded-xl border border-zinc-300"
            />

            <select
              value={productCategory}
              onChange={(e) => setProductCategory(e.target.value)}
              className="p-3 rounded-xl border border-zinc-300"
            >
              <option>Entradas</option>
              <option>Platos Fuertes</option>
              <option>Sopas</option>
              <option>Bebidas</option>
              <option>Postres</option>
            </select>

            <input
              type="number"
              value={productPrice}
              onChange={(e) => setProductPrice(e.target.value)}
              placeholder="Precio"
              className="p-3 rounded-xl border border-zinc-300"
            />

            <input
              value={productEmoji}
              onChange={(e) => setProductEmoji(e.target.value)}
              placeholder="Emoji"
              className="p-3 rounded-xl border border-zinc-300"
            />

            <button
              onClick={createProduct}
              className="py-3 rounded-xl bg-orange-500 text-white font-bold hover:bg-orange-600"
            >
              Crear producto
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-zinc-200 shadow-sm">
          <h3 className="text-2xl font-bold mb-4">Crear usuario</h3>

          <div className="grid gap-4">
            <input
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="Nombre del usuario"
              className="p-3 rounded-xl border border-zinc-300"
            />

            <select
              value={userRole}
              onChange={(e) => setUserRole(e.target.value)}
              className="p-3 rounded-xl border border-zinc-300"
            >
              <option value="waiter">Mesero</option>
              <option value="kitchen">Cocina</option>
              <option value="cashier">Caja</option>
              <option value="admin">Administrador</option>
            </select>

            <button
              onClick={createUser}
              className="py-3 rounded-xl bg-zinc-900 text-white font-bold hover:bg-zinc-700"
            >
              Crear usuario
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mt-8">
        <div className="bg-white rounded-2xl p-6 border border-zinc-200 shadow-sm">
          <h3 className="text-2xl font-bold mb-4">Productos</h3>

          <div className="space-y-3">
            {menu.map((item) => (
              <div
                key={item.id}
                className="flex justify-between items-center border-b border-zinc-100 pb-3"
              >
                <div>
                  <p className="font-bold">
                    {item.emoji} {item.name}
                  </p>
                  <p className="text-sm text-zinc-500">
                    {item.category} · ${item.price.toLocaleString("es-CO")}
                  </p>
                </div>

                <div className="flex gap-2">
  <button
    onClick={() => toggleProduct(item)}
    className={`px-4 py-2 rounded-xl font-bold ${
      item.available
        ? "bg-red-100 text-red-700"
        : "bg-green-100 text-green-700"
    }`}
  >
    {item.available ? "Desactivar" : "Activar"}
  </button>

  <button
    onClick={() => deleteProduct(item.id)}
    className="px-4 py-2 rounded-xl font-bold bg-zinc-900 text-white"
  >
    Eliminar
  </button>
</div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-zinc-200 shadow-sm">
          <h3 className="text-2xl font-bold mb-4">Usuarios</h3>

          <div className="space-y-3">
            {users.map((user) => (
              <div
                key={user.id}
                className="flex justify-between items-center border-b border-zinc-100 pb-3"
              >
                <div>
                  <p className="font-bold">{user.name}</p>
                  <p className="text-sm text-zinc-500">{user.role}</p>
                </div>

                <div className="flex gap-2">
  <button
    onClick={() => toggleUser(user)}
    className={`px-4 py-2 rounded-xl font-bold ${
      user.active
        ? "bg-red-100 text-red-700"
        : "bg-green-100 text-green-700"
    }`}
  >
    {user.active ? "Desactivar" : "Activar"}
  </button>

  <button
    onClick={() => deleteUser(user.id)}
    className="px-4 py-2 rounded-xl font-bold bg-zinc-900 text-white"
  >
    Eliminar
  </button>
</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <AdminStats />
    </section>
  );
}