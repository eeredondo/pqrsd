import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Eye, FileText, Hourglass, ClipboardCheck, CalendarClock } from "lucide-react";

function PanelRevisor() {
  const [solicitudes, setSolicitudes] = useState([]);
  const [paginaActual, setPaginaActual] = useState(1);
  const solicitudesPorPagina = 10;

  const token = localStorage.getItem("token");
  const usuario = JSON.parse(localStorage.getItem("usuario"));
  const navigate = useNavigate();

  useEffect(() => {
    if (!usuario || usuario.rol !== "revisor") {
      navigate("/");
      return;
    }

    fetchSolicitudes();
  }, [token, navigate, usuario]);

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

  const totalPaginas = Math.ceil(solicitudes.length / solicitudesPorPagina);
  const inicio = (paginaActual - 1) * solicitudesPorPagina;
  const solicitudesPaginadas = solicitudes.slice(inicio, inicio + solicitudesPorPagina);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-blue-800 mb-6 flex items-center gap-2">
        <FileText className="text-blue-600" />
        Solicitudes en Revisión
      </h2>

      {/* Tarjetas resumen */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white border shadow rounded-lg p-4 flex items-center gap-4">
          <div className="bg-blue-100 p-2 rounded-full">
            <ClipboardCheck className="text-blue-700" size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500">Total en revisión</p>
            <p className="text-xl font-bold text-blue-800">{solicitudes.length}</p>
          </div>
        </div>

        <div className="bg-white border shadow rounded-lg p-4 flex items-center gap-4">
          <div className="bg-yellow-100 p-2 rounded-full">
            <Hourglass className="text-yellow-700" size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500">En revisión hoy</p>
            <p className="text-xl font-bold text-yellow-700">
              {
                solicitudes.filter(
                  (s) => new Date(s.fecha_creacion).toDateString() === new Date().toDateString()
                ).length
              }
            </p>
          </div>
        </div>

        <div className="bg-white border shadow rounded-lg p-4 flex items-center gap-4">
          <div className="bg-gray-200 p-2 rounded-full">
            <CalendarClock className="text-gray-600" size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500">Sin fecha límite</p>
            <p className="text-xl font-bold text-gray-800">
              {solicitudes.filter((s) => !s.fecha_vencimiento).length}
            </p>
          </div>
        </div>
      </div>

      {/* Tabla */}
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
            {solicitudesPaginadas.map((s) => (
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

      {/* Paginación */}
      {totalPaginas > 1 && (
        <div className="flex justify-center mt-4 gap-2">
          {Array.from({ length: totalPaginas }, (_, i) => (
            <button
              key={i}
              onClick={() => setPaginaActual(i + 1)}
              className={`px-3 py-1 rounded ${
                paginaActual === i + 1
                  ? "bg-blue-700 text-white"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-700"
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default PanelRevisor;
