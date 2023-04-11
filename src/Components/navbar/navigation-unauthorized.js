import React from 'react';
import { Link } from 'react-router-dom';

const NavigationUnauthorized = () => (
    <nav style={{alignItems: 'center'}}>
        <div>
            <Link to={'/'} id='navbar-logo'><h3>Third Space</h3></Link>
        </div>
    </nav>
);

export default NavigationUnauthorized;