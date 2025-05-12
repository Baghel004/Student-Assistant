import React from 'react';
import Sidebar from './components/Sidebar';
import MainContent from './components/MainContent';
import { AppProvider } from './context/AppContext';

function App() {
  return (
    <AppProvider>
      <div className="flex h-screen bg-gray-900 text-white">
        <Sidebar />
        <MainContent />
      </div>
    </AppProvider>
  );
}

export default App;