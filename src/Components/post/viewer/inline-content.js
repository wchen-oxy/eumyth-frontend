import React from 'react';
import { COLLAPSED } from 'utils/constants/flags';
import CaptionText from './sub-components/caption-text';
import PostHeader from './sub-components/post-header';
import MetaInfo from './sub-components/meta-info';
import ShortHeroText from './sub-components/short-text';

const ShortPostInlineContent = (props) => {
    console.log(props);
    if (props.hasImages) {
        return (
            <>
                <div
                    id='shortpostviewer-inline-hero'
                    onClick={props.onModalLaunch}
                >
                    <PostHeader
                        {...props.header}
                        {...props.user}
                    />
                    <div className='shortpostviewer-inline-side'>
                        {props.caption.title &&
                            <h2 className="shortpostviewer-title"> {props.caption.title}</h2>}
                        <MetaInfo
                            {...props.meta}
                        />

                        <CaptionText
                            {...props.caption} />
                    </div>
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
                        <PostHeader
                            {...props.header}
                            {...props.user}
                        />
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