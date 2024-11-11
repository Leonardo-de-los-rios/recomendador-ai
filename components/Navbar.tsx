"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();

  const navItems = [
    { label: "Recomendador", path: "/" },
    { label: "Gemini", path: "/gemini" },
    { label: "MercadoLibre", path: "/mercadolibre" },
  ];

  return (
    <nav className="bg-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-start h-16">
          {navItems.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              className={`px-5 py-2 rounded-md text-sm font-medium mx-2 transition-colors
                ${
                  pathname === item.path
                    ? "bg-blue-500 text-white"
                    : "text-gray-700 hover:bg-blue-100"
                }`}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
