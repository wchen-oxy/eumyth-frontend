import ShortHeroText from 'components/post/viewer/sub-components/short-text';
import React from 'react';
import { returnFormattedDistance } from 'utils/constants/ui-text';
import { returnUserImageURL } from 'utils/url';

class UserFeedItem extends React.Component {
    constructor(props) {
        super(props);
        this.state = {

        }
    }

    render() {
        return (
            <div className='userfeeditem-user'>
                <div className='userfeeditem-upper-main'>
                    <div className='userfeeditem-upper-top'>
                        <h3>{returnFormattedDistance(this.props.distance)}</h3>
                    </div>
                    <div className='userfeeditem-upper-bottom'>

                        <div className='userfeeditem-upper-left'>
                            <div className='userfeeditem-photo'>
                                <a href={'/u/' + this.props.username}>
                                    <img src={returnUserImageURL(this.props.displayPhoto)} />
                                </a>
                            </div>
                            <div className='postheader-meta'>
                                <a href={'/u/' + this.props.username}><h3>{this.props.username}</h3></a>
                                <p>{this.props.first_name}</p>
                            </div>

                        </div>
                        <div className='userfeeditem-upper-right'>
                            <h3>Pursues</h3>
                            {this.props.other_pursuits.map(pursuit => <p>{pursuit.name}</p>)}
                        </div>
                    </div>

                </div>
                <div className='userfeeditem-lower-main'>
                    {/* <ShortHeroText

                    /> */}

                </div>
            </div>

        );
    }

}

export default UserFeedItem;