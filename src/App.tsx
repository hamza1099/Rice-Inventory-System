import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { PosProvider } from './context/PosContext';
import { Header } from './components/common/Header';
import { Sidebar } from './components/common/Sidebar';
import { StatusBar } from './components/common/StatusBar';
import InitRoute from './routes/InitRoute';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <PosProvider>
        <div className="min-h-screen flex flex-col bg-[#f3f6f4] text-slate-800 antialiased font-sans">
          {/* Top Sticky Header */}
          <Header />

          {/* Main Layout Area */}
          <div className="flex flex-1 overflow-hidden">
            {/* Left Sidebar */}
            <Sidebar />

            {/* Workstation Screen Viewport */}
            <main className="flex-1 overflow-y-auto p-3.5 h-[calc(100vh-42px-36px)]">
              <InitRoute />
            </main>
          </div>

          {/* Bottom Fiscal & Shortcut Status Bar */}
          <StatusBar />
        </div>
      </PosProvider>
    </BrowserRouter>
  );
};

export default App;
