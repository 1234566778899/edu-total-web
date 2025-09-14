import { Navigate, Route, Routes } from 'react-router-dom';
import './App.css';
import { AuthProvider, useFirebaseApp } from 'reactfire';
import { AuthContextApp } from './contexts/AuthContextApp';
import { getAuth } from 'firebase/auth';
import Layout from './layouts/Main';
import CursosPage from './pages/CoursesPage';
import MaterialesPage from './pages/MaterialesPage';
import CalendarioPage from './pages/CalendarioPage';
import ExamenesPage from './pages/ExamenesPage';
import DashboardPage from './pages/DashboardPage';
import PerfilPage from './pages/PerfilPage';
import RendirExamenPage from './pages/RendriExamen';
import LoginPage from './pages/LoginPage';
import { ConfiguracionPage } from './pages/ConfiguracionPage';
import AdminLayout from './layouts/AdminLayout';
import CoursesAdmin from './pages/admin/CousesAdmin';
import CourseDetailView from './pages/admin/CourseDetailView';
import { DashboardAdmin } from './pages/admin/DashboardAdmin';
import StudentsPage from './pages/admin/StudentAdmin';
import { EventAdmin } from './pages/admin/EventAdmin';
import ExamenAdmin from './pages/admin/ExamenAdmin';
import VerResultadosExamen from './pages/admin/VerResultadosExmane';


function App() {
  const firestoreInstance = getAuth(useFirebaseApp());
  return (
    <>
      <AuthProvider sdk={firestoreInstance}>
        <AuthContextApp>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={<Layout />}>
              <Route path="cursos" element={<CursosPage />} />
              <Route path="cursos/:courseId" element={<MaterialesPage />} />
              <Route path="calendario" element={<CalendarioPage />} />
              <Route path="examenes" element={<ExamenesPage />} />
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="perfil" element={<PerfilPage />} />
              <Route path="configuracion" element={<ConfiguracionPage />} />
              <Route path="examenes/:examenId" element={<RendirExamenPage />} />
              <Route path="examenes/:examenId/:resultadoId" element={<VerResultadosExamen />} />
            </Route>
            <Route path="/admin" element={<AdminLayout />}>
              <Route path="courses" element={<CoursesAdmin />} />
              <Route path="eventos" element={<EventAdmin />} />
              <Route path="examenes" element={<ExamenAdmin />} />
              <Route path="courses/:courseId" element={<CourseDetailView />} />
              <Route path="dashboard" element={<DashboardAdmin />} />
              <Route path="students" element={<StudentsPage />} />
            </Route>
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </AuthContextApp>
      </AuthProvider>
    </>
  );
}

export default App;
