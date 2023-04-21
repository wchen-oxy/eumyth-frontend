import React from 'react';
import { COLLAPSED } from 'utils/constants/flags';
import CaptionText from './sub-components/caption-text';
import UserHeader from './sub-components/user-header';
import ShortHeroText from './sub-components/short-text';
import Thread from './sub-components/thread';
import { returnFormattedDate } from 'utils/constants/ui-text';
import WithImageInline from './with-image-inline';

const ShortPostInlineContent = (props) => {
    const date = props.meta.date ? returnFormattedDate(props.meta.date) : null;
    if (props.hasImages) {
        return (
            <WithImageInline
                date={date}
                annotations={props.annotations}
                meta={props.meta}
                caption={props.caption}
                user={props.user}
                renderImageSlider={props.renderImageSlider}
                renderComments={props.renderComments}
                onModalLaunch={props.onModalLaunch}
                windowWidth={props.windowWidth}

            />
        );
    }
    else {
        return (
            <div className='shortpostviewer-inline'>
                <div className='shortpostviewer-inline-hero' >
                    <div className='shortpostviewer-inline-side'>
                        <Thread {...props.meta} />
                    </div>

                    <div className='shortherotext-title-container'>
                        {props.caption.title && <h2>{props.caption.title}</h2>}
                    </div>

                    <div className='shortpostviewer-secondary-header'>
                        <UserHeader
                            {...props.user}
                        />
                        <div className="shortpostviewer-date">
                            {date && <h4>{date.month}, {date.day}, {date.year} </h4>}
                        </div>
                    </div>
                    <div className='shortpostviewer-inline-hero'>
                        <ShortHeroText  {...props.caption} />
                    </div>
                </div>
                <div className="shortpostviewer-inline-comments">
                    {props.renderComments(COLLAPSED)}
                </div>
            </div>
        )

    }
}

export default ShortPostInlineContent;