import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';

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

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="tournaments/:tournamentId" element={<TournamentDetails />} />

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
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
