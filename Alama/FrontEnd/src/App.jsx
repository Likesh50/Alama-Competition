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
  function App() {
    return (
      <div className='app'>
        <Router>
                <Routes>
                    <Route path="/" element={<LoginPage />} />
                    <Route
                        path="/dashboard"
                        element={
                            <PrivateRoute allowedRoles={['Admin', 'Entry','Developer']}>
                                <Layout />
                            </PrivateRoute>
                        }
                    >
                        <Route path="" element={<Dashboard />} />
                        <Route
                            path="signup"
                            element={
                                <PrivateRoute allowedRoles={['Admin','Developer']}>
                                    <SignUp />
                                </PrivateRoute>
                            }
                        />
                        <Route
                            path="mark-entry"
                            element={
                                <PrivateRoute allowedRoles={['Admin', 'Entry','Developer']}>
                                    <MarkEntry />
                                </PrivateRoute>
                            }
                        />
                        
                        <Route
                            path="result"
                            element={
                                <PrivateRoute allowedRoles={['Admin','Developer']}>
                                    <Database_List />
                                </PrivateRoute>
                            }
                        />
                        <Route
                            path="upload"
                            element={
                                <PrivateRoute allowedRoles={['Admin','Developer']}>
                                    <UploadExcel />
                                </PrivateRoute>
                            }
                        />
                        <Route
                            path="modify-position"
                            element={
                                <PrivateRoute allowedRoles={['Admin','Developer']}>
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
