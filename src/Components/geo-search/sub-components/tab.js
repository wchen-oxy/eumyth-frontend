import EventController from 'components/timeline/timeline-event-controller';
import React from 'react';
import AxiosHelper from 'utils/axios';
import { SPOTLIGHT_POST } from 'utils/constants/flags';
import { returnUserImageURL } from 'utils/url';
import './tab.scss';

class Tab extends React.Component {
    _isMounted = false;
    constructor(props) {
        super(props);
        this.state = {
            isLoaded: false,
            content: { upper: null, lower: null }
        }
        this.returnPosts = this.returnPosts.bind(this);
        this.returnProject = this.returnProject.bind(this);
        this.setContent = this.setContent.bind(this);
    }

    componentDidMount() {
        this._isMounted = true;
        const content = this.props.user.pursuits[0];
        const extraPostContent = content.posts.length > 1 ? content.posts[1].content_id : null;
        const postContent = content.posts.length > 0 ? content.posts[0].content_id : null;
        const projectContent = content.projects.length > 0 ? content.projects[0].content_id : null;
        const postArray = [];
        const contentObj = this.state.content;

        if (projectContent) {
            contentObj['upper'] = projectContent;
        }
        if (postContent) {
            contentObj['lower'] = postContent;
            postArray.push(postContent);
        }
        else {
            if (extraPostContent) {
                contentObj['upper'] = extraPostContent;
                postArray.push(extraPostContent);
            }
        }

        if (this._isMounted && postArray.length > 0) {
            if (projectContent) {
                console.log(projectContent);
                return Promise
                    .all([
                        this.returnPosts(postArray),
                        this.returnProject(projectContent)
                    ])
                    .then(results => {
                        const data = results[1].data;
                        this.setContent(results[0], data)
                    });
            }
            else {
                return this.returnPosts(postArray)
                    .then(result => this.setContent(result));
            }
        }
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    setContent(content, project) {
        this.setState({
            content,
            project,
            isLoaded: true
        })
    }

    returnPosts(postArray) {
        return AxiosHelper
            .returnMultiplePosts(postArray, false)
            .then(results => {
                const content = this.state.content;
                results.data.posts.forEach(item => {
                    switch (item._id) {
                        case (content['upper']):
                            content['upper'] = item;
                            break;
                        case (content['lower']):
                            content['lower'] = item;
                            break;
                        default:
                            throw new Error('Something Went Wrong');
                    }
                });
                return content;
            });
    }

    returnProject(id) {
        return AxiosHelper
            .returnProject(id)
            .then(results => {
                console.log(results);
            })
    }

    render() {
        return (
            <div key={this.props.user._id} className='tab-container'>
                <div className='tab-profile-photo-container'>
                    <img src={returnUserImageURL(this.props.user.small_cropped_display_photo_key)}></img>
                </div>
                <h3>{this.props.user.first_name + " " + this.props.user.last_name}</h3>
                <div>
                    {this.state.content.upper &&
                        <EventController
                            isRecentEvents={false}
                            contentType={SPOTLIGHT_POST}
                            key={'First Post'}
                            eventData={this.state.content.upper}
                            onEventClick={this.props.onEventClick}
                        />}
                    {this.state.content.lower &&
                        <EventController
                            isRecentEvents={false}
                            contentType={SPOTLIGHT_POST}
                            key={"Second Post"}
                            eventData={this.state.content.lower}
                            onEventClick={this.props.onEventClick}
                        />}
                </div>
            </div>
        )
    }
}

export default Tab;