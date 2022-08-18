import React from 'react';
import { returnUserImageURL } from 'utils/url';
import { returnFormattedDate } from 'utils/constants/ui-text';

const PostHeader = (props) => {
    const date = props.date ? returnFormattedDate(props.date) : null;
    return (
        <div className='postheader-main-container'>
            <div className='postheader-author-information'>
                <div className='postheader-display-photo-container'>
                    <a href={'/u/' + props.username}>
                        <img src={returnUserImageURL(props.displayPhoto)} />
                    </a>

                </div>
                <div className='postheader-text-information-container'>
                    <a href={'/u/' + props.username}><h4>{props.username}</h4></a>
                    {date && <p>{date.month}, {date.day}, {date.year} </p>}
                </div>
            </div>

        </div>
    )

}

export default PostHeader;