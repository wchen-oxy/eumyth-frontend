import React from 'react';
import { COLLAPSED } from 'utils/constants/flags';
import CaptionText from './sub-components/caption-text';
import UserHeader from './sub-components/user-header';
import ShortHeroText from './sub-components/short-text';
import Thread from './sub-components/thread';
import { returnFormattedDate } from 'utils/constants/ui-text';

const ShortPostInlineContent = (props) => {
    const date = props.meta.date ? returnFormattedDate(props.meta.date) : null;

    if (props.hasImages) {
        return (
            <div className='shortpostviewer-inline' onClick={props.onModalLaunch}>
                <div
                    className='shortpostviewer-inline-hero'

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
                    <div className="">
                        {date && <h4>{date.month}, {date.day}, {date.year} </h4>}
                    </div>

                    {/* <MetaInfo
                        {...props.meta}
                    /> */}
                    <CaptionText
                        {...props.caption} />

                    {props.annotations && props.renderImageSlider(COLLAPSED)}

                </div>
                {props.renderComments(COLLAPSED)}
            </div>
        );
    }
    else {
        return (
            <div className='shortpostviewer-inline' onClick={props.onModalLaunch}>
                <div className='shortpostviewer-inline-hero' >
                    <div className='shortpostviewer-inline-side'>
                        <Thread {...props.meta} />
                    </div>
                    <div className='shortherotext-title-container'>
                        {props.caption.title && <h2>{props.caption.title}</h2>}
                    </div>
                    <UserHeader
                        {...props.user}
                    />
                    <div className="">
                        <p>Date</p>
                        {date && <h4>{date.month}, {date.day}, {date.year} </h4>}
                    </div>
                    {/* <div className='shortpostviewer-inline-side'>
                        <MetaInfo
                            {...props.meta}
                        />
                    </div> */}
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