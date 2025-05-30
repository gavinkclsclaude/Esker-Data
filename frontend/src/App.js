import React, { useState } from 'react';
import './App.css';
import TableList from './components/TableList';
import TableDataViewer from './components/TableDataViewer';

function App() {
  const [selectedTable, setSelectedTable] = useState(null);

  const handleSelectTable = (tableName) => {
    setSelectedTable(tableName);
  };

  const handleBack = () => {
    setSelectedTable(null);
  };

  return (
    <div className="App">
      <header className="App-header">
        <div className="header-top">
          <h1>ESKER DATABASE MANAGER</h1>
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
    </div>
  );
}

export default App;