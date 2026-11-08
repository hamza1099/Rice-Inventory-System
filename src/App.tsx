import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import './ReactToastify.css';
import { PosProvider } from './context/PosContext';
import { Header } from './components/common/Header';
import { Sidebar } from './components/common/Sidebar';
import { StatusBar } from './components/common/StatusBar';
import { LockScreenModal } from './components/common/LockScreenModal';
import { MandiChitModal } from './components/inventory/MandiChitModal';
import InitRoute from './routes/InitRoute';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <PosProvider>
        <div className="h-screen max-h-screen flex flex-col bg-[#f3f6f4] text-slate-800 antialiased font-sans overflow-hidden">
          {/* Top Sticky Header */}
          <Header />

          {/* Main Layout Area */}
          <div className="flex flex-1 overflow-hidden min-h-0">
            {/* Left Sidebar */}
            <Sidebar />

            {/* Workstation Screen Viewport */}
            <main className="flex-1 overflow-y-auto p-2.5 h-full min-h-0">
              <InitRoute />
            </main>
          </div>

          {/* Bottom Fiscal & Shortcut Status Bar */}
          <StatusBar />

          {/* Global Modals */}
          <LockScreenModal />
          <MandiChitModal />

          {/* Global Toast Notifications */}
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
            theme="colored"
          />
        </div>
      </PosProvider>
    </BrowserRouter>
  );
};

export default App;
