import React from 'react';
import { COLLAPSED } from 'utils/constants/flags';
import CaptionText from './sub-components/caption-text';
import UserHeader from './sub-components/user-header';
import Thread from './sub-components/thread';

const WithImageInline = (props) => {
    if (props.windowWidth > 600) {
        return (
            <div className='shortpostviewer-inline' onClick={props.onModalLaunch}>
                <div className='shortpostviewer-inline-hero'   >
                    <div className='shortpostviewer-inline-side'>
                        <Thread {...props.meta} />
                    </div>
                    <div className='shortpostviewer-inline-header'>
                        <div className="">
                            {props.date && <h4>{props.date.month}, {props.date.day}, {props.date.year} </h4>}
                        </div>
                        <UserHeader
                            {...props.user}
                        />
                    </div>

                    <div className='shortherotext-title-container'>
                        {props.caption.title &&
                            <h2 className="shortpostviewer-title"> {props.caption.title}</h2>}
                    </div>

                    {/* <MetaInfo
                        {...props.meta}
                    /> */}


                    {props.annotations && props.renderImageSlider(COLLAPSED, props.windowWidth)}
                    <CaptionText
                        {...props.caption} />
                </div>
                {props.renderComments(COLLAPSED)}
            </div>
        )
    }
    else {
        return (
            <p>page too small</p>)
    }
}

export default WithImageInline;