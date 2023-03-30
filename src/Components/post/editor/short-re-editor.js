import React from 'react';
import TextContainer from './sub-components/text-container';
import { returnUserImageURL } from '../../../utils/url';
import CustomImageSlider from '../../image-carousel/custom-image-slider';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

const adjustURLS = (inputArray) => (
    inputArray.map((url) => returnUserImageURL(url))
)

const ShortReEditor = (props) => {
    if (!props.eventData.image_data.length) {
        return (
            <TextContainer
                validFilesLength={props.eventData.image_data.length}
                isPaginated={props.isPaginated}
                onPaginatedChange={props.onPaginatedChange}
                onTextChange={props.onTextChange}
                tempText={props.tempText}
                imageIndex={props.imageIndex}
            />
        );
    }
    else {
        let images = props.eventData.image_data;
        let newArray = [];
        if (props.eventData.image_data.length > 0) {
            newArray = images;
            newArray = adjustURLS(newArray);
        }

        return (
            <div id='shortreeditor-main'>
                <div id='shortreeditor-hero'
                    className='short-post-hero-image-container'
                >
                    <CustomImageSlider
                        isReEdit
                        hideAnnotations
                        onArrowPress={props.onArrowPress}
                        imageIndex={props.imageIndex}
                        imageArray={newArray}
                    />
                </div>
                <div id='shortreeditor-side' className='short-post-side-container'>
                    <TextContainer
                        validFilesLength={props.eventData.image_data.length}
                        isPaginated={props.isPaginated}
                        onPaginatedChange={props.onPaginatedChange}
                        onTextChange={props.onTextChange}
                        tempText={props.tempText}
                        imageIndex={props.imageIndex}
                    />
                </div>
            </div>

        );
    }
}

export default ShortReEditor;