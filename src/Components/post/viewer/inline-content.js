import React from 'react';
import { COLLAPSED } from 'utils/constants/flags';
import CaptionText from './sub-components/caption-text';
import PostHeader from './sub-components/post-header';
import ShortPostMetaInfo from './sub-components/short-post-meta';
import ShortHeroText from './sub-components/short-text';

const ShortPostInlineContent = (props) => {
    if (props.hasImages) {
        return (
            <>
                <div
                    id='shortpostviewer-inline-hero'
                    className='small-post-window'
                    onClick={props.onModalLaunch}
                >
                    <PostHeader
                        {...props.headerProps}
                    />
                    <div className='shortpostviewer-inline-side'>
                        {props.title &&
                            <h2 className="shortpostviewer-title"> {props.title}</h2>}
                        <ShortPostMetaInfo
                            {...props.metaProps}
                        />

                        <CaptionText
                            index={props.imageIndex}
                            {...props.textProps} />
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
                <div className='shortpostviewer-inline-hero  small-post-window' >
                    <div className='shortpostviewer-inline-side'>
                        <PostHeader
                            {...props.headerProps}
                        />
                        <ShortPostMetaInfo
                            {...props.metaProps}
                        />
                    </div>
                    <div className='shortpostviewer-inline-hero'>
                        {props.title &&
                            <h2 className="shortpostviewer-title"> {props.title}</h2>}
                        <ShortHeroText
                            index={props.imageIndex}
                            isPaginated={props.metaProps.isPaginated}
                            textData={props.textData} />
                    </div>
                </div>
                {props.renderComments(COLLAPSED)}
            </div>
        )

    }
}

export default ShortPostInlineContent;