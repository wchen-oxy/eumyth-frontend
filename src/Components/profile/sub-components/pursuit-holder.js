import React from 'react';
import { withRouter } from 'react-router-dom';
import './pursuit-holder.scss';

const PursuitHolder = (props) => (
    <div className='pursuitholder-container'
        key={props.name}
        onClick={() => props.onPursuitToggle(props.value)}
        style={props.isSelected ?
            { color: 'blue', borderBottom: '4px solid blue' }
            : null}
    >
        <h4>  {props.name}  </h4>
        {props.numEvents ?
            <p>
                {props.numEvents}
                {props.numEvents === 1 ? ' Post' : ' Posts'}
            </p>
            : <br></br>}
    </div>
);

export default withRouter(PursuitHolder);