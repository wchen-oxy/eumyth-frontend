import React from 'react';
import { capitalizeFirstLetter } from 'utils/constants/ui-text';

const PursuitObject = (props) => {
    console.log(props.pursuit);
    return (
        <div>
            <p className={'pursuitobject-pursuit'} key={props.index}>
                {capitalizeFirstLetter(props.pursuit.name.toLowerCase())}
                &nbsp;
                <span className='pursuitobject-num-posts'>
                    {props.pursuit.num_posts} Posts
                </span>
            </p>
        </div>
    )
}

export default PursuitObject;