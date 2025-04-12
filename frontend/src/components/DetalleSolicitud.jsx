import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

function DetalleSolicitud() {
  const { id } = useParams();
  const token = localStorage.getItem("token");
  const [solicitud, setSolicitud] = useState(null);
  const [responsables, setResponsables] = useState([]);
  const [responsableSeleccionado, setResponsableSeleccionado] = useState("");
  const [diasSeleccionados, setDiasSeleccionados] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    obtenerSolicitud();
    obtenerResponsables();
  }, []);

  const obtenerSolicitud = async () => {
    try {
      const res = await axios.get(`http://127.0.0.1:8000/solicitudes/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSolicitud(res.data);
    } catch (error) {
      console.error("Error al obtener solicitud:", error);
    }
  };

  const obtenerResponsables = async () => {
    try {
      const res = await axios.get("http://127.0.0.1:8000/usuarios/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const soloResponsables = res.data.filter((u) => u.rol === "responsable");
      setResponsables(soloResponsables);
    } catch (error) {
      console.error("Error al obtener responsables:", error);
    }
  };

  const asignar = async () => {
    if (!responsableSeleccionado || !diasSeleccionados) {
      return alert("Selecciona un responsable y un plazo en días hábiles");
    }

    try {
      const formData = new FormData();
      formData.append("termino_dias", diasSeleccionados);

      await axios.post(
        `http://127.0.0.1:8000/solicitudes/${id}/asignar/${responsableSeleccionado}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      alert("✅ Solicitud asignada correctamente");
      navigate("/asignador");
    } catch (error) {
      console.error("Error al asignar:", error);
      alert("❌ Error al asignar solicitud");
    }
  };

  if (!solicitud) return <p className="text-gray-600">Cargando solicitud...</p>;

  return (
    <div className="max-w-5xl mx-auto bg-white p-6 shadow rounded-lg border border-gray-200">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm text-blue-700 hover:underline mb-4"
      >
        <ArrowLeft size={16} />
        Volver atrás
      </button>

      <h2 className="text-2xl font-bold text-blue-800 mb-6">Detalles de la Solicitud</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-700 mb-6">
        <p><strong>Radicado:</strong> <span className="font-mono">{solicitud.radicado}</span></p>
        <p><strong>Estado:</strong> {solicitud.estado}</p>
        <p><strong>Nombre:</strong> {solicitud.nombre} {solicitud.apellido}</p>
        <p><strong>Correo:</strong> {solicitud.correo}</p>
        <p><strong>Teléfono:</strong> {solicitud.celular}</p>
        <p><strong>Dirección:</strong> {solicitud.direccion}</p>
      </div>

      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-800 mb-1">Mensaje del peticionario:</h3>
        <div className="bg-gray-100 border border-gray-300 p-3 rounded text-sm text-gray-800">
          {solicitud.mensaje}
        </div>
      </div>

      {solicitud.archivo && (
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-800 mb-2">Archivo adjunto:</h3>
          <iframe
            src={`http://127.0.0.1:8000/${solicitud.archivo}`}
            title="Archivo PDF"
            width="100%"
            height="1000px"
            className="border border-gray-300 rounded"
          />
        </div>
      )}

      <div className="mt-6">
        <label className="text-sm font-medium block mb-2">Asignar a responsable:</label>
        <select
          className="border rounded w-full px-3 py-2 text-sm mb-4"
          onChange={(e) => setResponsableSeleccionado(e.target.value)}
          defaultValue=""
        >
          <option value="" disabled>Seleccionar responsable</option>
          {responsables.map((r) => (
            <option key={r.id} value={r.id}>{r.nombre}</option>
          ))}
        </select>

        <label className="text-sm font-medium block mb-2">Plazo en días hábiles:</label>
        <input
          type="number"
          className="border rounded w-full px-3 py-2 text-sm mb-4"
          placeholder="Ej: 10"
          onChange={(e) => setDiasSeleccionados(e.target.value)}
        />

        <button
          onClick={asignar}
          className="bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-800 text-sm"
        >
          Asignar solicitud
        </button>
      </div>
    </div>
  );
}

export default DetalleSolicitud;
