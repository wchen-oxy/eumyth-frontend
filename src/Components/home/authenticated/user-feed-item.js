import ShortHeroText from 'components/post/viewer/sub-components/short-text';
import React from 'react';
import PostController from "components/post/index";
import { getDistance } from 'utils';
import { returnFormattedDistance } from 'utils/constants/ui-text';
import { returnUserImageURL } from 'utils/url';

const _reorder = (unordered, matched) => {
    let ordered = [];
    for (const index of matched) {
        const item = unordered.splice(index, 1, null)[0];
        ordered.unshift(item);
    }
    ordered = ordered.concat(unordered.filter(item => item !== null));
    return ordered;
}

class UserFeedItem extends React.Component {
    constructor(props) {
        super(props);

    }


    render() {
         const data = this.props.data;
        const user = this.props.content;
        const pursuits = user.pursuits
            .map(item => item.name);
        pursuits[0] = null;
        const orderedPursuits = _reorder(pursuits, user.matched_pursuit_index);
        return (
            <div className='userfeeditem-user'>
                <div className='userfeeditem-upper-main'>
                    <div className='userfeeditem-upper-top'>
                        <h3>{returnFormattedDistance(user.distance)}</h3>
                    </div>
                    <div className='userfeeditem-upper-bottom'>

                        <div className='userfeeditem-upper-left'>
                            <div className='userfeeditem-photo'>
                                <a href={'/u/' + user.username}>
                                    <img src={returnUserImageURL(user.displayPhoto)} />
                                </a>
                            </div>
                            <div className='postheader-meta'>
                                <a href={'/u/' + user.username}><h3>{user.username}</h3></a>
                                <p>{user.first_name}</p>
                            </div>

                        </div>
                        <div className='userfeeditem-upper-right'>
                            <h3>Pursues</h3>
                            {orderedPursuits.map((pursuit, index) => <p key={pursuit + index}>{pursuit}</p>)}
                        </div>
                    </div>

                </div>
                <div className='userfeeditem-lower-main'>
                    {data &&
                        <PostController
                            isViewer
                            key={data._id}
                            largeViewMode={true}
                            textData={data.text_data}
                            viewerObject={{
                                ...this.props.viewerObject,
                                eventData: data
                            }}
                            viewerFunctions={this.props.viewerFunctions}
                            authUser={this.props.authUser}
                        />}

                </div>
            </div>

        );
    }

}

export default UserFeedItem;