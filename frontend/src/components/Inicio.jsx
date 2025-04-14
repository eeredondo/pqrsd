import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FileText, LogIn } from "lucide-react";

function Inicio() {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center px-6 py-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 w-full max-w-5xl">
        
        {/* Módulo 1: Ciudadano */}
        <div
          onMouseEnter={() => setHovered("ciudadano")}
          onMouseLeave={() => setHovered(null)}
          className={`bg-white rounded-3xl shadow-xl border border-blue-100 p-8 transition-all duration-300 cursor-pointer ${
            hovered === "ciudadano" ? "transform scale-105" : "transform scale-100"
          }`}
        >
          <h2 className="text-xl font-bold text-blue-800 mb-4">📩 ¿Deseas radicar una PQRSD?</h2>
          <button
            onClick={() => navigate("/radicar")}
            className="bg-blue-800 text-white px-5 py-2 rounded-full flex items-center gap-2 hover:bg-blue-900 transition"
          >
            <FileText size={18} /> Radicar PQRSD
          </button>
          {hovered === "ciudadano" && (
            <p className="mt-4 text-sm text-gray-600 transition-opacity duration-300 ease-in-out">
              Si eres un ciudadano y deseas presentar una petición, queja, reclamo, sugerencia o denuncia, utiliza este formulario.
            </p>
          )}
        </div>

        {/* Módulo 2: Funcionario */}
        <div
          onMouseEnter={() => setHovered("funcionario")}
          onMouseLeave={() => setHovered(null)}
          className={`bg-white rounded-3xl shadow-xl border border-blue-100 p-8 transition-all duration-300 cursor-pointer ${
            hovered === "funcionario" ? "transform scale-105" : "transform scale-100"
          }`}
        >
          <h2 className="text-xl font-bold text-blue-800 mb-4">🔐 ¿Eres funcionario?</h2>
          <button
            onClick={() => navigate("/login")}
            className="bg-blue-800 text-white px-5 py-2 rounded-full flex items-center gap-2 hover:bg-blue-900 transition"
          >
            <LogIn size={18} /> Ingresar al sistema
          </button>
          {hovered === "funcionario" && (
            <p className="mt-4 text-sm text-gray-600 transition-opacity duration-300 ease-in-out">
              Si haces parte del equipo institucional, ingresa para gestionar las PQRSD que te han sido asignadas.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Inicio;
