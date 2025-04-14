import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import DashboardLayout from "./components/layout/DashboardLayout";

// Componentes públicos
import Inicio from "./components/Inicio";
import Formulario from "./components/Formulario";
import Login from "./components/Login";
import Exito from "./components/Exito";

// Paneles
import PanelAsignador from "./components/PanelAsignador";
import ConsultorPQRSD from "./components/ConsultorPQRSD";
import DetalleSolicitud from "./components/DetalleSolicitud";
import DetalleConsultaPQRSD from "./components/DetalleConsultaPQRSD";
import PanelFinalizador from "./components/PanelFinalizador";
import DetalleFinalizador from "./components/DetalleFinalizador";
import PanelResponsable from "./components/PanelResponsable";
import DetalleResponsable from "./components/DetalleResponsable";
import PanelRevisor from "./components/PanelRevisor";
import DetalleRevisor from "./components/DetalleRevisor";
import PanelFirmante from "./components/PanelFirmante";
import DetalleFirmante from "./components/DetalleFirmante";
import PanelAdministrador from "./components/PanelAdministrador";

function App() {
  return (
    <Router>
      <Routes>
        {/* Landing principal SIEMPRE visible */}
        <Route path="/" element={<Inicio />} />

        {/* Rutas públicas */}
        <Route path="/radicar" element={<Formulario />} />
        <Route path="/login" element={<Login />} />
        <Route path="/exito" element={<Exito />} />

        {/* Consultor visible para todos */}
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

        {/* Panel Responsable */}
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

        {/* Panel Revisor */}
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

        {/* Panel Firmante */}
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

        {/* Panel Administrador */}
        <Route
          path="/admin"
          element={
            <DashboardLayout>
              <PanelAdministrador />
            </DashboardLayout>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
