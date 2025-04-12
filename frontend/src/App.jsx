import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Layout institucional
import DashboardLayout from "./components/layout/DashboardLayout";

// Rutas públicas
import Formulario from "./components/Formulario";
import Login from "./components/Login";
import Exito from "./components/Exito"; // ✅ NUEVA RUTA

// Asignador
import PanelAsignador from "./components/PanelAsignador";
import ConsultorPQRSD from "./components/ConsultorPQRSD";
import DetalleSolicitud from "./components/DetalleSolicitud";
import DetalleConsultaPQRSD from "./components/DetalleConsultaPQRSD";
import PanelFinalizador from "./components/PanelFinalizador";
import DetalleFinalizador from "./components/DetalleFinalizador";

// Responsable
import PanelResponsable from "./components/PanelResponsable";
import DetalleResponsable from "./components/DetalleResponsable";

// Revisor
import PanelRevisor from "./components/PanelRevisor";
import DetalleRevisor from "./components/DetalleRevisor";

// Firmante
import PanelFirmante from "./components/PanelFirmante";
import DetalleFirmante from "./components/DetalleFirmante";

// Admin
import PanelAdministrador from "./components/PanelAdministrador";

function App() {
  const usuario = JSON.parse(localStorage.getItem("usuario"));

  return (
    <Router>
      <Routes>
        {/* Rutas públicas */}
        <Route path="/" element={<Formulario />} />
        <Route path="/login" element={<Login />} />
        <Route path="/exito" element={<Exito />} /> {/* ✅ NUEVA RUTA */}

        {/* Ruta consultor disponible para todos los roles */}
        <Route
          path="/consultor"
          element={
            <DashboardLayout>
              <ConsultorPQRSD />
            </DashboardLayout>
          }
        />
        <Route
          path="/consultor/solicitud/:id"
          element={
            <DashboardLayout>
              <DetalleConsultaPQRSD />
            </DashboardLayout>
          }
        />

        {/* Panel Asignador */}
        {usuario?.rol === "asignador" && (
          <>
            <Route
              path="/asignador"
              element={
                <DashboardLayout>
                  <PanelAsignador />
                </DashboardLayout>
              }
            />
            <Route
              path="/solicitud/:id"
              element={
                <DashboardLayout>
                  <DetalleSolicitud />
                </DashboardLayout>
              }
            />
            <Route
              path="/finalizar"
              element={
                <DashboardLayout>
                  <PanelFinalizador />
                </DashboardLayout>
              }
            />
            <Route
              path="/finalizar/solicitud/:id"
              element={
                <DashboardLayout>
                  <DetalleFinalizador />
                </DashboardLayout>
              }
            />
          </>
        )}

        {/* Panel Responsable */}
        {usuario?.rol === "responsable" && (
          <>
            <Route
              path="/responsable"
              element={
                <DashboardLayout>
                  <PanelResponsable />
                </DashboardLayout>
              }
            />
            <Route
              path="/responsable/solicitud/:id"
              element={
                <DashboardLayout>
                  <DetalleResponsable />
                </DashboardLayout>
              }
            />
          </>
        )}

        {/* Panel Revisor */}
        {usuario?.rol === "revisor" && (
          <>
            <Route
              path="/revisor"
              element={
                <DashboardLayout>
                  <PanelRevisor />
                </DashboardLayout>
              }
            />
            <Route
              path="/revisor/solicitud/:id"
              element={
                <DashboardLayout>
                  <DetalleRevisor />
                </DashboardLayout>
              }
            />
          </>
        )}

        {/* Panel Firmante */}
        {usuario?.rol === "firmante" && (
          <>
            <Route
              path="/firmante"
              element={
                <DashboardLayout>
                  <PanelFirmante />
                </DashboardLayout>
              }
            />
            <Route
              path="/firmante/solicitud/:id"
              element={
                <DashboardLayout>
                  <DetalleFirmante />
                </DashboardLayout>
              }
            />
          </>
        )}

        {/* Panel Administrador */}
        {usuario?.rol === "admin" && (
          <Route
            path="/admin"
            element={
              <DashboardLayout>
                <PanelAdministrador />
              </DashboardLayout>
            }
          />
        )}
      </Routes>
    </Router>
  );
}

export default App;
