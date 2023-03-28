import React from 'react';
import withRouter from 'utils/withRouter';

const PursuitHolder = (props) => (
    <div className={props.isSelected ?
        'pursuitholder-container-selected'
        : 'pursuitholder-container'
    }
        key={props.name}
        onClick={() => props.onPursuitToggle(props.value)}
    >
        <h4>  {props.name}  </h4>
        {props.numEvents ?
            <p>
                {props.numEvents}
                {props.numEvents === 1 ? ' Post' : ' Posts'}
            </p>
            : <p>0 Posts</p>}
    </div>
);

export default withRouter(PursuitHolder);