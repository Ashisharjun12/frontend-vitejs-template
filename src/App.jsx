import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './pages/user/layout/Navbar';
import LoginPage from './pages/user/components/LoginPage';
import Homepage from './pages/user/pages/Homepage';
import MISection from './pages/user/components/MISection';
import Pricing from './pages/user/components/Pricing';
import Footer from './pages/user/components/Footer';
import AdminLayout from './pages/admin/layout/AdminLayout';
import WorkspaceLayout from './pages/user/layout/WorkspaceLayout';
import DashboardPage from './pages/user/pages/DashboardPage';
import ProjectsPage from './pages/user/pages/ProjectsPage';
import AddProjectPage from './pages/user/pages/AddProjectPage';
import ProjectDetailPage from './pages/user/pages/ProjectDetailPage';
import WorkspaceSettingsPage from './pages/user/pages/WorkspaceSettingsPage';
import AdminDashboardPage from './pages/admin/pages/DashboardPage';
import FrameworkPage from './pages/admin/pages/FrameworkPage';
import UsersPage from './pages/admin/pages/UsersPage';
import { ProtectedRoute, AdminProtectedRoute } from './components/ProtectedRoute';

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />
        
        {/* Public homepage */}
        <Route
          path="/"
          element={
            <div className="min-h-screen bg-background">
              <Navbar />
              <main className="container mx-auto px-4 py-8">
                <Homepage />
              </main>
              <MISection />
              <Pricing />
              <Footer />
            </div>
          }
        />
        
        {/* Protected user routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <div className="min-h-screen bg-background">
                <Navbar />
                <main className="container mx-auto px-4 py-8">
                  <DashboardPage />
                </main>
              </div>
            </ProtectedRoute>
          }
        />

        {/* Protected workspace routes */}
        <Route
          path="/workspace/*"
          element={
            <ProtectedRoute>
              <WorkspaceLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<div className="p-6"><h1 className="text-2xl font-bold">Workspace</h1><p className="text-muted-foreground mt-2">Select an option from the sidebar</p></div>} />
          <Route path="add-project" element={<AddProjectPage />} />
          <Route path="projects" element={<ProjectsPage />} />
          <Route path="projects/:projectId" element={<ProjectDetailPage />} />
          <Route path="settings" element={<WorkspaceSettingsPage />} />
        </Route>

        {/* Protected admin routes - no navbar */}
        <Route
          path="/admin/*"
          element={
            <AdminProtectedRoute>
              <AdminLayout />
            </AdminProtectedRoute>
          }
        >
          <Route index element={<AdminDashboardPage />} />
          <Route path="projects" element={<div className="p-6"><h1 className="text-2xl font-bold">Projects</h1></div>} />
          <Route path="deployments" element={<div className="p-6"><h1 className="text-2xl font-bold">Deployments</h1></div>} />
          <Route path="frameworks" element={<FrameworkPage />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="settings" element={<div className="p-6"><h1 className="text-2xl font-bold">Settings</h1></div>} />
        </Route>

        {/* Catch all - redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  )
}

export default App
