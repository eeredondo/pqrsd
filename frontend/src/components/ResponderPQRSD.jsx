// frontend/src/components/ResponderPQRSD.jsx
import React, { useState } from "react";
import axios from "axios";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

function ResponderPQRSD({ solicitudId, onRespuestaEnviada }) {
  const [mensaje, setMensaje] = useState("");
  const [archivo, setArchivo] = useState(null);
  const [enviando, setEnviando] = useState(false);
  const token = localStorage.getItem("token");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!mensaje.trim() || !archivo) {
      alert("Debe escribir un mensaje y subir un archivo PDF.");
      return;
    }

    try {
      setEnviando(true);

      const formData = new FormData();
      formData.append("archivo", archivo);

      // Subir el archivo PDF
      await axios.post(`http://127.0.0.1:8000/solicitudes/${solicitudId}/respuesta`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      // Registrar el mensaje (opcional: registrar en trazabilidad o base de datos)
      await axios.post(
        `http://127.0.0.1:8000/solicitudes/${solicitudId}/trazabilidad`,
        {
          mensaje: mensaje,
          tipo: "respuesta",
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      alert("✅ Respuesta enviada correctamente.");
      onRespuestaEnviada(); // Para recargar o volver
    } catch (error) {
      console.error("❌ Error al enviar la respuesta:", error);
      alert("Hubo un error al enviar la respuesta.");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="bg-white p-4 rounded shadow border border-gray-200">
      <h2 className="text-lg font-bold mb-3">✍️ Redactar Respuesta</h2>

      <form onSubmit={handleSubmit}>
        <label className="block mb-2 font-medium text-sm text-gray-700">Mensaje:</label>
        <ReactQuill theme="snow" value={mensaje} onChange={setMensaje} className="mb-4" />

        <label className="block mb-2 font-medium text-sm text-gray-700">Archivo PDF:</label>
        <input
          type="file"
          accept="application/pdf"
          onChange={(e) => setArchivo(e.target.files[0])}
          className="mb-4"
        />

        <button
          type="submit"
          disabled={enviando}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-semibold"
        >
          {enviando ? "Enviando..." : "Enviar Respuesta"}
        </button>
      </form>
    </div>
  );
}

export default ResponderPQRSD;