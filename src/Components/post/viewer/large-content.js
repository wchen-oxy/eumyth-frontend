import React from 'react';
import { EXPANDED } from 'utils/constants/flags';
import ActivityButtons from './sub-components/activity-buttons';
import CaptionText from './sub-components/caption-text';
import MetaInfo from './sub-components/meta-info';
import ShortHeroText from './sub-components/short-text';

const ShortPostLargeContent = (props) => {
    console.log(props.meta);
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
                            {...props.meta}
                        />
                        <CaptionText
                            needsSideCaption
                            {...props.caption}
                        />
                        <ActivityButtons
                            {...props.header}
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
                    {...props.meta}
                />
                <CaptionText  {...props.caption} />
                <div className='shortpostviewer-large-hero-text'>
                    <ShortHeroText
                        {...props.caption} />
                    <ActivityButtons
                        {...props.header}

                        {...props.activityFunctions}
                    />
                </div>

                {props.renderComments(EXPANDED)}
            </div>
        );
    }
}

export default ShortPostLargeContent;