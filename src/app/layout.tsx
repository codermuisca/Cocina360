import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Cocina360",
  description: "ERP inteligente para restaurantes",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>
        {children}
      </body>
    </html>
  );
}