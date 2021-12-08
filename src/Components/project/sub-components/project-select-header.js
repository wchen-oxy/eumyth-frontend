import React from 'react';

const ProjectSelectHeader = (props) => {

    if (props.stage === 1) {
        return (<h3>Select The Posts You Want To Add!</h3>);
    }
    else if (props.stage === 2) {
        return (<h3>Select The Posts You Want To Keep!</h3>);
    }
}

export default ProjectSelectHeader;