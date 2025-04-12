import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  LogOut,
  FileText,
  LayoutDashboard,
  FileSearch,
  PencilRuler,
  UserCheck,
  ShieldCheck
} from "lucide-react";

function DashboardLayout({ children }) {
  const usuario = JSON.parse(localStorage.getItem("usuario"));
  const navigate = useNavigate();
  const location = useLocation();

  const cerrarSesion = () => {
    localStorage.removeItem("usuario");
    localStorage.removeItem("token");
    navigate("/login");
  };

  // Menú dinámico según el rol
  const navItems = [];

  if (usuario?.rol === "asignador") {
    navItems.push(
      {
        to: "/asignador",
        label: "Solicitudes por asignar",
        icon: <LayoutDashboard size={18} />,
      },
      {
        to: "/finalizar",
        label: "Finalizar solicitudes",
        icon: <PencilRuler size={18} />,
      }
    );
  }

  if (usuario?.rol === "responsable") {
    navItems.push({
      to: "/responsable",
      label: "Solicitudes asignadas",
      icon: <UserCheck size={18} />,
    });
  }

  if (usuario?.rol === "revisor") {
    navItems.push({
      to: "/revisor",
      label: "Panel Revisor",
      icon: <FileText size={18} />,
    });
  }

  if (usuario?.rol === "firmante") {
    navItems.push({
      to: "/firmante",
      label: "Panel Firmante",
      icon: <FileText size={18} />,
    });
  }

  // ✅ Panel Admin (si el usuario tiene rol admin)
  if (usuario?.rol === "admin") {
    navItems.push({
      to: "/admin",
      label: "Panel Admin",
      icon: <ShieldCheck size={18} />,
    });
  }

  // 🔍 Consultor visible para todos
  navItems.push({
    to: "/consultor",
    label: "Consultor PQRSD",
    icon: <FileSearch size={18} />,
  });

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-blue-900 text-white flex flex-col justify-between">
        <div>
          <div className="px-6 py-5 text-lg font-bold border-b border-blue-800">
            Sistema PQRSD
          </div>
          <nav className="px-4 py-6 flex flex-col gap-3 text-sm font-medium">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-2 px-3 py-2 rounded hover:bg-blue-800 transition ${
                  location.pathname === item.to ? "bg-blue-800" : ""
                }`}
              >
                {item.icon}
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="border-t border-blue-800 px-6 py-4 text-xs text-blue-200">
          <div className="mb-2">
            <span className="block text-[11px] text-gray-300">Sesión activa:</span>
            <span className="font-semibold text-white">{usuario?.nombre}</span>
          </div>
          <button
            onClick={cerrarSesion}
            className="text-red-300 hover:text-red-500 flex items-center gap-2 text-sm"
          >
            <LogOut size={16} /> Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Contenido */}
      <main className="flex-1 p-6 bg-gray-50">
        <div className="bg-white p-4 rounded shadow mb-6 border border-gray-200">
          <h1 className="text-xl font-bold text-blue-800">
            Bienvenido, {usuario?.nombre}
          </h1>
        </div>
        {children}
      </main>
    </div>
  );
}

export default DashboardLayout;
