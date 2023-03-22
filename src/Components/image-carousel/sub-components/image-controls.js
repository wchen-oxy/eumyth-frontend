import React from 'react';
import { EXPANDED } from 'utils/constants/flags';

const ImageControls = (props) => {
    return (
        <div>
            {props.imageArray.length > 1 ?
                (<div className='imagecontrols'>
                    <button
                        onClick={(e) => props.onArrowPress(e, -1)}>
                        &lt;
                    </button>
                    <p>{props.imageIndex + 1} of {props.imageArray.length}</p>
                    <button onClick={(e) => props.onArrowPress(e, 1)}>
                        &gt;
                    </button>
                </div>
                )
                : null
            }
            {props.windowType === EXPANDED && !props.editProjectState &&
                <button
                    onClick={props.toggleAnnotations}>
                    {props.areAnnotationsHidden ?
                        'Show Annotations' :
                        'Hide Annotations'
                    }
                </button>
            }
        </div>
    )
}

export default ImageControls;