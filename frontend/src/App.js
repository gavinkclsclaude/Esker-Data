import React, { useState } from 'react';
import './App.css';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/Login';
import TableList from './components/TableList';
import TableDataViewer from './components/TableDataViewer';
import UserMenu from './components/UserMenu';
import UserManagement from './components/UserManagement';

function AppContent() {
  const [selectedTable, setSelectedTable] = useState(null);
  const [showUserManagement, setShowUserManagement] = useState(false);
  const { isAuthenticated, loading } = useAuth();

  const handleSelectTable = (tableName) => {
    setSelectedTable(tableName);
  };

  const handleBack = () => {
    setSelectedTable(null);
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <div className="App">
      <header className="App-header">
        <div className="header-top">
          <div style={{ display: 'flex', alignItems: 'center', gap: '60px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ 
                width: '40px', 
                height: '40px', 
                overflow: 'hidden',
                position: 'relative'
              }}>
                <img 
                  src="/kcls-logo.png" 
                  alt="KCLS Logo" 
                  style={{ 
                    height: '40px',
                    position: 'absolute',
                    left: '0',
                    top: '0'
                  }} 
                />
              </div>
              <span style={{ color: 'white', fontSize: '16px', fontWeight: '500' }}>
                King County Library System
              </span>
            </div>
            <h1>ESKER DATABASE MANAGER</h1>
          </div>
          <UserMenu onManageUsers={() => setShowUserManagement(true)} />
        </div>
        <nav className="header-nav">
          <button className="nav-tab active">TABLES</button>
          <button className="nav-tab">EXPORTS</button>
          <button className="nav-tab">REPORTS</button>
          <button className="nav-tab">VENDORS</button>
        </nav>
      </header>
      
      <main>
        {!selectedTable ? (
          <TableList onSelectTable={handleSelectTable} />
        ) : (
          <TableDataViewer 
            tableName={selectedTable} 
            onBack={handleBack} 
          />
        )}
      </main>

      {showUserManagement && (
        <UserManagement onClose={() => setShowUserManagement(false)} />
      )}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;