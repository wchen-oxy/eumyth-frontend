import React from "react";
import './caption-text.scss'

const CaptionText = (props) => {
    if (props.needsSideCaption)
        return (
            <div className="captiontext-text-container">
                <h2>{props.title}</h2>
                <p>{props.isPaginated && props.textData ?
                    props.textData[props.index] : props.textData}</p>
            </div>
        )
        else{
            return null;
        }
}

export default CaptionText;