import React from 'react';
import ProfileModal from '../profile/profile-modal';
import EventController from '../timeline/timeline-event-controller';
import MainDisplay from './main-display';
import TopButtonBar from './sub-components/top-button-bar';
import ProjectReview from './review';
import { returnUsernameURL, returnPostURL, returnProjectURL } from "utils/url";
import { SortableContainer, SortableElement } from 'react-sortable-hoc';
import withRouter from 'utils/withRouter';
import AxiosHelper from 'utils/axios';
import {
    PROJECT_CONTENT_ONLY_VIEW_STATE,
    POST,
    POST_VIEWER_MODAL_STATE,
    PROJECT_EVENT,
    PROJECT_MACRO_VIEW_STATE,
    PROJECT_MICRO_VIEW_STATE,
    PROJECT_REARRANGE_STATE,
    PROJECT_SELECT_VIEW_STATE,
    PROJECT
} from "../../utils/constants/flags";
import "./index.scss";

const MAIN = "MAIN";
const EDIT = "EDIT";
const REVIEW = "REVIEW";
const TITLE = "TITLE";
const OVERVIEW = "OVERVIEW";

const handleIndexUpdate = (index) => {
    index++;
    if (index === 4) return 0;
    else {
        return index;
    }
}

const SortableItem = SortableElement(({ contentType, value, classColumnIndex }) =>
(
    <div className="projectcontroller-event-container">
        <EventController
            columnIndex={classColumnIndex}
            contentType={contentType}
            eventData={value}
            editProjectState={false}
            key={value._id}
            disableModalPreview={true}
        />
    </div>
));

const SortableList = SortableContainer(({ contentType, items, onSortEnd }) => {
    let classColumnIndex = 0;
    return (
        <ul>
            {items.map((value, index) => {
                if (classColumnIndex === 4) classColumnIndex = 0;
                return (
                    <SortableItem
                        key={`item-${index}`}
                        index={index}
                        classColumnIndex={classColumnIndex++}
                        value={value}
                        contentType={contentType}
                        onSortEnd={onSortEnd}
                    />
                )
            })}
        </ul>
    )
});

