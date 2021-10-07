import React from 'react';
import { withRouter } from 'react-router-dom';
import "./pursuit-holder.scss";

const PursuitHolder = (props) => (
    <div className="pursuitholder-container"
        key={props.name}
        onClick={() => props.onPursuitToggle(props.value)}
        style={props.isSelected ? {backgroundColor: "blue"} : null}
        >
        <h4>  {props.name}  </h4>
        {  props.numEvents ? <p>  Events: {props.numEvents}  </p> : <></>}
    </div>
);

export default withRouter(PursuitHolder);