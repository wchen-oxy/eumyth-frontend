import React from 'react';

const Arrow = (props) => {
    const { className, style, onClick } = props;
    return (
        <div
            className={className}
            style=
            {
                props.direction === 'left' ?
                    {
                        ...style,
                        display: 'block',
                        left: '5%',
                        zIndex: '1',
                        color: 'brown'
                    } :
                    {
                        ...style,
                        display: 'block',
                        right: '5%',
                        zIndex: '1'
                    }
            }
            onClick={onClick}
        />
    );
}

export default Arrow;