import React from 'react';
import { capitalizeFirstLetter } from 'utils/constants/ui-text';

const PursuitObject = (props) => {
    return (
        <div
            className={props.isSelected ? 'pursuitobject-selected' : 'pursuitobject-unselected'}
            onClick={() => props.onSelect(props.index)}>
            <div className='pursuitobject-pursuit'>
                <h4 key={props.index}>
                    {capitalizeFirstLetter(props.pursuit.name.toLowerCase())}
                    &nbsp;

                </h4>
                {!props.isSelected &&
                    <div className='pursuitobject-num-posts-unselected'>
                        <p> {props.pursuit.num_posts} Posts</p>
                    </div>
                }
            </div>
            {
                props.isSelected &&
                <div className='pursuitobject-meta-selected'>
                    <div
                        id='pursuitobject-num-posts'
                        className='pursuitobject-thread-container'>
                        <div className='pursuitobject-num-posts-selected'>
                            <p>Posts</p>
                        </div>
                        <p>
                            {props.pursuit.num_posts}
                        </p>
                    </div>
                    <div className='pursuitobject-thread-container'>
                        <p className='pursuitobject-thread-title'>
                            Showing a Post From
                        </p>
                        <p className='pursuitobject-thread'>
                            {props.thread}
                        </p>
                    </div>
                </div>
            }
        </div >
    )
}

export default PursuitObject;