import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import RoleSelectionPage from './pages/RoleSelectionPage';
import RoleLoginPage from './pages/RoleLoginPage';
import AdminLayout from './pages/admin/AdminLayout';
import DashboardOverview from './pages/admin/DashboardOverview';
import UserManagement from './pages/admin/UserManagement';
import CourrierManagement from './pages/admin/CourrierManagement';
import DirecteurLayout from './pages/directeur/DirecteurLayout';
import CourrierInbox from './pages/directeur/CourrierInbox';
import './index.css';
import DirecteurDashboardOverview from './pages/directeur/DirecteurDashboardOverView';
import CourrierSent from './pages/directeur/CourrierSent';
import CourrierArchived from './pages/directeur/CourrierArchived';

function App() {
  return (
    <ThemeProvider>
      <Router>
        <Routes>
          <Route path="/" element={<RoleSelectionPage />} />
          <Route path="/login/:role" element={<RoleLoginPage />} />
          {/* Admin Routes */}
          <Route path="/admin/dashboard" element={<AdminLayout><DashboardOverview /></AdminLayout>} />
          <Route path="/admin/users" element={<AdminLayout><UserManagement /></AdminLayout>} />
          <Route path="/admin/courriers" element={<AdminLayout><CourrierManagement /></AdminLayout>} />
          {/* DGS and Bureau d’Ordre Routes */}
          <Route path="/dashboard/:department" element={<DirecteurLayout />}>
            <Route index element={<DirecteurDashboardOverview />} /> {/* Default dashboard */}
            <Route path="inbox" element={<CourrierInbox />} />
            <Route path="sent" element={<CourrierSent/>} />
            <Route path="archived" element={<CourrierArchived/>} />
            <Route path="pending" element={<div>Pending Page (TBD)</div>} />
          </Route>
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;