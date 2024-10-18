// PrivateRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children, allowedRoles }) => {
    const role = window.sessionStorage.getItem('role'); // Get the role from session storage
    
    // Check if the user role is allowed to access the route
    if (allowedRoles && !allowedRoles.includes(role)) {
        return <Navigate to="/" />; // Redirect to login or unauthorized page
    }

    return children;
};


export default PrivateRoute;
