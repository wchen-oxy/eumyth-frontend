import React from 'react';
import Annotation from 'react-image-annotation';
import TextareaAutosize from 'react-textarea-autosize';
import ImageControls from './sub-components/image-controls';
import { EXPANDED, COLLAPSED } from 'utils/constants/flags';
import './custom-image-slider.scss';

const returnStyleName = (windowType) => {
    if (windowType === EXPANDED) {
        return 'customimageslider-hero-container customimageslider-expanded'
    }
    else {
        return 'customimageslider-hero-container'
    }
}

class CustomImageSlider extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            annotation: {}
        }

        this.activeAnnotationComparator = this.activeAnnotationComparator.bind(this);
        this.onAnnotationChange = this.onAnnotationChange.bind(this);
        this.onAnnotationSubmit = this.onAnnotationSubmit.bind(this);
        this.renderEditor = this.renderEditor.bind(this);
        this.renderPromptOverlay = this.renderPromptOverlay.bind(this);
    }

    onAnnotationChange(annotation) {
        this.setState({ annotation })
    }

    onAnnotationSubmit(annotation) {
        this.setState({ annotation: {} },
            this.props.onAnnotationSubmit(annotation));
    }

    renderEditor(props) {
        const { geometry } = props.annotation
        if (!geometry) return null
        return (
            <div
                style={{
                    background: 'white',
                    borderRadius: 3,
                    position: 'absolute',
                    zIndex: 9999,
                    left: `${geometry.x}%`,
                    top: `${geometry.y + geometry.height}%`,
                }}
            >
                <div>Custom Editor</div>
                <TextareaAutosize
                    onChange={e => props.onChange({
                        ...props.annotation,
                        data: {
                            ...props.annotation.data,
                            text: e.target.value
                        }
                    })}
                />
                <button onClick={props.onSubmit}>Comment</button>
            </div>
        )
    }

    renderPromptOverlay() {
        return (
            <div
                style={{
                    background: 'rgba(0, 0, 0, 0.3)',
                    color: 'white',
                    padding: 5,
                    pointerEvents: 'none',
                    position: 'absolute',
                    top: 5,
                    left: 5
                }} >
                Click and Drag to create an annotation!
            </div>
        );
    }

    activeAnnotationComparator(a, b) {
        return a.data.id === b
    }

    render() {
        let annotations = !this.props.hideAnnotations && !this.props.annotateButtonPressed
            ? this.props.annotations : [];
        return (
            <>
                <div className={this.props.newPost ?
                    'customimageslider-new-post-hero-container'
                    : returnStyleName(this.props.windowType)}>
                    <Annotation
                        src={this.props.imageArray[this.props.imageIndex]}
                        alt='Image Display Goes Here'
                        activeAnnotations={this.props.activeAnnotations}
                        annotations={annotations}
                        disableOverlay={this.props.hideAnnotations
                            || !this.props.visitorProfilePreviewID
                        }
                        disableAnnotation={this.props.windowType === COLLAPSED
                            || !this.props.visitorProfilePreviewID
                        }
                        value={this.state.annotation}
                        renderEditor={this.renderEditor}

                        activeAnnotationComparator={this.activeAnnotationComparator}
                        onChange={this.onAnnotationChange}
                        onSubmit={this.onAnnotationSubmit}
                    />
                </div>
                {this.props.showPromptOverlay && (<p>Click on a point in the image and drag!</p>)}
                <ImageControls
                    imageArray={this.props.imageArray}
                    windowType={this.props.windowType}
                    areAnnotationsHidden={this.props.areAnnotationsHidden}
                    onArrowPress={this.props.handleArrowPress}
                    toggleAnnotations={this.props.toggleAnnotations}
                />
            </>
        )
    }
}

export default CustomImageSlider;