import React from 'react';
import { EXPANDED } from 'utils/constants/flags';

const ImageControls = (props) => {
    return (
        <div>
            {props.imageArray.length > 1 ?
                (<>
                    <button
                        onClick={() => props.onArrowPress(-1)}>
                        Previous
                    </button>
                    <button onClick={() => props.onArrowPress(1)}>
                        Next
                    </button>
                </>
                )
                : null
            }
            {props.windowType === EXPANDED &&
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