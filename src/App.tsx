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
import { PlantProvider } from './context/PlantContext';

export default function App() {
  return (
    <PlantProvider>
      <BrowserRouter>
        <Routes>
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
        </Routes>
      </BrowserRouter>
    </PlantProvider>
  );
}
