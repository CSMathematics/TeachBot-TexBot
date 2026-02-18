import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { SettingsProvider } from './contexts/SettingsContext';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import ExamGenerator from './pages/ExamGenerator';
import AgentHub from './pages/AgentHub';
import WorksheetGenerator from './pages/WorksheetGenerator';
import Library from './pages/Library';
import Curriculum from './pages/Curriculum';
import Settings from './pages/Settings';
import MindmapGenerator from './pages/MindmapGenerator';
import DocumentStudio from './pages/DocumentStudio';
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
      <Router>
        <div className="flex h-screen bg-background text-foreground overflow-hidden selection:bg-primary/20 selection:text-primary">
          <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-indigo-100/50 via-white to-white dark:from-slate-900 dark:via-slate-950 dark:to-black opacity-60 pointer-events-none" />
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
              <Route path="/mindmaps" element={<MindmapGenerator />} />
              <Route path="/mindmaps" element={<MindmapGenerator />} />
              <Route path="/studio" element={<DocumentStudio />} />
              <Route path="/studio/document" element={<DocumentBuilder />} />
              <Route path="/studio/presentation" element={<PresentationCreator />} />
              <Route path="/studio/figure" element={<FigureWizard />} />
              <Route path="/studio/table" element={<TableArchitect />} />
              <Route path="/studio/bibliography" element={<BibliographyManager />} />
              <Route path="/studio/template" element={<TemplateCurator />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </main>
        </div>
      </Router>
    </SettingsProvider>
  );
}

export default App;