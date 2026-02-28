import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LanguageProvider } from './contexts/LanguageContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import VoteFlow from './pages/VoteFlow';
import VoterRegistration from './pages/VoterRegistration';
import CandidateRegistration from './pages/CandidateRegistration';
import HelpDesk from './pages/HelpDesk';
import AdminConfig from './pages/AdminConfig';

function App() {
  return (
    <LanguageProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/vote" element={<VoteFlow />} />
            <Route path="/voter-registration" element={<VoterRegistration />} />
            <Route path="/candidate-registration" element={<CandidateRegistration />} />
            <Route path="/help-desk" element={<HelpDesk />} />
            <Route path="/admin" element={<AdminConfig />} />
          </Routes>
        </Layout>
      </Router>
    </LanguageProvider>
  );
}

export default App;
