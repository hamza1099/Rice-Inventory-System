import React from 'react';
import { BrowserRouter, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import './ReactToastify.css';
import { PosProvider, usePos } from './context/PosContext';
import { Header } from './components/common/Header';
import { Sidebar } from './components/common/Sidebar';
import { StatusBar } from './components/common/StatusBar';
import { MandiChitModal } from './components/inventory/MandiChitModal';
import { ImagePreviewModal } from './components/common/ImagePreviewModal';
import { UnclosedSessionAlertModal } from './components/pos/UnclosedSessionAlertModal';
import InitRoute from './routes/InitRoute';
import { LoginScreen } from './screens/LoginScreen';
import { RouteName } from './routes/RouteName';

const MainLayout: React.FC = () => {
  const { isTerminalLocked, isAuthLoading } = usePos();
  const location = useLocation();

  // If cold session is checking Firebase auth in the background, prevent flashing LoginScreen
  if (isAuthLoading && isTerminalLocked) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-[#111f17] text-white select-none">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-800/40 border border-emerald-500/40 flex items-center justify-center shadow-2xl animate-pulse">
            <span className="text-xl font-black text-emerald-400 font-serif tracking-wider">BR</span>
          </div>
          <div className="flex items-center space-x-2 text-emerald-300 font-mono text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span>Verifying session security...</span>
          </div>
        </div>
      </div>
    );
  }

  const isLoginPage = location.pathname === RouteName.LOGIN || isTerminalLocked;

  if (isLoginPage) {
    return <LoginScreen />;
  }

  return (
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
      <MandiChitModal />
      <ImagePreviewModal />
      <UnclosedSessionAlertModal />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <PosProvider>
        <MainLayout />

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
      </PosProvider>
    </BrowserRouter>
  );
};

export default App;
