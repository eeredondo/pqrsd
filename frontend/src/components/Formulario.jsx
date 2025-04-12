import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const departamentosColombia = {
  "Atlántico": ["Barranquilla", "Soledad", "Malambo", "Baranoa"],
  "Bolívar": ["Cartagena", "Turbaco", "Arjona"],
  "Cundinamarca": ["Bogotá", "Soacha", "Chía"],
  "Antioquia": ["Medellín", "Bello", "Itagüí"],
};

function Formulario() {
  const [form, setForm] = useState({});
  const [archivo, setArchivo] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!archivo) return alert("Adjunta un archivo en PDF");

    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      formData.append(key, value);
    });
    formData.append("archivo", archivo);

    try {
      await axios.post("http://127.0.0.1:8000/solicitudes/", formData);
      navigate("/exito");
    } catch (err) {
      console.error(err);
      alert("Error al radicar solicitud");
    }
  };

  return (
    <div className="min-h-screen bg-blue-50 flex items-center justify-center p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-lg rounded-xl p-8 max-w-2xl w-full space-y-4 border"
      >
        <h2 className="text-2xl font-bold text-blue-800 mb-4 text-center">Radicar PQRSD</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input name="nombre" placeholder="Nombre" required className="border p-2 rounded" onChange={handleChange} />
          <input name="apellido" placeholder="Apellido" required className="border p-2 rounded" onChange={handleChange} />
          <input name="correo" type="email" placeholder="Correo" required className="border p-2 rounded" onChange={handleChange} />
          <input name="celular" placeholder="Teléfono" required className="border p-2 rounded" onChange={handleChange} />
          <select
            name="departamento"
            required
            className="border p-2 rounded"
            onChange={handleChange}
          >
            <option value="">Selecciona un Departamento</option>
            {Object.keys(departamentosColombia).map((dep) => (
              <option key={dep} value={dep}>{dep}</option>
            ))}
          </select>
          <select
            name="municipio"
            required
            className="border p-2 rounded"
            onChange={handleChange}
            disabled={!form.departamento}
          >
            <option value="">Selecciona un Municipio</option>
            {form.departamento &&
              departamentosColombia[form.departamento].map((mun) => (
                <option key={mun} value={mun}>{mun}</option>
              ))}
          </select>
        </div>

        <input name="direccion" placeholder="Dirección" required className="w-full border p-2 rounded" onChange={handleChange} />
        <textarea
          name="mensaje"
          placeholder="Escribe tu PQRSD..."
          rows={4}
          required
          className="w-full border p-2 rounded"
          onChange={handleChange}
        />
        <input
          type="file"
          accept="application/pdf"
          required
          className="w-full border p-2 rounded"
          onChange={(e) => setArchivo(e.target.files[0])}
        />

        <div className="text-right">
          <button type="submit" className="bg-blue-700 text-white px-6 py-2 rounded hover:bg-blue-800 transition">
            Enviar PQRSD
          </button>
        </div>
      </form>
    </div>
  );
}

export default Formulario;
