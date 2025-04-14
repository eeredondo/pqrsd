import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import colombiaData from "../data/colombia.json";

function Formulario() {
  const [form, setForm] = useState({});
  const [archivo, setArchivo] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleDepartamentoChange = (e) => {
    setForm({
      ...form,
      departamento: e.target.value,
      municipio: ""
    });
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

  const departamentos = colombiaData.map((item) => item.departamento);
  const municipios =
    colombiaData.find((dep) => dep.departamento === form.departamento)
      ?.ciudades || [];

  return (
    <div className="min-h-screen bg-blue-100 flex items-center justify-center p-6">
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-2xl rounded-2xl p-10 max-w-2xl w-full space-y-5"
      >
        <h2 className="text-3xl font-extrabold text-blue-800 mb-2 text-center">Radicar PQRSD</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input
            name="nombre"
            placeholder="Nombre"
            required
            className="border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            onChange={handleChange}
          />
          <input
            name="apellido"
            placeholder="Apellido"
            required
            className="border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            onChange={handleChange}
          />
          <input
            name="correo"
            type="email"
            placeholder="Correo"
            required
            className="border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            onChange={handleChange}
          />
          <input
            name="celular"
            placeholder="Teléfono"
            required
            className="border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            onChange={handleChange}
          />
          <select
            name="departamento"
            required
            className="border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            onChange={handleDepartamentoChange}
          >
            <option value="">Selecciona un Departamento</option>
            {departamentos.map((dep) => (
              <option key={dep} value={dep}>{dep}</option>
            ))}
          </select>
          <select
            name="municipio"
            required
            className="border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            onChange={handleChange}
            disabled={!form.departamento}
          >
            <option value="">Selecciona un Municipio</option>
            {municipios.map((mun) => (
              <option key={mun} value={mun}>{mun}</option>
            ))}
          </select>
        </div>

        <input
          name="direccion"
          placeholder="Dirección"
          required
          className="w-full border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          onChange={handleChange}
        />
        <textarea
          name="mensaje"
          placeholder="Escribe tu PQRSD..."
          rows={4}
          required
          className="w-full border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          onChange={handleChange}
        />
        <div className="w-full">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Adjuntar archivo PDF
          </label>
          <input
            type="file"
            accept="application/pdf"
            required
            className="w-full border p-3 rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200"
            onChange={(e) => setArchivo(e.target.files[0])}
          />
        </div>

        <div className="flex justify-between pt-2">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="bg-blue-700 text-white px-6 py-2 rounded-lg shadow hover:bg-blue-800 transition"
          >
            Volver al Menú
          </button>
          <button
            type="submit"
            className="bg-blue-700 text-white px-6 py-2 rounded-lg shadow hover:bg-blue-800 transition"
          >
            Enviar PQRSD
          </button>
        </div>
      </form>
    </div>
  );
}

export default Formulario;
