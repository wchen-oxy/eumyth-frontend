import React from 'react';

const ShortHeroText = (props) => {
     const heroText =
        props.isPaginated && props.textData ?
            props.textData[props.imageIndex] : props.textData;
    const styleType = heroText.length < 1000 ? 'tiny-text' : 'medium-text';


    return (
        <div>
            <div id='shortherotext-title-container'>
                <h2>{props.title}</h2>
            </div>
            <div id={styleType}>
                <pre>{heroText}</pre>
            </div>
        </div>

    )

}

export default ShortHeroText;