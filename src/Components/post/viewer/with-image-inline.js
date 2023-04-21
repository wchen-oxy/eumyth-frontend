import React from 'react';
import { COLLAPSED } from 'utils/constants/flags';
import UserHeader from './sub-components/user-header';
import Thread from './sub-components/thread';

const WithImageInline = (props) => {
    if (props.windowWidth > 600) {
        return (
            <div className='shortpostviewer-inline'>
                <div className='shortpostviewer-inline-hero'   >
                    <div className='shortpostviewer-inline-side'>
                        <Thread {...props.meta} />
                    </div>

                    <div className='shortherotext-title-container'>
                        {props.caption.title &&
                            <h2 className="shortpostviewer-title"> {props.caption.title}</h2>}
                    </div>
                    <div className='shortpostviewer-secondary-header'>
                        <UserHeader
                            {...props.user}
                        />
                        <div className="shortpostviewer-date">
                            {props.date && <h4>{props.date.month}, {props.date.day}, {props.date.year} </h4>}
                        </div>

                    </div>

                    {/* <MetaInfo
                        {...props.meta}
                    /> */}


                    {props.annotations && props.renderImageSlider(COLLAPSED, props.windowWidth)}
                    <p>{props.caption.isPaginated && props.caption.textData ?
                        props.caption.textData[props.caption.imageIndex] : props.caption.textData}</p>
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