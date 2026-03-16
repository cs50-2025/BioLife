import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Scan from './pages/Scan';
import MyPlants from './pages/MyPlants';
import PlantProfile from './pages/PlantProfile';
import Schedule from './pages/Schedule';
import Guide from './pages/Guide';
import Stores from './pages/Stores';
import Doctor from './pages/Doctor';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ProtectedRoute from './components/ProtectedRoute';
import { PlantProvider } from './context/PlantContext';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <PlantProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route element={<ProtectedRoute />}>
                <Route path="/" element={<Layout />}>
                  <Route index element={<Home />} />
                  <Route path="scan" element={<Scan />} />
                  <Route path="plants" element={<MyPlants />} />
                  <Route path="plants/:id" element={<PlantProfile />} />
                  <Route path="schedule" element={<Schedule />} />
                  <Route path="guide" element={<Guide />} />
                  <Route path="stores" element={<Stores />} />
                  <Route path="doctor" element={<Doctor />} />
                  <Route path="profile" element={<Profile />} />
                </Route>
              </Route>
            </Routes>
          </BrowserRouter>
        </PlantProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}
