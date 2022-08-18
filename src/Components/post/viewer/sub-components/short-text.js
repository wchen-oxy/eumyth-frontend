import React from 'react';

const ShortHeroText = (props) => {
    const styleType = props.length < 1000 ? 'tiny-amount-text-container' : 'medium-amount-text-container';
    const heroText = (
        props.isPaginated && props.textData ?
            <pre>{props.textData[props.index]}</pre> : <pre>{props.textData}</pre>);

    return (
        <div>
            <div id='shortherotext-title-container'>
                <h2>{props.title}</h2>
            </div>
            <div id={styleType}>
                {heroText}
            </div>
        </div>

    )

}

export default ShortHeroText;