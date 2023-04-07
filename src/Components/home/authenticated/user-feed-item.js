import React from 'react';
import PostController from "components/post/index";
import { returnFormattedDistance } from 'utils/constants/ui-text';
import { returnUserImageURL } from 'utils/url';
import PursuitObject from './sub-components/pursuit-object';
import AxiosHelper from 'utils/axios';



class UserFeedItem extends React.Component {
    constructor(props) {
        super(props);
        // const user = this.props.content;
        // let pursuits = user.pursuits;
        console.log(this.props.content);
        this.state = {
            thread: null,
            matchedIndex: this.props.content.matched_pursuit_index[0],
            selected: this.props.content.matched_pursuit_index[0],

            // pursuits: user.pursuits,
            altData: null,
            // altThread: null,

        }
        this.intermSaveProjectPreview = this.intermSaveProjectPreview.bind(this);
        this.handlePursuitClick = this.handlePursuitClick.bind(this);
        this.getTitle = this.getTitle.bind(this);
    }

    intermSaveProjectPreview(data) {
        // if (this.state.selected === this.state.matchedIndex) {
        //     this.setState({ thread: data.title })

        // }
        // else {
        //     this.setState({ altThread: data.title })
        // }
        this.setState({ thread: data.title })

        this.props.viewerFunctions.saveProjectPreview(data);
    }

    handlePursuitClick(selected, numPosts) {
        if (numPosts === 0) {
            this.setState({ selected });
        }
        else {
            // if (this.state.selected === this.state.matchedIndex) {
            //     this.setState({
            //         selected
            //     })
            // }
            // else {
            return AxiosHelper.retrievePost(this.props.content.pursuits[selected].posts[0])
                .then(result => {
                    this.setState({
                        selected,
                        altData: result.data
                    })
                })
        }

        // }
    }

    getTitle(map, id) {
        console.log();
        if (id) {
            return map[id]?.title;
        }
        return null;
    }

    render() {
        const user = this.props.content;
        const data = this.state.selected === this.state.matchedIndex ?
            this.props.data : this.state.altData;
        const thread = this.getTitle(this.props.projectPreviewMap, data?.project_preview_id ?? null)
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
                            {user.pursuits
                                .map((item, index) => {
                                    if (index !== 0)
                                        return (
                                            <PursuitObject
                                                thread={thread}
                                                pursuit={{
                                                    name: item.name,
                                                    num_posts: item.num_posts
                                                }}
                                                index={index}
                                                isSelected={index === this.state.selected}
                                                onSelect={this.handlePursuitClick}
                                            />)
                                }
                                )
                            }
                        </div>
                    </div>
                </div>
                {!data && <p>No Posts Available to Show</p>}
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