import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { ArrowLeft, FileDown } from "lucide-react";

function DetalleFinalizador() {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [solicitud, setSolicitud] = useState(null);
  const [archivo, setArchivo] = useState(null);

  useEffect(() => {
    const fetchSolicitud = async () => {
      try {
        const res = await axios.get(`http://127.0.0.1:8000/solicitudes/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSolicitud(res.data);
      } catch (err) {
        console.error("Error al cargar la solicitud:", err);
      }
    };

    fetchSolicitud();
  }, [id, token]);

  const finalizarSolicitud = async () => {
    if (!archivo) {
      alert("⚠️ Debes subir el archivo de notificación para finalizar");
      return;
    }

    const formData = new FormData();
    formData.append("archivo", archivo);

    try {
      await axios.post(
        `http://127.0.0.1:8000/solicitudes/${id}/finalizar`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      alert("✅ Solicitud finalizada y enviada al ciudadano");
      navigate("/finalizar");
    } catch (err) {
      console.error("Error al finalizar solicitud:", err);
      alert("❌ Hubo un error al finalizar");
    }
  };

  if (!solicitud) return <div className="p-6">Cargando detalles...</div>;

  return (
    <div className="p-6">
      <button
        onClick={() => navigate("/finalizar")}
        className="mb-4 inline-flex items-center text-blue-600 hover:text-blue-800 font-semibold"
      >
        <ArrowLeft className="mr-1" size={18} /> Volver
      </button>

      <h2 className="text-2xl font-bold text-blue-800 mb-6">
        Finalizar solicitud: {solicitud.radicado}
      </h2>

      <div className="bg-white p-6 rounded-xl shadow border space-y-6 max-w-4xl">
        <div>
          <p className="text-gray-700">
            <strong>Peticionario:</strong> {solicitud.nombre} {solicitud.apellido}
          </p>
          <p className="text-gray-700">
            <strong>Correo:</strong> {solicitud.correo}
          </p>
        </div>

        <div>
          <p className="text-sm text-gray-600 font-medium">📎 Archivo firmado:</p>
          {solicitud.archivo_respuesta ? (
            <a
              href={`http://127.0.0.1:8000/${solicitud.archivo_respuesta}`}
              target="_blank"
              rel="noreferrer"
              className="text-blue-600 underline inline-flex items-center"
            >
              <FileDown className="mr-2" size={18} /> Descargar archivo firmado
            </a>
          ) : (
            <p className="text-red-500 italic">No hay archivo firmado</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            📤 Adjuntar evidencia de notificación (obligatorio):
          </label>
          <input
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={(e) => setArchivo(e.target.files[0])}
            className="border p-2 rounded w-full"
          />
        </div>

        <div className="text-right">
          <button
            onClick={finalizarSolicitud}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded font-semibold"
          >
            Finalizar solicitud
          </button>
        </div>
      </div>
    </div>
  );
}

export default DetalleFinalizador;
