import React, { useEffect, useState } from "react";
import axios from "axios";
import ResumenCards from "./ResumenCards";
import { useNavigate } from "react-router-dom";
import socket from "../socket";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Bell } from "lucide-react";

function PanelAsignador() {
  const [solicitudes, setSolicitudes] = useState([]);
  const [nuevaNotificacion, setNuevaNotificacion] = useState(null);
  const [notificaciones, setNotificaciones] = useState([]);
  const [mostrarPanel, setMostrarPanel] = useState(false);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) return;

    fetchSolicitudes();
    socket.connect();

    socket.on("connect", () => {
      console.log("✅ WebSocket conectado");
    });

    socket.on("nueva_solicitud", (data) => {
      toast.info(`📬 Nueva solicitud: ${data.radicado}`);
      setNuevaNotificacion(data);
      setNotificaciones((prev) => [data, ...prev]);
      fetchSolicitudes();
      setTimeout(() => setNuevaNotificacion(null), 8000);
    });

    return () => {
      socket.off("nueva_solicitud");
      socket.disconnect();
    };
  }, [token]);

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

  const formatearFecha = (fechaISO) => {
    if (!fechaISO) return "–";
    const fecha = new Date(fechaISO);
    return fecha.toLocaleDateString("es-CO", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  return (
    <div className="relative">
      <ResumenCards />

      {/* Tarjeta emergente (sin click) */}
      {nuevaNotificacion && (
        <div className="fixed bottom-4 right-4 bg-blue-600 text-white p-4 rounded-xl shadow-lg w-96 z-50 animate-bounce pointer-events-none">
          <h4 className="font-bold text-lg mb-1">📬 Nueva solicitud recibida</h4>
          <p><strong>Radicado:</strong> {nuevaNotificacion.radicado}</p>
          <p><strong>Peticionario:</strong> {nuevaNotificacion.nombre} {nuevaNotificacion.apellido}</p>
          <p className="text-sm mt-2 opacity-80">Ve a detalles para ver más información</p>
        </div>
      )}

      {/* Campana de notificaciones */}
      <div className="absolute top-0 right-0 mt-4 mr-6 z-40">
        <button onClick={() => setMostrarPanel(!mostrarPanel)} className="relative">
          <Bell className="text-blue-700 w-6 h-6" />
          {notificaciones.length > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs px-2 py-0.5 rounded-full">
              {notificaciones.length}
            </span>
          )}
        </button>

        {mostrarPanel && (
          <div className="absolute right-0 mt-2 w-80 bg-white shadow-xl border rounded-lg z-50 max-h-96 overflow-y-auto">
            <div className="p-3 border-b font-bold text-blue-800">Notificaciones</div>
            {notificaciones.length === 0 ? (
              <div className="p-3 text-gray-500 text-sm">No hay notificaciones.</div>
            ) : (
              <ul className="divide-y">
                {notificaciones.map((n, idx) => (
                  <li key={idx} className="p-3">
                    <p className="text-sm text-blue-800 font-semibold">{n.radicado}</p>
                    <p className="text-xs text-gray-600">{n.nombre} {n.apellido}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      <h2 className="text-xl font-bold text-gray-800 mb-4 mt-10">Solicitudes sin asignar</h2>

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
                <th className="px-4 py-2">Fecha radicación</th>
                <th className="px-4 py-2">Fecha vencimiento</th>
                <th className="px-4 py-2">Acción</th>
              </tr>
            </thead>
            <tbody>
              {solicitudes.map((s) => (
                <tr key={s.id} className="border-t hover:bg-blue-50">
                  <td className="px-4 py-2 font-mono">{s.radicado}</td>
                  <td className="px-4 py-2">{s.nombre} {s.apellido}</td>
                  <td className="px-4 py-2">{s.correo}</td>
                  <td className="px-4 py-2">{formatearFecha(s.fecha_creacion)}</td>
                  <td className="px-4 py-2">{formatearFecha(s.fecha_vencimiento)}</td>
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
