import EventController from 'components/timeline/timeline-event-controller';
import React from 'react';
import AxiosHelper from 'utils/axios';
import { ALL, PROJECT, SPOTLIGHT_POST } from 'utils/constants/flags';
import { returnUserImageURL } from 'utils/url';
import { returnFormattedDistance } from 'utils/constants/ui-text';
import withRouter from 'utils/withRouter';

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
        const postContent = content.posts.length > 0 ? content.posts[0].content_id : null;
        const extraPostContent = content.posts.length > 1 ? content.posts[1].content_id : null;
        const projectContent = content.projects.length > 0 ? content.projects[0].content_id : null;
        const postArray = [];

        if (postContent) {
            postArray.push(postContent);
        }
        if (!projectContent && extraPostContent) {
            postArray.push(extraPostContent);
        }

        if (this._isMounted && postArray.length > 0) {
            if (projectContent) {
                return Promise
                    .all([
                        this.returnProject(projectContent),
                        AxiosHelper.retrievePost(postContent, false)
                            .then(result => result.data)
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
        const contentObj = this.state.content;
        if (!containsProject) {
            if (content.length === 1) {
                contentObj['upper'] = content[0];
            }
            if (content.length === 2) {
                contentObj['upper'] = content[0];
                contentObj['lower'] = content[1];
            }
        }
        else {
            contentObj['upper'] = content[0];
            contentObj['lower'] = content[1];
        }


        this.setState({
            content: contentObj,
            containsProject,
            isLoaded: true
        })
    }

    returnPosts(postArray) {
        return AxiosHelper
            .returnMultiplePosts(postArray, false)
            .then(results => results.data.posts)
        // .then(results => {
        //     const content = this.state.content;
        //     results.data.posts.forEach(item => {
        //         switch (item._id) {
        //             case (content['upper']):
        //                 content['upper'] = item;
        //                 break;
        //             case (content['lower']):
        //                 content['lower'] = item;
        //                 break;
        //             default:
        //                 throw new Error('Something Went Wrong');
        //         }
        //     });
        //     return content;
        // });
    }

    returnProject(id) {
        return AxiosHelper
            .returnSingleProject(id)
            .then(result => result.data.project);

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

    handleProjectClick(project) {
        window.open("/c/" + project._id);
    }

    render() {
        const distanceText = returnFormattedDistance(this.props.user.distance);
        let count = 0;
        for (const pursuitObject of this.props.user.pursuits) {
            if (pursuitObject.name !== ALL && this.props.pursuits.includes(pursuitObject.name)) {
                count++;
            }
        }
        return (
            <div key={this.props.user._id}
                className='tab'>
                <div className='tab-dp'>
                    <img src={returnUserImageURL(this.props.user.small_cropped_display_photo_key)}></img>
                </div>
                <a href={'/u/' + this.props.user.username}><h3>{this.props.user.first_name + " " + this.props.user.last_name}</h3></a>
                <div className='tab-meta'>
                    {distanceText && <p>{distanceText}</p>}
                    {count !== 0 && <p>Shares {count} {count > 1 ? 'Pursuits With You' : 'Pursuit With You'} </p>}
                </div>

                <h4>Recent Work</h4>
                <div className='tab-event'>
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

export default withRouter(Tab);