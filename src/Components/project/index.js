import React from 'react';
import ProjectText from "./sub-components/project-header-input";
import Timeline from "../profile/timeline/index";
import ProfileModal from '../profile/profile-modal';
import TextareaAutosize from 'react-textarea-autosize';
import { SortableContainer, SortableElement } from 'react-sortable-hoc';
import AxiosHelper from '../../Axios/axios';
import { withRouter } from 'react-router-dom';
import { NONE, POST, POST_VIEWER_MODAL_STATE, PROJECT_EVENT, PROJECT_MACRO_VIEW_STATE, PROJECT_MICRO_VIEW_STATE, PROJECT_REARRANGE_STATE, PROJECT_SELECT_VIEW_STATE } from "../constants/flags";
import { returnUsernameURL, returnPostURL, returnProjectURL } from "../constants/urls";
import "./index.scss";
import {
    COVER_PHOTO_FIELD,
    DISPLAY_PHOTO_FIELD,
    END_DATE_FIELD,
    INDEX_USER_ID_FIELD,
    IS_COMPLETE_FIELD,
    MIN_DURATION_FIELD,
    OVERVIEW_FIELD,
    PURSUIT_FIELD,
    SELECTED_POSTS_FIELD,
    START_DATE_FIELD,
    TITLE_FIELD,
    USERNAME_FIELD,
    USER_ID_FIELD
} from '../constants/form-data';
import EventController from '../profile/timeline/timeline-event-controller';
import MainDisplay from './main-display';
import TopButtonBar from './sub-components/top-button-bar';

const MAIN = "MAIN";
const INNER_MAIN = "INNER_MAIN"
const EDIT = "EDIT";
const REVIEW = "REVIEW";
const TITLE = "TITLE";
const OVERVIEW = "OVERVIEW";
const PURSUIT = "PURSUIT";
const START_DATE = "START_DATE";
const END_DATE = "END_DATE";
const IS_COMPLETE = "IS_COMPLETE";
const MINUTES = "MINUTES";
const COVER_PHOTO = "COVER_PHOTO";

const defaultFeed = [[]];

const handleIndexUpdate = (index) => {
    index++;
    if (index === 4) return 0;
    else {
        return index;
    }
}

