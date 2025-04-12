import React, { useEffect, useState } from "react";
import axios from "axios";
import ResumenCards from "./ResumenCards";
import { useNavigate } from "react-router-dom";

function PanelAsignador() {
  const [solicitudes, setSolicitudes] = useState([]);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    fetchSolicitudes();
  }, []);

  const fetchSolicitudes = async () => {
    try {
      const res = await axios.get("http://127.0.0.1:8000/solicitudes/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const pendientes = res.data.filter((s) => s.estado === "Pendiente");
      setSolicitudes(pendientes);
    } catch (err) {
      console.error("Error al obtener solicitudes:", err);
    }
  };

  return (
    <div>
      <ResumenCards />

      <h2 className="text-xl font-bold text-gray-800 mb-4">Solicitudes sin asignar</h2>

      {solicitudes.length === 0 ? (
        <p className="text-gray-600 text-sm">No hay solicitudes pendientes por asignar.</p>
      ) : (
        <div className="overflow-x-auto shadow border border-gray-200 rounded-lg">
          <table className="min-w-full bg-white text-sm">
            <thead className="bg-blue-800 text-white text-left">
              <tr>
                <th className="px-4 py-2">Radicado</th>
                <th className="px-4 py-2">Peticionario</th>
                <th className="px-4 py-2">Correo</th>
                <th className="px-4 py-2">Acción</th>
              </tr>
            </thead>
            <tbody>
              {solicitudes.map((s) => (
                <tr key={s.id} className="border-t hover:bg-blue-50">
                  <td className="px-4 py-2 font-mono">{s.radicado}</td>
                  <td className="px-4 py-2">{s.nombre} {s.apellido}</td>
                  <td className="px-4 py-2">{s.correo}</td>
                  <td className="px-4 py-2">
                    <button
                      onClick={() => navigate(`/solicitud/${s.id}`)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
                    >
                      Ver detalles
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default PanelAsignador;
