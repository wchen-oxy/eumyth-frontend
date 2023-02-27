import React from 'react';
import { Link } from 'react-router-dom';
import { TEMP_PROFILE_PHOTO_URL } from 'utils/constants/urls';
import { returnUserImageURL, returnUsernameURL } from 'utils/url';
 
const Header = (props) => {
    const imageURL = props.croppedDisplayPhotoKey ? (
        returnUserImageURL(props.croppedDisplayPhotoKey))
        : (
            TEMP_PROFILE_PHOTO_URL);
    return (
        <div>

            <div id='header-top-title' >
                <h4 className='header-title'>Your Dashboard</h4>
            </div>
            <div
                id='header-profile'
                className='returninguser-main-row'
            >
                <div className='header-profile-column btn-round'
                >
                    <Link
                        to={returnUsernameURL(props.username)}
                    >
                        <img
                            alt=''
                            id='header-dp'
                            src={imageURL}>
                        </img>
                        <div className='header-profile-text'>
                            <p id='header-username-text'>{props.username}</p>
                            <p id='header-name-text'>{props.name.first}</p>
                        </div>
                    </Link>
                </div>
                <div className='header-profile-column'>
                    <div className='header-profile-text'>
                        Total Hours Spent:
                        {Math.floor(props.pursuitObjects?.totalMin ?? 0 / 60)}
                    </div>
                </div>
                <div className='header-profile-column'>
                    <table id='header-pursuit-info-table'>
                        <tbody>
                            <tr>
                                <th></th>
                                <th>Level</th>
                                <th>Minutes Spent</th>
                                <th>Posts</th>
                                <th>Milestones</th>
                            </tr>
                            {props.pursuitObjects?.pursuitInfoArray ?? null}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );

}

export default Header;