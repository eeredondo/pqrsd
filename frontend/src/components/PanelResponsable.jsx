import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Eye } from "lucide-react";

function PanelResponsable() {
  const navigate = useNavigate();
  const [solicitudes, setSolicitudes] = useState([]);
  const usuario = JSON.parse(localStorage.getItem("usuario"));
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!usuario || usuario.rol !== "responsable") {
      navigate("/");
      return;
    }

    const fetchSolicitudes = async () => {
      try {
        const res = await axios.get(
          `http://127.0.0.1:8000/solicitudes/asignadas/${usuario.id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const visibles = res.data.filter((s) =>
          ["Asignado", "En proceso", "Devuelto"].includes(s.estado)
        );

        setSolicitudes(visibles);
      } catch (err) {
        console.error("Error al obtener solicitudes asignadas:", err);
      }
    };

    fetchSolicitudes();
  }, [usuario, token, navigate]);

  const calcularColorFecha = (fecha) => {
    const hoy = new Date();
    const vencimiento = new Date(fecha);
    const diff = Math.ceil((vencimiento - hoy) / (1000 * 60 * 60 * 24));

    if (diff < 0) return "text-red-600";
    if (diff <= 2) return "text-yellow-500";
    return "text-green-600";
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-blue-800 mb-6">
        📋 Solicitudes Asignadas
      </h2>

      <div className="overflow-x-auto shadow border border-gray-200 rounded-lg">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-blue-800 text-white">
            <tr>
              <th className="px-4 py-3 font-medium">Radicado</th>
              <th className="px-4 py-3 font-medium">Fecha</th>
              <th className="px-4 py-3 font-medium">Vencimiento</th>
              <th className="px-4 py-3 font-medium">Peticionario</th>
              <th className="px-4 py-3 font-medium">Estado</th>
              <th className="px-4 py-3 font-medium text-center">Acción</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {solicitudes.map((s) => (
              <tr
                key={s.id}
                className="hover:bg-blue-50 transition duration-150 ease-in-out"
              >
                <td className="px-4 py-3 font-mono text-blue-800">
                  {s.radicado}
                </td>
                <td className="px-4 py-3">
                  {new Date(s.fecha_creacion).toLocaleDateString("es-CO", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </td>
                <td
                  className={`px-4 py-3 font-semibold ${calcularColorFecha(
                    s.fecha_vencimiento
                  )}`}
                >
                  {s.fecha_vencimiento
                    ? new Date(s.fecha_vencimiento).toLocaleDateString(
                        "es-CO",
                        {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        }
                      )
                    : "Sin fecha"}
                </td>
                <td className="px-4 py-3">
                  {s.nombre} {s.apellido}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`px-2 py-1 rounded text-xs font-semibold ${
                      s.estado === "Devuelto"
                        ? "bg-red-100 text-red-700"
                        : s.estado === "En proceso"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    {s.estado}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <button
                    onClick={() => navigate(`/responsable/solicitud/${s.id}`)}
                    className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded transition"
                  >
                    <Eye size={16} />
                    Ver Detalles
                  </button>
                </td>
              </tr>
            ))}
            {solicitudes.length === 0 && (
              <tr>
                <td colSpan="6" className="text-center p-4 text-gray-500 italic">
                  No tienes solicitudes asignadas.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default PanelResponsable;
