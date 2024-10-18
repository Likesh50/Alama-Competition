import React from 'react';
import './App.css';
import LoginPage from './Pages/LoginPage';
import Dashboard from './Pages/Dashboard';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './Pages/Layout';
import UploadExcel from './Pages/UploadExcel';
import Database_List from './Pages/Database_List';
import MarkEntry from './Pages/MarkEntry';
import ModifyPosition from './Pages/ModifyPosition';

function App() {
  return (
    <div className='app'>
      <Router>
        <Routes>
          <Route path="/" element={<LoginPage/>} />

          <Route path="/dashboard" element={<Layout />}>
            <Route path="" element={<Dashboard />} />
            <Route path="mark-entry" element={ <MarkEntry/> } />
            <Route path="result" element={<Database_List/>} />
            <Route path="upload" element={<UploadExcel/>} />
            <Route path="modify-position" element={<ModifyPosition/>} />
          </Route>
        </Routes>
      </Router>
    </div>
  );
}

export default App;
