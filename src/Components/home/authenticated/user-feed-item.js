import React from 'react';
import PostController from "components/post/index";
import { returnFormattedDistance } from 'utils/constants/ui-text';
import { returnUserImageURL } from 'utils/url';
import PursuitObject from './sub-components/pursuit-object';
import AxiosHelper from 'utils/axios';

const _reorder = (unordered, matched) => {
    let ordered = [];
    for (const index of matched) {
        const item = unordered.splice(index, 1, null)[0];
        ordered.unshift(item);
    }
    // ordered = ordered.concat(unordered.filter(item => item !== null));
    return ordered;
}

class UserFeedItem extends React.Component {
    constructor(props) {
        super(props);
        const user = this.props.content;
        this.state = {
            thread: null,
            selected: 0,
            pursuits: _reorder(user.pursuits, user.matched_pursuit_index),
            altData: null
        }
        this.intermSaveProjectPreview = this.intermSaveProjectPreview.bind(this);
        this.handlePursuitClick = this.handlePursuitClick.bind(this);
    }

    intermSaveProjectPreview(data) {
        this.setState({ thread: data.title })
        this.props.viewerFunctions.saveProjectPreview(data);
    }

    handlePursuitClick(selected) {

        return AxiosHelper.retrievePost(this.state.pursuits[selected][0])
            .then(result => {
                this.setState({
                    selected,
                    altData: result.data
                })
            })
    }

    render() {
        const data = this.state.selected === 0 ? this.props.data : this.state.altData;
        const user = this.props.content;
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
                            {this.state.pursuits
                                .map((item, index) =>
                                    <PursuitObject
                                        thread={this.state.thread}
                                        pursuit={{
                                            name: item.name,
                                            num_posts: item.num_posts
                                        }}
                                        index={index}
                                        isSelected={index === this.state.selected}
                                        onSelect={this.handlePursuitClick}
                                    />)}
                        </div>
                    </div>

                </div>
                {data &&
                    <div className='userfeeditem-lower-main'>
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
                            intermSaveProjectPreview={this.intermSaveProjectPreview}
                            authUser={this.props.authUser}
                        />

                    </div>}
            </div>

        );
    }

}

export default UserFeedItem;