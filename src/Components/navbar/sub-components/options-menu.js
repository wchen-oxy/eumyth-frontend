import React from 'react';
import { Link } from 'react-router-dom';
import { withFirebase } from 'store/firebase';

const OptionsMenu = (props) => {


    if (!props.showMenu) {
        return null;
    }
    else
        return (
            <div id='optionsmenu-dropdown'>
                {props.shouldHideFriendsTab ?
                    null
                    :
                    <div
                        className='optionsmenu-dropdown-inner'
                        onClick={() => props.closeModal()}
                    >
                        <Link to={'/account'}>Edit Your Profile</Link>
                    </div>
                }

                <div className='optionsmenu-dropdown-inner'>
                    <button onClick={() => {
                        props.closeModal();
                        props.firebase.doSignOut();
                    }}>
                        <h4>Sign Out</h4>
                    </button>
                </div>
            </div>

        );
}

export default withFirebase(OptionsMenu);