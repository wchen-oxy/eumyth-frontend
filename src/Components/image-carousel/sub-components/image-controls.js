import React from 'react';
import { EXPANDED } from 'utils/constants/flags';

const ImageControls = (props) => {
    return (
        <div>
            {this.props.imageArray.length > 1 ?
                (<>
                    <button
                        onClick={() => this.props.handleArrowPress(-1)}>
                        Previous
                    </button>
                    <button onClick={() => this.props.handleArrowPress(1)}>
                        Next
                    </button>
                </>
                )
                : null
            }
            {props.windowType === EXPANDED &&
                <button
                    onClick={this.props.toggleAnnotations}>
                    {this.props.areAnnotationsHidden ?
                        'Show Annotations' :
                        'Hide Annotations'
                    }
                </button>
            }
        </div>
    )
}

export default ImageControls;