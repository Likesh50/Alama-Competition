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
import SignUp from './SignUp';
import PrivateRoute from './Pages/PrivateRoute';

import DataPage from './Pages/DataPage';
function App() {

  const role=window.sessionStorage.getItem("role");

  return (
    <div className='app'>
      <Router>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/signup" element={<SignUp />} /> {/* Moved here */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute allowedRoles={['Admin', 'Entry', 'Developer','Center']}>
                <Layout />
              
              </PrivateRoute>
            }
          >
            <Route
              path=""
              element={
                role === 'Center' ?  <DataPage/>: <Dashboard />
              }
            />

            <Route
              path="mark-entry"
              element={
                <PrivateRoute allowedRoles={['Entry', 'Developer']}>
                  <MarkEntry />
                </PrivateRoute>
              }
            />
            <Route
              path="result"
              element={
                <PrivateRoute allowedRoles={['Admin', 'Developer']}>
                  <Database_List />
                </PrivateRoute>
              }
            />
            <Route
              path="upload"
              element={
                <PrivateRoute allowedRoles={['Admin', 'Developer']}>
                  <UploadExcel />
                </PrivateRoute>
              }
            />
            <Route
              path="modify-position"
              element={
                <PrivateRoute allowedRoles={['Admin', 'Developer']}>
                  <ModifyPosition />
                </PrivateRoute>
              }
            />
            
            <Route
              path="data"
              element={<DataPage/>}
            />

          </Route>
        </Routes>
      </Router>
    </div>
  );
}

export default App;
