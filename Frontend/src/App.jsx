import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './toast.css';
import Layout from './components/Layout';
import ScrollToTop from './components/ScrollToTop';
import Home from './pages/Home';
import AdminDashboard from './pages/Admin/AdminDashboard';
import TournamentRegistrations from './pages/Admin/TournamentRegistrations';

// FreeFire pages
import FreeFire from './pages/FreeFire/FreeFire';
import FreeFireTournaments from './pages/FreeFire/Tournaments';
import FreeFireOrganisers from './pages/FreeFire/Organisers';
import FreeFireTeamDetails from './pages/FreeFire/TeamDetails';

// Valorant pages
import Valorant from './pages/Valorant/Valorant';
import ValorantTournaments from './pages/Valorant/Tournaments';
import ValorantOrganisers from './pages/Valorant/Organisers';
import ValorantTeamDetails from './pages/Valorant/TeamDetails';

// BGMI pages
import BGMI from './pages/BGMI/BGMI';
import BGMITournaments from './pages/BGMI/Tournaments';
import BGMIOrganisers from './pages/BGMI/Organisers';
import BGMITeamDetails from './pages/BGMI/TeamDetails';
import TournamentDetails from './pages/TournamentDetails';

// Auth Pages
import LoginSelection from './pages/Auth/LoginSelection';
import PlayerLogin from './pages/Auth/PlayerLogin';
import PlayerSignup from './pages/Auth/PlayerSignup';
import PartnerLogin from './pages/Auth/PartnerLogin';
import ForgotPassword from './pages/Auth/ForgotPassword';
import UserDashboard from './pages/UserDashboard';
import NotFound from './pages/NotFound';

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      {/* ── Global Toast Notification System ── */}
      <ToastContainer
        position="top-right"
        autoClose={3500}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
        limit={4}
      />

      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="admin" element={<AdminDashboard />} />
          <Route path="admin/tournaments/:tournamentId/registrations" element={<TournamentRegistrations />} />
          <Route path="tournaments/:tournamentId" element={<TournamentDetails />} />

          <Route path="dashboard" element={<UserDashboard />} />

          {/* Auth Routes */}
          <Route path="login" element={<LoginSelection />} />
          <Route path="auth">
            <Route path="player/login" element={<PlayerLogin />} />
            <Route path="player/register" element={<PlayerSignup />} />
            <Route path="partner/login" element={<PartnerLogin />} />
            <Route path="forgot-password" element={<ForgotPassword />} />
          </Route>

          {/* FreeFire Routes */}
          <Route path="freefire">
            <Route index element={<FreeFire />} />
            <Route path="tournaments" element={<FreeFireTournaments />} />
            <Route path="organisers" element={<FreeFireOrganisers />} />
            <Route path="organisers/:teamId" element={<FreeFireTeamDetails />} />
          </Route>

          {/* Valorant Routes */}
          <Route path="valorant">
            <Route index element={<Valorant />} />
            <Route path="tournaments" element={<ValorantTournaments />} />
            <Route path="organisers" element={<ValorantOrganisers />} />
            <Route path="organisers/:teamId" element={<ValorantTeamDetails />} />
          </Route>

          {/* BGMI Routes */}
          <Route path="bgmi">
            <Route index element={<BGMI />} />
            <Route path="tournaments" element={<BGMITournaments />} />
            <Route path="organisers" element={<BGMIOrganisers />} />
            <Route path="organisers/:teamId" element={<BGMITeamDetails />} />
          </Route>

          {/* 404 inside layout */}
          <Route path="*" element={<NotFound />} />
        </Route>

        {/* Global 404 fallback (outside Layout) */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
