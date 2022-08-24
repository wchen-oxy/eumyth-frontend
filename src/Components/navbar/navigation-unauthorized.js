import React from 'react';
import { Link } from 'react-router-dom';

const NavigationUnauthorized = () => (
    <nav>
        <div>
            <Link to={'/'} className='navbar-link'>interestHub</Link>
        </div>
    </nav>
);

export default NavigationUnauthorized;