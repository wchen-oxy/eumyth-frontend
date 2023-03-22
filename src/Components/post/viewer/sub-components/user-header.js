import React from 'react';
import { returnUserImageURL } from 'utils/url';

const UserHeader = (props) => {
    return (
        <div className='postheader-author'>
            <div className='postheader-dp'>
                <a href={'/u/' + props.username}>
                    <img alt='profile' src={returnUserImageURL(props.displayPhoto)} />
                </a>
            </div>
            <div className='postheader-meta'>
                <a href={'/u/' + props.username}><h4>{props.username}</h4></a>
            </div>
        </div>
    )

}

export default UserHeader;