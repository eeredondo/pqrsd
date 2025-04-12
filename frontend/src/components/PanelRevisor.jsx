import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Eye, FileText } from "lucide-react";

function PanelRevisor() {
  const [solicitudes, setSolicitudes] = useState([]);
  const token = localStorage.getItem("token");
  const usuario = JSON.parse(localStorage.getItem("usuario"));
  const navigate = useNavigate();

  useEffect(() => {
    if (!usuario || usuario.rol !== "revisor") {
      navigate("/");
      return;
    }

    const fetchSolicitudes = async () => {
      try {
        const res = await axios.get("http://127.0.0.1:8000/solicitudes/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const enRevision = res.data.filter((s) => s.estado === "En revisión");
        setSolicitudes(enRevision);
      } catch (err) {
        console.error("Error al obtener solicitudes:", err);
      }
    };

    fetchSolicitudes();
  }, [token, navigate, usuario]);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-blue-800 mb-6 flex items-center gap-2">
        <FileText className="text-blue-600" />
        Solicitudes en Revisión
      </h2>

      <div className="overflow-x-auto shadow border border-gray-200 rounded-lg">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-blue-800 text-white">
            <tr>
              <th className="px-4 py-3 text-left font-medium">Radicado</th>
              <th className="px-4 py-3 text-left font-medium">Fecha</th>
              <th className="px-4 py-3 text-left font-medium">Peticionario</th>
              <th className="px-4 py-3 text-left font-medium">Estado</th>
              <th className="px-4 py-3 text-center font-medium">Acción</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {solicitudes.map((s) => (
              <tr key={s.id} className="hover:bg-blue-50 transition">
                <td className="px-4 py-3 font-mono text-blue-800">{s.radicado}</td>
                <td className="px-4 py-3">
                  {new Date(s.fecha_creacion).toLocaleDateString("es-CO", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </td>
                <td className="px-4 py-3">{s.nombre} {s.apellido}</td>
                <td className="px-4 py-3 text-gray-700">{s.estado}</td>
                <td className="px-4 py-3 text-center">
                  <button
                    onClick={() => navigate(`/revisor/solicitud/${s.id}`)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded inline-flex items-center gap-1"
                  >
                    <Eye size={16} /> Ver Detalles
                  </button>
                </td>
              </tr>
            ))}
            {solicitudes.length === 0 && (
              <tr>
                <td colSpan="5" className="text-center p-4 text-gray-500 italic">
                  No hay solicitudes en revisión actualmente.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default PanelRevisor;
