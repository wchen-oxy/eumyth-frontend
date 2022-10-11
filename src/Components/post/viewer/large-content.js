import React from 'react';
import { EXPANDED } from 'utils/constants/flags';
import ActivityButtons from './sub-components/activity-buttons';
import CaptionText from './sub-components/caption-text';
import MetaInfo from './sub-components/meta-info';
import ShortHeroText from './sub-components/short-text';

const ShortPostLargeContent = (props) => {
    if (props.hasImages) {
        return (
            <div className='small-post-window'>
                <div id='shortpostviewer-large-hero'
                    className='with-image'>
                    {props.annotations && props.renderImageSlider(EXPANDED)}
                    <div
                        className='shortpostviewer-large-side  short-post-side-container'
                        ref={props.heroRef}
                    >
                        <MetaInfo
                            {...props.metaProps}
                        />
                        <CaptionText
                            needsSideCaption
                            index={props.imageIndex}
                            {...props.textProps} />
                        <ActivityButtons
                             {...props.activityFunctions}
                        />
                    </div>
                </div>
                {props.renderComments(EXPANDED)}
            </div>
        )

    }
    else {
        return (
            <div className='small-post-window'>
                <MetaInfo
                    {...props.metaProps}
                />
                <CaptionText  {...props.textProps} />
                <div className='shortpostviewer-large-hero-text'>
                    <ShortHeroText
                        title={props.title}
                        textData={props.textData} />
                    <ActivityButtons
                         {...props.activityFunctions}
                    />
                </div>

                {props.renderComments(EXPANDED)}
            </div>
        );
    }
}

export default ShortPostLargeContent;