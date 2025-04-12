import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import dayjs from "dayjs";
import {
  ArrowLeft, FileDown, Mail, User, Phone, MapPin
} from "lucide-react";

function DetalleRevisor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [solicitud, setSolicitud] = useState(null);
  const [trazabilidad, setTrazabilidad] = useState([]);
  const [comentario, setComentario] = useState("");
  const [pestana, setPestana] = useState("pqrsd");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`http://127.0.0.1:8000/solicitudes/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSolicitud(res.data);

        const traz = await axios.get(`http://127.0.0.1:8000/solicitudes/${id}/trazabilidad`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTrazabilidad(traz.data);
      } catch (err) {
        console.error("Error al cargar detalles:", err);
      }
    };

    fetchData();
  }, [id, token]);

  const revisarSolicitud = async (aprobado) => {
    if (!aprobado && comentario.trim() === "") {
      alert("⚠️ Debes escribir un comentario si vas a devolver la solicitud.");
      return;
    }

    try {
      await axios.post(
        `http://127.0.0.1:8000/solicitudes/${id}/revision`,
        { aprobado, comentario },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(`✅ Solicitud ${aprobado ? "aprobada" : "devuelta"} correctamente`);
      navigate("/revisor");
    } catch (error) {
      console.error("Error al revisar:", error);
      alert("❌ Error al procesar la revisión");
    }
  };

  if (!solicitud) return <div className="p-6">Cargando detalles...</div>;

  return (
    <div className="p-6">
      <button onClick={() => navigate("/revisor")} className="mb-4 inline-flex items-center text-blue-600 hover:text-blue-800 font-semibold">
        <ArrowLeft size={18} className="mr-1" /> Volver
      </button>

      <h2 className="text-2xl font-bold text-blue-800 mb-6">Detalle de Solicitud: {solicitud.radicado}</h2>

      <div className="flex gap-4 border-b mb-6">
        {["datos", "pqrsd", "trazabilidad"].map((tab) => (
          <button
            key={tab}
            onClick={() => setPestana(tab)}
            className={`px-4 py-2 font-semibold border-b-4 ${
              pestana === tab
                ? "border-blue-600 text-blue-700"
                : "border-transparent text-gray-500 hover:text-blue-600"
            }`}
          >
            {tab === "datos" && "Datos del Peticionario"}
            {tab === "pqrsd" && "PQRSD"}
            {tab === "trazabilidad" && "Trazabilidad"}
          </button>
        ))}
      </div>

      {pestana === "datos" && (
        <div className="bg-white border rounded-xl p-6 shadow-md space-y-2 max-w-3xl mx-auto">
          <p><User className="inline mr-2 text-gray-500" /> {solicitud.nombre} {solicitud.apellido}</p>
          <p><Mail className="inline mr-2 text-gray-500" /> {solicitud.correo}</p>
          <p><Phone className="inline mr-2 text-gray-500" /> {solicitud.celular}</p>
          <p><MapPin className="inline mr-2 text-gray-500" /> {solicitud.municipio}, {solicitud.departamento}</p>
        </div>
      )}

      {pestana === "pqrsd" && (
        <div className="bg-white border rounded-xl p-6 shadow-md space-y-6 max-w-6xl mx-auto">

          <div>
            <h3 className="text-sm text-gray-600 font-medium">📎 Archivo del ciudadano:</h3>
            {solicitud.archivo ? (
              <iframe
                src={`http://127.0.0.1:8000/${solicitud.archivo}`}
                className="w-full h-[1000px] border rounded"
                title="Petición Ciudadana"
              ></iframe>
            ) : (
              <p className="text-red-500 italic">No hay archivo de petición disponible.</p>
            )}
          </div>

          {solicitud.archivo_respuesta && (
            <div>
              <h3 className="text-sm text-gray-600 font-medium">📥 Descargar archivo Word original:</h3>
              <a
                href={`http://127.0.0.1:8000/${solicitud.archivo_respuesta}`}
                target="_blank"
                rel="noreferrer"
                className="text-blue-600 underline inline-flex items-center"
              >
                <FileDown className="mr-2" size={18} /> Descargar Word
              </a>
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Comentario del Revisor (obligatorio si se va a devolver):
            </label>
            <textarea
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
              rows={4}
              placeholder="Ej: Favor ajustar la redacción..."
              className="w-full p-3 border rounded resize-none text-sm"
            />
          </div>

          <div className="flex gap-4 justify-end">
            <button
              onClick={() => revisarSolicitud(true)}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded font-semibold flex items-center gap-2"
            >
              ✅ Aprobar
            </button>
            <button
              onClick={() => revisarSolicitud(false)}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded font-semibold flex items-center gap-2"
            >
              ❌ Devolver
            </button>
          </div>
        </div>
      )}

      {pestana === "trazabilidad" && (
        <div className="bg-white border rounded-xl p-6 shadow-md max-w-6xl mx-auto">
          <h3 className="text-lg font-bold text-gray-800 mb-4">🕓 Trazabilidad</h3>
          <ol className="relative border-l border-blue-400 ml-4 space-y-8">
            {trazabilidad.length > 0 ? (
              trazabilidad.map((item, index) => (
                <li key={index} className="ml-4">
                  <div className="absolute -left-[0.7rem] w-4 h-4 bg-blue-600 rounded-full border border-white shadow" />
                  <time className="block mb-1 text-sm text-gray-500">
                    {dayjs(item.fecha).format("DD/MM/YYYY HH:mm")}
                  </time>
                  <p className="text-base font-semibold text-blue-700 mb-1">
                    {item.evento}
                  </p>
                  {(item.usuario_remitente || item.usuario_destinatario) && (
                    <p className="text-sm text-gray-600">
                      {item.usuario_remitente && <span><strong>De:</strong> {item.usuario_remitente}</span>}{" "}
                      {item.usuario_destinatario && <span>→ <strong>Para:</strong> {item.usuario_destinatario}</span>}
                    </p>
                  )}
                  {item.mensaje && (
                    <p className="text-gray-700 bg-gray-100 border rounded p-3 whitespace-pre-wrap">
                      {item.mensaje}
                    </p>
                  )}
                </li>
              ))
            ) : (
              <p className="text-gray-500 italic">No hay eventos registrados.</p>
            )}
          </ol>
        </div>
      )}
    </div>
  );
}

export default DetalleRevisor;
