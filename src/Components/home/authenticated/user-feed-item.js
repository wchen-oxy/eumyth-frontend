import React from 'react';
import PostController from "components/post/index";
import { returnFormattedDistance } from 'utils/constants/ui-text';
import { returnUserImageURL } from 'utils/url';
import PursuitObject from './sub-components/pursuit-object';

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

    render() {
        const data = this.props.data;
        const user = this.props.content;
        const pursuits = user.pursuits
            .map(item => {
                return {
                    name: item.name,
                    num_posts: item.num_posts
                }
            });
        pursuits[0] = null;
        const orderedPursuits = _reorder(pursuits, user.matched_pursuit_index);
        return (
            <div className='userfeeditem-user'>
                <div className='userfeeditem-upper-main'>
                    <div className='userfeeditem-upper-left'>
                        <div className='userfeeditem-photo'>
                            <a href={'/u/' + user.username}>
                                <img alt='profile' src={returnUserImageURL(user.displayPhoto)} />
                            </a>
                        </div>
                    </div>
                    <div className='userfeeditem-upper-right'>
                        <h3 className='userfeeditem-upper-right-distance'>{user.username} {returnFormattedDistance(user.distance)}</h3>
                        <div className='userfeeditem-upper-right-pursuits'>
                            <h5>Pursuing</h5>
                            {orderedPursuits
                                .map((pursuit, index) =>
                                    <PursuitObject
                                        pursuit={pursuit}
                                        index={index}
                                    />)}
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