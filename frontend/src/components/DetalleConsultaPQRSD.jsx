import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { ArrowLeft, FileDown } from "lucide-react";

function DetalleConsultaPQRSD() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [solicitud, setSolicitud] = useState(null);
  const [trazabilidad, setTrazabilidad] = useState([]);
  const [pestana, setPestana] = useState("pqrsd");
  const token = localStorage.getItem("token");

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
      } catch (error) {
        console.error("Error al obtener la solicitud:", error);
      }
    };

    fetchData();
  }, [id, token]);

  const badgeEstado = (estado) => {
    const colores = {
      Pendiente: "bg-orange-100 text-orange-700",
      Asignado: "bg-blue-100 text-blue-700",
      "En proceso": "bg-purple-100 text-purple-700",
      Firmado: "bg-green-100 text-green-700",
      "Para notificar": "bg-gray-100 text-gray-700",
      Terminado: "bg-gray-300 text-gray-800",
      Respondido: "bg-teal-100 text-teal-700",
      Devuelto: "bg-red-100 text-red-700"
    };
    return colores[estado] || "bg-slate-100 text-slate-700";
  };

  if (!solicitud) return <div className="p-6">Cargando...</div>;

  const fecha = new Date(solicitud.fecha_creacion);

  return (
    <div className="p-6">
      <button
        onClick={() => navigate("/consultor")}
        className="mb-4 text-blue-700 flex items-center gap-2 text-sm hover:underline"
      >
        <ArrowLeft size={16} />
        Volver al consultor
      </button>

      <h2 className="text-2xl font-bold text-blue-800 mb-4">Detalle de la PQRSD</h2>

      {/* Pestañas */}
      <div className="flex gap-4 border-b mb-6">
        {[
          { key: "datos", label: "Datos del Peticionario" },
          { key: "pqrsd", label: "PQRSD" },
          { key: "trazabilidad", label: "Trazabilidad" },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setPestana(key)}
            className={`px-4 py-2 font-semibold border-b-4 ${
              pestana === key
                ? "border-blue-600 text-blue-700"
                : "border-transparent text-gray-500 hover:text-blue-600"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Datos del peticionario */}
      {pestana === "datos" && (
        <div className="bg-white border rounded-xl p-6 shadow-md space-y-2 max-w-3xl mx-auto text-sm">
          <p><strong>Radicado:</strong> <span className="font-mono">{solicitud.radicado}</span></p>
          <p><strong>Nombre:</strong> {solicitud.nombre} {solicitud.apellido}</p>
          <p><strong>Correo:</strong> {solicitud.correo}</p>
          <p><strong>Teléfono:</strong> {solicitud.celular}</p>
          <p><strong>Dirección:</strong> {solicitud.direccion}</p>
          <p><strong>Municipio - Departamento:</strong> {solicitud.municipio}, {solicitud.departamento}</p>
          <p><strong>Fecha:</strong> {fecha.toLocaleDateString()} {fecha.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
          <p>
            <strong>Estado:</strong>{" "}
            <span className={`text-xs px-3 py-1 rounded font-medium ${badgeEstado(solicitud.estado)}`}>
              {solicitud.estado}
            </span>
          </p>
        </div>
      )}

      {/* Mensaje y archivos */}
      {pestana === "pqrsd" && (
        <div className="bg-white border rounded-xl p-6 shadow-md max-w-6xl mx-auto space-y-6">
          <div>
            <p className="text-sm font-semibold mb-2">📬 Mensaje del ciudadano:</p>
            <div className="bg-gray-50 border border-gray-300 p-3 rounded text-sm whitespace-pre-wrap">
              {solicitud.mensaje}
            </div>
          </div>

          {solicitud.archivo && (
            <div>
              <p className="text-sm font-medium mb-1">📎 Archivo original:</p>
              <iframe
                src={`http://127.0.0.1:8000/${solicitud.archivo}`}
                title="Archivo ciudadano"
                className="w-full h-[500px] border rounded"
              />
              <a
                href={`http://127.0.0.1:8000/${solicitud.archivo}`}
                download
                className="text-blue-600 hover:underline inline-flex items-center mt-2"
              >
                <FileDown className="mr-2" size={16} /> Descargar archivo
              </a>
            </div>
          )}

          {solicitud.archivo_respuesta && (
            <div>
              <p className="text-sm font-medium mt-4 mb-1">📝 Proyecto de respuesta:</p>
              <iframe
                src={`http://127.0.0.1:8000/${solicitud.archivo_respuesta}`}
                title="Archivo respuesta"
                className="w-full h-[500px] border rounded"
              />
              <a
                href={`http://127.0.0.1:8000/${solicitud.archivo_respuesta}`}
                download
                className="text-blue-600 hover:underline inline-flex items-center mt-2"
              >
                <FileDown className="mr-2" size={16} /> Descargar respuesta
              </a>
            </div>
          )}

          {solicitud.archivo_evidencia && (
            <div>
              <p className="text-sm font-medium mt-4 mb-1">📄 Evidencia de notificación:</p>
              <a
                href={`http://127.0.0.1:8000/${solicitud.archivo_evidencia}`}
                download
                className="text-blue-600 hover:underline inline-flex items-center"
              >
                <FileDown className="mr-2" size={16} /> Descargar evidencia
              </a>
            </div>
          )}
        </div>
      )}

      {/* Trazabilidad */}
      {pestana === "trazabilidad" && (
        <div className="bg-white border rounded-xl p-6 shadow-md max-w-6xl mx-auto">
          <h3 className="text-lg font-semibold mb-4 text-gray-700">📌 Trazabilidad del Proceso</h3>
          <ol className="relative border-l border-blue-600 ml-4 space-y-8 text-sm">
            {trazabilidad.length > 0 ? (
              trazabilidad.map((item, i) => (
                <li key={i} className="ml-4">
                  <div className="absolute -left-[0.7rem] w-4 h-4 bg-blue-600 rounded-full border border-white shadow" />
                  <time className="block mb-1 text-sm text-gray-500">
                    {new Date(item.fecha).toLocaleString()}
                  </time>
                  <p className="text-base font-semibold text-blue-700 mb-1">
                    {item.evento}
                  </p>
                  {(item.usuario_remitente || item.usuario_destinatario) && (
                    <p className="text-xs text-gray-600">
                      {item.usuario_remitente && <span><strong>De:</strong> {item.usuario_remitente}</span>}{" "}
                      {item.usuario_destinatario && <span>→ <strong>Para:</strong> {item.usuario_destinatario}</span>}
                    </p>
                  )}
                  {item.mensaje && (
                    <p className="text-gray-700 bg-gray-100 border rounded p-3 whitespace-pre-wrap mt-2">
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

export default DetalleConsultaPQRSD;