const SortableItem = SortableElement(({ contentType, value, classColumnIndex }) =>
(<div className="projectcontroller-event-container">
    <EventController
        columnIndex={classColumnIndex}
        contentType={contentType}
        eventData={value}
        newProjectView={false}
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
            window: MAIN,
            barType: this.props.isContentOnlyView ?
                NONE : PROJECT_MACRO_VIEW_STATE,
            selectedPosts: [],
            title: "",
            overview: "",
            pursuitCategory: this.props.pursuitNames ? this.props.pursuitNames[0] : null,
            startDate: "",
            endDate: "",
            isComplete: false,
            minDuration: null,
            coverPhoto: null,
            selectedProject: this.props.isContentOnlyView && this.props.feedData ? this.props.feedData : null,
            selectedEvent: null,

            hasMore: true,
            nextOpenPostIndex: 0,
            loadedFeed: [[]],

            newProjectState: false,
            feedID: 0,

        }

        this.modalRef = React.createRef(null);
        this.handleBackClick = this.handleBackClick.bind(this);
        this.handleProjectClick = this.handleProjectClick.bind(this);
        this.setNewURL = this.setNewURL.bind(this);
        this.handleEventClick = this.handleEventClick.bind(this);
        this.handleProjectEventSelect = this.handleProjectEventSelect.bind(this);
        this.handleWindowSwitch = this.handleWindowSwitch.bind(this);
        this.handleSortEnd = this.handleSortEnd.bind(this);
        this.handlePost = this.handlePost.bind(this);
        this.handleInputChange = this.handleInputChange.bind(this);
        this.updateFeedData = this.updateFeedData.bind(this);
        this.setModal = this.setModal.bind(this);
        this.copyToClipboard = this.copyToClipboard.bind(this);
        this.clearModal = this.clearModal.bind(this);
        this.handleNewProjectSelect = this.handleNewProjectSelect.bind(this);
        this.handleNewBackProjectClick = this.handleNewBackProjectClick.bind(this);
        this.shouldPull = this.shouldPull.bind(this);
        this.clearLoadedFeed = this.clearLoadedFeed.bind(this);
    }

    clearLoadedFeed() {
        console.log("feed cleared")
        this.setState({
            loadedFeed: [[]],
            nextOpenPostIndex: 0,
            hasMore: true,
            feedID: this.state.feedID + 1
        });
    }

    shouldPull(value) {
        this.setState({ hasMore: value });
    }

    updateFeedData(masterArray) {
        this.setState({ loadedFeed: masterArray })
    }

    handleBackClick() {
        if (this.state.selectedProject) {
            this.setState({
                selectedProject: null,
                barType: PROJECT_MACRO_VIEW_STATE,
                loadedFeed: [[]],
                nextOpenPostIndex: 0,
                hasMore: true,
                feedID: this.state.feedID + 1,
            }, () => this.setNewURL(returnUsernameURL(this.props.targetUsername)))
        }
        else {
            if (this.props.newProjectState) {
                if (this.state.barType === PROJECT_SELECT_VIEW_STATE) {
                    this.setState({ barType: PROJECT_MACRO_VIEW_STATE },
                        this.handleNewBackProjectClick)
                }
                else if (this.state.barType === PROJECT_REARRANGE_STATE) {
                    this.setState({ window: MAIN, barType: PROJECT_SELECT_VIEW_STATE })
                }

            }
            else {
                this.handleNewBackProjectClick();
            }
        }
    }

    setModal(postID) {
        this.props.history.replace(returnPostURL(postID));
        this.props.openMasterModal(POST_VIEWER_MODAL_STATE);
    }

    clearModal() {
        this.setState({ selectedEvent: null }, () => {

            this.setNewURL(returnProjectURL(this.state.selectedProject._id));

            this.props.closeMasterModal();
        });
    }

    handleEventClick(selectedEvent, postIndex, columnIndex) {
        this.setState({
            selectedEvent: selectedEvent,
            textData: selectedEvent.text_data,
        }, this.setModal(selectedEvent._id));
    }

    handleInputChange(id, value) {
        switch (id) {
            case (TITLE):
                this.setState({ title: value })
                break;
            case (OVERVIEW):
                this.setState({ overview: value })
                break;
            case (PURSUIT):
                this.setState({ pursuitCategory: value });
                break;
            case (START_DATE):
                this.setState({ startDate: value });
                break;
            case (END_DATE):
                this.setState({ endDate: value });
                break;
            case (IS_COMPLETE):
                this.setState({ isComplete: value });
                break;
            case (MINUTES):
                this.setState({ minDuration: value });
                break;
            case (COVER_PHOTO):
                this.setState({ coverPhoto: value });
                break;
            default:
                throw new Error("NO TEXT ID'S Matched in POST")
        }
    }

    handleWindowSwitch(window) {
        let min = 0
        if (window === EDIT) {
            return this.setState({ window: window, barType: PROJECT_REARRANGE_STATE })
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
        let updatedProjectData = [];
        let postExistsAlready = false;
        let index = -1;
        for (let postData of this.state.selectedPosts) {
            if (postData._id !== eventData._id) {
                index = handleIndexUpdate(index);
                postData.column_index = index;
                updatedProjectData.push(postData);
            }
            else {
                eventData.isChecked = false;
                postExistsAlready = true;
            }
        }
        if (!postExistsAlready) {
            index = handleIndexUpdate(index);
            eventData.column_index = index;
            eventData.isChecked = true;
            updatedProjectData.push(eventData);
        }
        this.setState({
            selectedPosts: updatedProjectData
        });
    }

    handleSortEnd({ oldIndex, newIndex }) {
        const items = this.state.selectedPosts;
        const [reorderedItem] = items.splice(oldIndex, 1);
        let index = -1;
        items.splice(newIndex, 0, reorderedItem);
        for (let item of items) {
            index = handleIndexUpdate(index);
            item.column_index = index;
        }
        this.setState({ selectedPosts: items });
    }

    handlePost() {
        let formData = new FormData();
        formData.append(USERNAME_FIELD, this.props.targetUsername);
        formData.append(DISPLAY_PHOTO_FIELD, this.props.displayPhoto)
        formData.append(USER_ID_FIELD, this.props.targetProfileID);
        formData.append(INDEX_USER_ID_FIELD, this.props.targetIndexUserID);
        formData.append(TITLE_FIELD, this.state.title);
        if (this.state.overview) {
            formData.append(OVERVIEW_FIELD, this.state.overview);
        }
        if (this.state.pursuitCategory) {
            formData.append(PURSUIT_FIELD, this.state.pursuitCategory);
        }
        if (this.state.startDate) {
            formData.append(START_DATE_FIELD, this.state.startDate);
        }
        if (this.state.endDate) {
            formData.append(END_DATE_FIELD, this.state.endDate);
        }
        if (this.state.isComplete) {
            formData.append(IS_COMPLETE_FIELD, this.state.isComplete);
        }
        if (this.state.minDuration) {
            formData.append(MIN_DURATION_FIELD, this.state.minDuration);
        }
        if (this.state.coverPhoto) {
            formData.append(COVER_PHOTO_FIELD, this.state.coverPhoto);
        }
        if (this.state.selectedPosts) {
            const stringArray = JSON.stringify(this.state.selectedPosts);
            formData.append(SELECTED_POSTS_FIELD, stringArray);
        }

        return AxiosHelper.createProject(formData)
            .then((result) => {
                alert("Success!");
                window.location.reload();
            })
            .catch(err => console.log(err));
    }

    setNewURL(projectID) {
        this.props.history.replace(projectID);
    }

    handleProjectClick(projectData) {
        this.setState({
            selectedProject: projectData,
            barType: PROJECT_MICRO_VIEW_STATE,
        }, () => {
            this.setNewURL(returnProjectURL(projectData._id));
            this.shouldPull(true);
            this.clearLoadedFeed();
        });
    }

    copyToClipboard(value) {
        navigator.clipboard.writeText(value);
    }

    handleNewBackProjectClick() {
        if (!this.state.newProjectState) {
            this.setState((state) => ({
                newProjectState: !state.newProjectState,
                feedIDList: state.allPosts.map(item => item.post_id),
                hasMore: true,
            }));
        }
        else {
            this.setState({ newProjectState: false })
        }
    }

    handleNewProjectSelect() {
        this.setState({ barType: PROJECT_SELECT_VIEW_STATE },
            () => this.handleNewBackProjectClick())
    }

    render() {
        switch (this.state.window) {
            case (MAIN):
                return (
                    <>
                        <ProfileModal
                            modalState={this.props.modalState}
                            labels={this.props.labels}
                            visitorUsername={this.props.visitorUsername}
                            targetUsername={this.props.targetUsername}
                            postIndex={this.state.selectedPostIndex}
                            visitorDisplayPhoto={this.props.visitorDisplayPhoto}
                            preferredPostPrivacy={this.props.preferredPostPrivacy}
                            postType={this.state.postType}
                            pursuitNames={this.props.pursuitNames}
                            eventData={this.state.selectedEvent}
                            textData={this.state.textData}
                            closeModal={this.clearModal}
                            disableCommenting={true}
                            returnModalStructure={this.props.returnModalStructure}
                        />
                        <MainDisplay
                            feedID={this.state.feedID + this.props.selectedPursuitIndex}
                            selectedProjectID={this.state.selectedProject?._id}
                            barType={this.state.barType}
                            titleValue={this.state.title}
                            descriptionValue={this.state.overview}
                            handleInputChange={this.handleInputChange}
                            window={this.state.window}
                            nextOpenPostIndex={this.state.nextOpenPostIndex}
                            contentType={this.props.newProjectState || this.state.selectedProject ?
                                PROJECT_EVENT : this.props.contentType}
                            selectedPosts={this.state.selectedPosts}
                            header={{
                                title: this.state.selectedProject?.title,
                                overview: this.state.selectedProject?.overview
                            }}
                            newProjectView={this.props.newProjectState}
                            onProjectEventSelect={this.handleProjectEventSelect}
                            onProjectClick={this.handleProjectClick}
                            allPosts={this.state.selectedProject ? (
                                this.state.selectedProject.post_ids
                            ) : (this.props.feedData)}
                            handleWindowSwitch={this.handleWindowSwitch}
                            onEventClick={this.handleEventClick}
                            onBackClick={this.handleBackClick}
                            loadedFeed={this.state.loadedFeed}
                            updateFeedData={this.updateFeedData}
                            targetProfileID={this.props.targetProfileID}
                            onNewBackProjectClick={this.handleNewProjectSelect}
                            shouldPull={this.shouldPull}
                            hasMore={this.state.hasMore}
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
                            onNewBackProjectClick={this.handleNewProjectSelect}
                            handleWindowSwitch={this.handleWindowSwitch}
                        />

                        <div id="projectcontroller-sortable-list-container">
                            <SortableList
                                contentType={POST}
                                items={this.state.selectedPosts}
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
                    <div >
                        <div className="">
                            <button
                                onClick={() => this.handleWindowSwitch(EDIT)}
                            >
                                Return
                            </button>
                            <button
                                onClick={() => this.handlePost()}
                            >
                                Post!
                            </button>
                        </div>
                        <div id="projectcontroller-submit-container">
                            <TextareaAutosize
                                value={this.state.title}
                                onChange={(e) => (
                                    this.handleInputChange(TITLE, e.target.value)
                                )}
                            />
                            <TextareaAutosize
                                value={this.state.overview}
                                onChange={(e) => (
                                    this.handleInputChange(OVERVIEW, e.target.value)
                                )} />
                            <label>Pursuit</label>
                            <select
                                name="pursuit-category"
                                value={this.state.pursuitCategory}
                                onChange={(e) => (
                                    this.handleInputChange(PURSUIT, e.target.value)
                                )}
                            >
                                {pursuitSelects}
                            </select>
                            <label>Start Date</label>
                            <input
                                type="date"
                                value={this.state.startDate}
                                onChange={(e) => (
                                    this.handleInputChange(START_DATE, e.target.value))}
                            />
                            <label>End Date</label>
                            <input
                                type="date"
                                value={this.state.endDate}
                                onChange={(e) => (
                                    this.handleInputChange(END_DATE, e.target.value))}
                            />
                            <label>Total Minutes</label>
                            <input
                                type="number"
                                value={this.state.minDuration}
                                onChange={(e) => (
                                    this.handleInputChange(MINUTES, e.target.value)
                                )}
                            />
                            <label>Is Complete</label>
                            <input
                                type="checkbox"
                                onClick={() => (
                                    this.handleInputChange(IS_COMPLETE,
                                        !this.state.isComplete)
                                )}
                            />
                            <label>Cover Photo</label>
                            <input
                                type="file"
                                onChange={(e) => (
                                    this.handleInputChange(COVER_PHOTO, e.target.files[0])
                                )}
                            />
                            <button
                                onClick={this.handlePost}
                            >
                                Submit
                            </button>
                        </div>

                    </div>
                )
            default:
                throw new Error("No Window Options Matched in post-project-controller");
        }

    }
}

export default withRouter(ProjectController);