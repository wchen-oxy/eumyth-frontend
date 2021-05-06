import React from 'react';
import TextContainer from "./sub-components/text-container";
import ImageSlider from '../../image-carousel';
import { returnUserImageURL } from "../../constants/urls";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "./short-re-editor.scss";

const adjustURLS = (inputArray) => (
    inputArray.map((url) => returnUserImageURL(url))
)

const ShortReEditor = (props) => {
    const renderTextContainer = () => (
        <TextContainer
            validFilesLength={props.eventData.image_data.length}
            isPaginated={props.isPaginated}
            onPaginatedChange={props.onPaginatedChange}
            onTextChange={props.onTextChange}
            textPageText={props.textData}
            imageIndex={props.imageIndex}
        />
    );

    if (!props.eventData.image_data.length) {
        return (
            renderTextContainer()
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
            <div className="shortreeditor-main-container">
                <div className="shortreeditor-hero-container">
                    <ImageSlider
                        disableAnnotations={true}
                        onIndexChange={props.onIndexChange}
                        imageArray={newArray}
                    />

                </div>
                <div className="shortreeditor-side-container">
                    {renderTextContainer()}
                </div>
            </div>

        );
    }
}

export default ShortReEditor;