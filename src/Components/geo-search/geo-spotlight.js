import React from 'react';
import Tab from './sub-components/tab';
import './spotlight.scss';

const GeoSpotlight = (props) => {
    const tabArray = props.users.map(user =>
        <Tab
            key={user._id}
            user={user}
            pursuits={props.pursuits}
            onEventClick={props.onEventClick}
        />
    )
    return (
        <div id="spotlight-main-container">
            <div id="spotlight-highlight">
                <h1>See What People Like You Are Doing</h1>
            </div>
            {tabArray}
        </div>
    )
}

export default GeoSpotlight;