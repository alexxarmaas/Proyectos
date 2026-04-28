import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Patients from './pages/Patients';
import PatientProfile from './pages/PatientProfile';
import Consultations from './pages/Consultations';
import Agenda from './pages/Agenda';
import PlanesAlimentarios from './pages/PlanesAlimentarios';
import Recetas from './pages/Recetas';
import PublicBooking from './pages/PublicBooking';

function PrivateRoute({ children }) {
  const isAuthenticated = Boolean(localStorage.getItem('token'));
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/booking/:nutri" element={<PublicBooking />} />
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Layout />
            </PrivateRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="patients" element={<Patients />} />
          <Route path="patients/:id" element={<PatientProfile />} />
          <Route path="consultations" element={<Consultations />} />
          <Route path="agenda" element={<Agenda />} />
          <Route path="planes" element={<PlanesAlimentarios />} />
          <Route path="recetas" element={<Recetas />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
