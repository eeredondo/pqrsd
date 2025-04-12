import React from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle } from "lucide-react";

function Exito() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-blue-50 text-center p-6">
      <CheckCircle size={64} className="text-green-600 mb-4" />
      <h2 className="text-2xl font-bold text-blue-800 mb-2">¡Tu solicitud fue radicada exitosamente!</h2>
      <p className="text-gray-700 mb-6">Pronto recibirás respuesta por correo electrónico.</p>
      <button
        onClick={() => navigate("/")}
        className="bg-blue-700 hover:bg-blue-800 text-white font-semibold px-6 py-2 rounded shadow"
      >
        Volver al inicio
      </button>
    </div>
  );
}

export default Exito;
