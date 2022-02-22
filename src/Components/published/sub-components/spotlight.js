import React from 'react';
import SpotlightPreview from './spotlight-preview.js';
import './spotlight.scss';

const Spotlight = (props) => {
    return (
        <div>
            <h2>Check out some projects</h2>
            <div id='spotlight-projects-container'>
                {props.spotlight.map((project, index) =>
                    <SpotlightPreview
                        key={index}
                        {...props}
                        project={project}
                    />
                )}
            </div>

        </div>
    )
}

export default Spotlight;