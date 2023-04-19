import React from 'react';

import { returnFormattedDate } from 'utils/constants/ui-text';

const HeaderObject = (props) => {
    const date = returnFormattedDate(props.updatedAt);
    return (
        <div className='headerobject'>
            <div className='headerobject-cover'>
               {props.cover && <img alt='cover' src={props.cover}/> }
            </div>
            <div className='headerobject-text'>
                <h2>{props.title}</h2>
                <p>Last Updated at {date.month} {date.day}, {date.year}</p>
                {props.overview ? <p>{props.overview}</p> : null}
                {props.labels ? <p>{props.labels}</p> : null}
            </div>
        </div>
    )
}

export default HeaderObject;