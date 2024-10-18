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
  import ModifyPosition from './Pages/ModifyPosition';
  import SignUp from './SignUp';
  import PrivateRoute from './Pages/PrivateRoute';
  function App() {
    return (
      <div className='app'>
        <Router>
                <Routes>
                    <Route path="/" element={<LoginPage />} />
                    <Route
                        path="/dashboard"
                        element={
                            <PrivateRoute allowedRoles={['Admin', 'Entry']}>
                                <Layout />
                            </PrivateRoute>
                        }
                    >
                        <Route path="" element={<Dashboard />} />
                        <Route
                            path="signup"
                            element={
                                <PrivateRoute allowedRoles={['Admin']}>
                                    <SignUp />
                                </PrivateRoute>
                            }
                        />
                        <Route
                            path="mark-entry"
                            element={
                                <PrivateRoute allowedRoles={['Admin', 'Entry']}>
                                    <MarkEntry />
                                </PrivateRoute>
                            }
                        />
                        <Route
                            path="level-wise-report"
                            element={
                                <PrivateRoute allowedRoles={['Admin']}>
                                    <LevelsReport />
                                </PrivateRoute>
                            }
                        />
                        <Route
                            path="result"
                            element={
                                <PrivateRoute allowedRoles={['Admin']}>
                                    <Database_List />
                                </PrivateRoute>
                            }
                        />
                        <Route
                            path="upload"
                            element={
                                <PrivateRoute allowedRoles={['Admin']}>
                                    <UploadExcel />
                                </PrivateRoute>
                            }
                        />
                        <Route
                            path="modify-position"
                            element={
                                <PrivateRoute allowedRoles={['Admin']}>
                                    <ModifyPosition />
                                </PrivateRoute>
                            }
                        />
                    </Route>
                </Routes>
            </Router>
      </div>
    );
  }

  export default App;
