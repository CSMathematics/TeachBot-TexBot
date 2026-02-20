import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { SettingsProvider } from './contexts/SettingsContext';
import { ToastProvider } from './components/Toast';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import ExamGenerator from './pages/ExamGenerator';
import AgentHub from './pages/AgentHub';
import WorksheetGenerator from './pages/WorksheetGenerator';
import Library from './pages/Library';
import Curriculum from './pages/Curriculum';
import Settings from './pages/Settings';
import FlowchartGenerator from './pages/FlowchartGenerator';
import DocumentStudioLayout from './pages/DocumentStudioLayout';
import DocumentStudioHome from './pages/DocumentStudioHome';

import DocumentBuilder from './pages/DocumentBuilder';
import SyllabusNew from './pages/SyllabusNew';
import PresentationCreator from './pages/PresentationCreator';
import FigureWizard from './pages/FigureWizard';
import TableArchitect from './pages/TableArchitect';
import BibliographyManager from './pages/BibliographyManager';
import TemplateCurator from './pages/TemplateCurator';
import SyllabusManager from './pages/SyllabusManager';

function App() {
  return (
    <SettingsProvider>
      <ToastProvider>
        <Router>
          <div className="flex h-screen bg-background text-foreground overflow-hidden selection:bg-primary/20 selection:text-primary">
            <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-indigo-100/50 via-white to-white dark:from-background dark:via-background dark:to-background pointer-events-none" />
            <Sidebar />
            <main className="flex-1 overflow-y-auto">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/agents" element={<AgentHub />} />
                <Route path="/create" element={<ExamGenerator />} />
                <Route path="/worksheet" element={<WorksheetGenerator />} />
                <Route path="/library" element={<Library />} />
                <Route path="/library" element={<Library />} />
                <Route path="/curriculum/new" element={<SyllabusNew />} />
                <Route path="/curriculum/editor" element={<Curriculum />} />
                <Route path="/curriculum" element={<SyllabusManager />} />
                <Route path="/flowchart" element={<FlowchartGenerator />} />

                {/* Document Studio Routes */}
                <Route path="/studio" element={<DocumentStudioLayout />}>
                  <Route index element={<DocumentStudioHome />} />
                  <Route path="document" element={<DocumentBuilder />} />
                  <Route path="presentation" element={<PresentationCreator />} />
                  <Route path="figure" element={<FigureWizard />} />
                  <Route path="table" element={<TableArchitect />} />
                  <Route path="bibliography" element={<BibliographyManager />} />
                  <Route path="template" element={<TemplateCurator />} />
                </Route>

                <Route path="/settings" element={<Settings />} />
              </Routes>
            </main>
          </div>
        </Router>
      </ToastProvider>
    </SettingsProvider>
  );
}

export default App;