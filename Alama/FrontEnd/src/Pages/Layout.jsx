import React from "react";
import { Outlet} from 'react-router-dom';
import './Layout.css'; 
import Navbar from "./Navbar";

const Layout = () => {

    return (
        <div>
            <Navbar/>
            <div className="pw">
                <div className="main-frame">
                    <Outlet/>
                </div>
            </div>
        </div>
    );
}

export default Layout;
