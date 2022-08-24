import React from 'react';
import SpotlightPreview from './spotlight-preview.js';

const Spotlight = (props) => {
    return (
        <div>
            <h2>Check Out Some Series That Have Been Published By Others Around the World!</h2>
            <div id='spotlight-projects'>
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