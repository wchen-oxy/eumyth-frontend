import EventController from 'components/timeline/timeline-event-controller';
import React from 'react';
import AxiosHelper from 'utils/axios';
import { PROJECT, SPOTLIGHT_POST } from 'utils/constants/flags';
import { returnUserImageURL } from 'utils/url';
import { useNavigate } from "react-router-dom";

import './tab.scss';

//FIXME The project is not being used

class Tab extends React.Component {
    _isMounted = false;
    constructor(props) {
        super(props);
        this.state = {
            isLoaded: false,
            content: { upper: null, lower: null },
            containsProject: false
        }
        this.returnPosts = this.returnPosts.bind(this);
        this.returnProject = this.returnProject.bind(this);
        this.setContent = this.setContent.bind(this);
        this.renderUppercontent = this.renderUppercontent.bind(this);
        this.handleProjectClick = this.handleProjectClick.bind(this);
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
                return Promise
                    .all([
                        this.returnPosts([contentObj['lower']]),
                        this.returnProject(contentObj['upper'])
                    ])
                    .then(results => {
                        this.setContent(results, true)
                    });
            }
            else {
                return this.returnPosts(postArray)
                    .then(result => this.setContent(result, false));
            }
        }
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    setContent(content, containsProject) {

        this.setState({
            content,
            containsProject,
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
            .returnSingleProject(id)
            .then(results => results.project)
    }

    renderUppercontent() {
        if (this.state.containsProject) {
            return (
                < EventController
                    isRecentEvents={false}
                    contentType={PROJECT}
                    key={'Project'}
                    eventData={this.state.content.upper}
                    onProjectClick={this.handleProjectClick}
                />)
        }
        return (
            < EventController
                isRecentEvents={false}
                contentType={SPOTLIGHT_POST}
                key={'First Post'}
                eventData={this.state.content.upper}
                onEventClick={this.props.onEventClick}
            />)
    }

    handleProjectClick(project){
        let navigate = useNavigate();
        navigate("/c/" + project._id, { replace: false });
    }

    render() {

        return (
            <div key={this.props.user._id} className='tab-container'>
                <div className='tab-profile-photo-container'>
                    <img src={returnUserImageURL(this.props.user.small_cropped_display_photo_key)}></img>
                </div>
                <a href={'/u/' + this.props.user.username}><h3>{this.props.user.first_name + " " + this.props.user.last_name}</h3></a>
                <div className='tab-event-container'>

                    {this.state.content.upper &&
                        this.renderUppercontent()
                    }
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