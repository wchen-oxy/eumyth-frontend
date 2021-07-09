import React from 'react';
import "./short-text.scss";

const ShortHeroText = (props) => {
    const heroText = (
        props.isPaginated && props.textData ?
            <pre>{props.textData[props.index]}</pre> : <pre>{props.textData}</pre>);

    console.log(props.isPaginated && props.textData)
    if (props.length < 1000) {
        return (
            <div id="tiny-amount-text-container">
                {heroText}
            </div>
        )
    }
    else {
        return (
            <div id="medium-amount-text-container">
                {heroText}
            </div>
        )
    }
}

export default ShortHeroText;