class ProjectController extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            contentViewOnlyAllPosts: [],
            window: MAIN,
            projectSelectSubState: 1,
            barType: this.props.isContentOnlyView ?
                PROJECT_CONTENT_ONLY_VIEW_STATE : PROJECT_MACRO_VIEW_STATE,
            feedData: [],
            selectedPosts: [],
            semiFinalData: [],
            feedIndex: new Map(),
            title: this.props.content ? this.props.content.title : "",
            overview: this.props.content ? this.props.content?.overview : "",
            selectedProject: this.props.content.post_ids ? {
                _id: this.props.content._id,
                post_ids: this.props.content.post_ids,
                username: this.props.content.username,
                displayPhoto: this.props.content.display_photo_key
            } : null,
            priorProjectID: this.props.priorProjectID ? this.props.priorProjectID : null,
            selectedEventIndex: null,
            hasMore: true,
            isUpdate: false,
            editProjectState: false,
            feedID: 0,
        }

        this.handleBackClick = this.handleBackClick.bind(this);
        this.handleProjectClick = this.handleProjectClick.bind(this);
        this.setNewURL = this.setNewURL.bind(this);
        this.handleEventClick = this.handleEventClick.bind(this);
        this.handleProjectEventSelect = this.handleProjectEventSelect.bind(this);
        this.handleWindowSwitch = this.handleWindowSwitch.bind(this);
        this.handleSortEnd = this.handleSortEnd.bind(this);
        this.handleInputChange = this.handleInputChange.bind(this);
        this.setModal = this.setModal.bind(this);
        this.copyToClipboard = this.copyToClipboard.bind(this);
        this.clearModal = this.clearModal.bind(this);
        this.handleNewProjectSelect = this.handleNewProjectSelect.bind(this);
        this.shouldPull = this.shouldPull.bind(this);
        this.clearLoadedFeed = this.clearLoadedFeed.bind(this);
        this.selectFeedSource = this.selectFeedSource.bind(this);
        this.selectFeedData = this.selectFeedData.bind(this);
        this.onEditExistingProject = this.onEditExistingProject.bind(this);
        this.onSelectAll = this.onSelectAll.bind(this);
        this.createTimelineRow = this.createTimelineRow.bind(this);
        this.createRenderedPosts = this.createRenderedPosts.bind(this);
    }

    createTimelineRow(inputArray, contentType, objectIDs) {
        const feedData = this.state.feedData
            .concat(
                inputArray
                    .sort((a, b) =>
                        objectIDs.indexOf(a._id) - objectIDs.indexOf(b._id))
            );
        this.setState({ feedData });
    }

    createRenderedPosts() {
        const shouldMarkNewPosts = this.state.isUpdate && this.state.projectSelectSubState === 2;
        let masterArray = [[]];
        let index = 0; //index position of array in masterArray
        let k = 0; //length of last array 
        let j = 0;
        let usedPostsLength = this.state.selectedPosts.length;
        while (j < this.state.feedData.length) {
            if (k === 4) {
                masterArray.push([]);
                index++;
                k = 0;
            }
            const event = this.state.feedData[j];
            masterArray[index].push(
                <div key={event._id}>
                    <EventController
                        columnIndex={k}
                        contentType={this.state.barType === PROJECT_MACRO_VIEW_STATE
                            ? PROJECT :
                            PROJECT_EVENT}
                        shouldMarkAsNew={shouldMarkNewPosts ? j < usedPostsLength : false}
                        isSelected={this.state.feedIndex.get(event._id)}
                        editProjectState={this.state.editProjectState}
                        key={j}
                        eventIndex={j}
                        eventData={event}
                        onEventClick={this.handleEventClick}
                        onProjectClick={this.handleProjectClick}
                        onProjectEventSelect={this.handleProjectEventSelect}
                    />
                </div>
            );
            k++;
            j++;
        }
        return masterArray;
    }

    onSelectAll(isSelected) {
        let newFeedIndex = this.state.feedIndex;
        let selectedPosts = [];
        for (const post of this.state.feedData) {
            newFeedIndex.set(post._id, isSelected);
        }
        if (isSelected) {
            selectedPosts = this.state.feedData.map(item => { return { post_id: item._id } });
        }
        console.log(selectedPosts);
        this.setState({ feedIndex: newFeedIndex, selectedPosts });
    }

    onEditExistingProject() {
        const sharedState = {
            barType: PROJECT_SELECT_VIEW_STATE,
            editProjectState: true,
            hasMore: true,
            isUpdate: true,
            feedID: this.state.feedID + 1,
        }
        if (this.props.isContentOnlyView) {
            return AxiosHelper
                .allPosts(this.props.authUser.profileID)
                .then((result => {
                    this.setState({
                        contentViewOnlyAllPosts: { post_ids: result.data.map(item => item.content_id) },
                        ...sharedState
                    },
                        this.clearLoadedFeed)
                }))
                .catch(err => {
                    console.log(err);
                    throw new Error("Nothing returned for all posts");
                })
        }
        else {
            this.setState({
                ...sharedState
            },
                this.clearLoadedFeed)
        }
    }

    clearLoadedFeed() {
        this.setState({
            feedData: [],
            hasMore: true,
            feedID: this.state.feedID + 1
        });
    }

    shouldPull(value) {
        this.setState({ hasMore: value });
    }

    handleBackClick() {
        switch (this.state.barType) {
            case (PROJECT_MICRO_VIEW_STATE): //inner project step
                const username = this.state.selectedProject.username;
                this.setState({
                    newProjectState: false,
                    selectedProject: null,
                    title: '',
                    overview: '',
                    barType: PROJECT_MACRO_VIEW_STATE,
                    hasMore: true,
                    feedID: this.state.feedID + 1,
                }, () => {
                    this.setNewURL(returnUsernameURL(username));
                    this.clearLoadedFeed();
                })
                break;
            case (PROJECT_SELECT_VIEW_STATE): //editting
                if (this.state.isUpdate) {
                    if (this.state.projectSelectSubState === 1) {
                        this.setState({
                            barType: this.props.isContentOnlyView ?
                                PROJECT_CONTENT_ONLY_VIEW_STATE : PROJECT_MICRO_VIEW_STATE,
                            editProjectState: false,
                            selectedPosts: [],
                            isUpdate: false,
                            hasMore: true,
                        }, this.clearLoadedFeed)
                    }
                    else if (this.state.projectSelectSubState === 2) {
                        this.setState({
                            projectSelectSubState: 1,
                            hasMore: true,

                        }, this.clearLoadedFeed)
                    }
                }
                else {
                    this.setState({
                        barType: this.props.isContentOnlyView ?
                            PROJECT_CONTENT_ONLY_VIEW_STATE : PROJECT_MACRO_VIEW_STATE,
                        editProjectState: false,
                        isUpdate: false,
                        hasMore: true,
                    }, this.clearLoadedFeed)
                }
                break;
            case (PROJECT_REARRANGE_STATE):
                this.setState({
                    window: MAIN,
                    barType: PROJECT_SELECT_VIEW_STATE
                })
                break;
            default:
                throw new Error("Nothing Matched");
        }
    }

    setModal(postID) {
        this.props.navigate (returnPostURL(postID), {replace: false});
        this.props.openMasterModal(POST_VIEWER_MODAL_STATE);
    }

    clearModal() {
        const sourceContent = this.props.isContentOnlyView ? this.props.content : this.state.selectedProject;
        this.setState({
            selectedEventIndex: null,
            header: null
        }, () => {
            this.setNewURL(returnProjectURL(sourceContent._id));
            this.props.closeMasterModal();
        });
    }


    handleEventClick(selectedEventIndex) {
        this.setState({
            selectedEventIndex
        }, this.setModal(this.state.feedData[selectedEventIndex]._id))
    }

    handleInputChange(id, value) {
        switch (id) {
            case (TITLE):
                this.setState({ title: value })
                break;
            case (OVERVIEW):
                this.setState({ overview: value })
                break;
            default:
                throw new Error("NO TEXT ID'S Matched in POST")
        }
    }

    handleWindowSwitch(window) {
        let min = 0
        if (window === 2) {
            let newIndex = this.state.feedIndex;
            let selectedPosts = this.state.selectedPosts;
            selectedPosts
                .forEach(item => newIndex.set(item.post_id, true));
            if (!this.state.newProjectState) {
                this.state.selectedProject
                    .post_ids
                    .forEach(item => newIndex.set(item, true));
            }

            return this.setState({
                projectSelectSubState: 2,
                selectedPosts,
                feedIndex: newIndex
            }, this.clearLoadedFeed);
        }

        if (window === EDIT) {
            if (this.state.window === REVIEW) {
                return this.setState({
                    window: window,
                    barType: PROJECT_REARRANGE_STATE
                })
            }
            else {
                const semiFinalData = this.state.feedData.filter(item => this.state.feedIndex.get(item._id));
                return this.setState({
                    semiFinalData,
                    window: window,
                    barType: PROJECT_REARRANGE_STATE
                }, this.clearLoadedFeed);
            }


        }
        else if (window === REVIEW) {
            for (const selectedPost of this.state.selectedPosts) {
                if (selectedPost.min_duration) {
                    min += selectedPost.min_duration;
                }
            }
        }
        this.setState({ window: window, min: min !== 0 ? min : null });
    }

    handleProjectEventSelect(eventData) {
        const feedIndex = this.state.feedIndex;
        if (this.state.projectSelectSubState === 1) {
            const selectedPosts = this.state.selectedPosts;
            feedIndex.set(eventData._id, !feedIndex.get(eventData._id));
            selectedPosts.push({ post_id: eventData._id });
            this.setState({ selectedPosts, feedIndex })
        }
        else if (this.state.projectSelectSubState === 2) {
            feedIndex.set(eventData._id, !feedIndex.get(eventData._id));
            this.setState({ feedIndex })
        }
        else {
            throw new Error("Something weird happened")
        }

    }

    handleSortEnd({ oldIndex, newIndex }) {
        const semiFinalData = this.state.semiFinalData;
        const [reorderedItem] = semiFinalData.splice(oldIndex, 1);
        let index = -1;
        semiFinalData.splice(newIndex, 0, reorderedItem);
        for (let item of semiFinalData) {
            index = handleIndexUpdate(index);
            item.column_index = index;
        }
        this.setState({ semiFinalData });
    }

    setNewURL(projectID) {
        this.props.navigate (projectID, { replace: false });
    }

    handleProjectClick(projectData) {
        this.setState({
            selectedProject: projectData,
            priorProjectID: projectData.ancestors.length > 0
                ? projectData.ancestors[projectData.ancestors.length - 1]
                : null,
            barType: PROJECT_MICRO_VIEW_STATE,
            title: projectData.title,
            overview: projectData.overview
        }, () => {
            this.setNewURL(returnProjectURL(projectData._id));
            this.shouldPull(true);
            this.clearLoadedFeed();
        });
    }

    copyToClipboard() {
        const sourceContent = this.props.isContentOnlyView ? this.props.content : this.state.selectedProject;
        return AxiosHelper.createFork(
            this.props.authUser.profileID,
            this.props.authUser.indexProfileID,
            this.props.authUser.username,
            sourceContent,
            false
        )
            .then((res) => {
                alert("Done!");
            })
            .catch(err => console.log(err));
    }

    handleNewProjectSelect() {
        this.setState({
            barType: PROJECT_SELECT_VIEW_STATE,
            editProjectState: true,
            newProjectState: true,
        },
            this.clearLoadedFeed)
    }

    selectFeedSource() {
    }

    selectFeedData() { //decider for feed Data
        switch (this.state.barType) {
            case (PROJECT_CONTENT_ONLY_VIEW_STATE):
                return this.props.content.post_ids;
            case (PROJECT_MACRO_VIEW_STATE):
                return this.props.content.projects.map((item) => item.content_id);
            case (PROJECT_MICRO_VIEW_STATE):
                return this.state.selectedProject.post_ids;
            case (PROJECT_SELECT_VIEW_STATE):
                if (this.state.isUpdate) {
                    if (this.state.projectSelectSubState === 1) {
                        const feed = this.props.isContentOnlyView ?
                            this.state.contentViewOnlyAllPosts.post_ids
                            : this.props.content.posts.map((item) => item.content_id);
                        return feed.filter(item => !this.state.selectedProject.post_ids.includes(item));
                    }
                    else if (this.state.projectSelectSubState === 2) {
                        console.log(this.state.selectedPosts);
                        console.log(this.state.selectedProject)
                        return this.state.selectedPosts
                            .map((item) => item.post_id)
                            .concat(this.state.selectedProject.post_ids);
                    }
                }
                else {
                    return this.props.content.posts.map((item) => item.content_id);
                }
                break;
            default:
                throw new Error("Nothing Matched");
        }
    }

    render() {
        const contentType = this.state.editProjectState || this.props.isContentOnlyView || this.state.selectedProject
            ?
            PROJECT_EVENT : PROJECT;
        switch (this.state.window) {
            case (MAIN):
                return (
                    <>
                        <ProfileModal
                            authUser={this.props.authUser}
                            projectID={this.state.selectedProject?._id}
                            editProjectState={this.state.editProjectState}
                            modalState={this.props.modalState}
                            postIndex={this.state.selectedPostIndex}
                            postType={this.state.postType}
                            pursuitNames={this.props.pursuitNames}
                            eventData={this.state.feedData[this.state.selectedEventIndex]}
                            disableCommenting={true}
                            returnModalStructure={this.props.returnModalStructure}
                            closeModal={this.clearModal}
                        />
                        <MainDisplay
                            userInfo={{
                                indexUserID: this.props.authUser.indexProfileID,
                                completeUserID: this.props.authUser.profileID,
                                userPreviewID: this.props.authUser.userPreviewID
                            }}
                            feedID={this.state.feedID}
                            contentType={contentType}
                            projectMetaData={this.state.selectedProject}
                            projectSelectSubState={this.state.projectSelectSubState}
                            barType={this.state.barType}
                            window={this.state.window}
                            targetProfileID={this.props.targetProfileID}
                            hasMore={this.state.hasMore}
                            priorProjectID={this.state.priorProjectID}
                            editProjectState={this.state.editProjectState}
                            title={this.state.title}
                            overview={this.state.overview}

                            createTimelineRow={this.createTimelineRow}
                            onProjectEventSelect={this.handleProjectEventSelect}
                            onProjectClick={this.handleProjectClick}
                            handleWindowSwitch={this.handleWindowSwitch}
                            onEventClick={this.handleEventClick}
                            onBackClick={this.handleBackClick}
                            handleInputChange={this.handleInputChange}
                            onEditExistingProject={this.onEditExistingProject}
                            onNewProjectSelect={this.handleNewProjectSelect}
                            copyToClipboard={this.copyToClipboard}
                            shouldPull={this.shouldPull}
                            onSelectAll={this.onSelectAll}
                            allPosts={this.selectFeedData()}
                            loadedFeed={this.createRenderedPosts()}
                        />
                    </>
                );
            case (EDIT):
                return (
                    <div >
                        <TopButtonBar
                            barType={this.state.barType}
                            selectedProjectID={this.state.selectedProject?._id}
                            onBackClick={this.handleBackClick}
                            onNewProjectSelect={this.handleNewProjectSelect}
                            handleWindowSwitch={this.handleWindowSwitch}
                        />
                        <h3>Rearrange Your Posts</h3>
                        <div id="projectcontroller-sortable-list-container">
                            <SortableList
                                contentType={POST}
                                items={this.state.semiFinalData}
                                onSortEnd={this.handleSortEnd}
                                axis="xy"
                            />
                        </div>
                    </div>
                );
            case (REVIEW):
                let pursuitSelects = [];
                for (const pursuit of this.props.pursuitNames) {
                    pursuitSelects.push(
                        <option key={pursuit} value={pursuit}>{pursuit}</option>
                    );
                }
                return (
                    <ProjectReview
                        authUser={this.props.authUser}
                        title={this.state.title}
                        overview={this.state.overview}
                        isUpdate={this.state.isUpdate}
                        projectMetaData={this.state.selectedProject}
                        pursuitSelects={pursuitSelects}
                        selectedPosts={this.state.semiFinalData.map(item => item._id)}
                        onWindowSwitch={this.handleWindowSwitch}
                        handleInputChange={this.handleInputChange}
                    />
                )
            default:
                throw new Error("No Window Options Matched in post-project-controller");
        }

    }
}

export default withRouter(ProjectController);