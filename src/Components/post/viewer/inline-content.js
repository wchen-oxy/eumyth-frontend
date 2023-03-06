import React from 'react';
import { COLLAPSED } from 'utils/constants/flags';
import CaptionText from './sub-components/caption-text';
import UserHeader from './sub-components/user-header';
import MetaInfo from './sub-components/meta-info';
import ShortHeroText from './sub-components/short-text';
import Thread from './sub-components/thread';

const ShortPostInlineContent = (props) => {
    if (props.hasImages) {
        return (
            <>
                <div
                    className='shortpostviewer-inline-hero'
                    onClick={props.onModalLaunch}
                >
                    <div className='shortpostviewer-inline-side'>
                        <Thread {...props.meta} />
                    </div>

                    <div className='shortherotext-title-container'>
                        {props.caption.title &&
                            <h2 className="shortpostviewer-title"> {props.caption.title}</h2>}
                    </div>
                    <UserHeader
                        {...props.user}
                    />

                    <MetaInfo
                        {...props.meta}
                    />
                    <CaptionText
                        {...props.caption} />

                    {props.annotations && props.renderImageSlider(COLLAPSED)}

                </div>
                {props.renderComments(COLLAPSED)}
            </>
        );
    }
    else {
        return (
            <div onClick={props.onModalLaunch}>
                <div className='shortpostviewer-inline-hero ' >
                    <div className='shortpostviewer-inline-side'>
                        <Thread {...props.meta} />
                    </div>
                    <div className='shortherotext-title-container'>
                        {props.caption.title && <h2>{props.caption.title}</h2>}
                    </div>
                    <UserHeader
                        {...props.user}
                    />
                    <div className='shortpostviewer-inline-side'>
                        <MetaInfo
                            {...props.meta}
                        />
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