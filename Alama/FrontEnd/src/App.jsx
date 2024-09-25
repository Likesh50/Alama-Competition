import React from 'react';
import './App.css';
import LoginPage from './Pages/LoginPage';
import Dashboard from './Pages/Dashboard';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './Pages/Layout';
import Result from './Pages/Result';
import LevelsReport from './Pages/LevelsReport';
import useFetchData from './Pages/useFetchData';
import FileUpload from './FileUpload';
import UploadExcel from './Pages/UploadExcel';
import Database_List from './Pages/Database_List';
import MarkEntry from './Pages/MarkEntry';

function App() {
  return (
    <div className='app'>
      <Router>
        <Routes>
          <Route path="/" element={<LoginPage/>} />

          <Route path="/dashboard" element={<Layout />}>
            <Route path="" element={<Dashboard />} />
            <Route path="mark-entry" element={ <MarkEntry/> } />
            <Route path="level-wise-report" element={<LevelsReport/>}/>
            <Route path="result" element={<Database_List/>} />
            <Route path="upload" element={<UploadExcel/>} />
          </Route>
        </Routes>
      </Router>
    </div>
  );
}

export default App;
