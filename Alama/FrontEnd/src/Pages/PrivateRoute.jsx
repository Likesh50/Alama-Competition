import React from 'react';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children, allowedRoles }) => {
    const role = window.sessionStorage.getItem('role'); 
    
    if (allowedRoles && !allowedRoles.includes(role)) {
        return <Navigate to="/" />; 
    }

    return children;
};


export default PrivateRoute;
