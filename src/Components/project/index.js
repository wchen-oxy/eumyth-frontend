import React from 'react';
import ProjectText from "./sub-components/project-text";
import Timeline from "../profile/timeline/index";
import Event from "../profile/timeline/sub-components/timeline-event";
import ProfileModal from '../profile/profile-modal';
import TextareaAutosize from 'react-textarea-autosize';
import { SortableContainer, SortableElement } from 'react-sortable-hoc';
import AxiosHelper from '../../Axios/axios';
import { POST } from "../constants/flags";
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

const MAIN = "MAIN";
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

const handleIndexUpdate = (index) => {
    index++;
    if (index === 4) return 0;
    else {
        return index;
    }
}

const SortableItem = SortableElement(({ mediaType, value, classColumnIndex }) =>
(<div className="projectcontroller-event-container">
    <Event
        columnIndex={classColumnIndex}
        mediaType={mediaType}
        eventData={value}
        newProjectView={false}
        key={value._id}
        disableModalPreview={true}
    />
</div>
));

const SortableList = SortableContainer(({ mediaType, items, onSortEnd }) => {
    let classColumnIndex = 0;
    return (
        <ul>
            { items.map((value, index) => {
                if (classColumnIndex === 4) classColumnIndex = 0;
                return (
                    <SortableItem
                        key={`item-${index}`}
                        index={index}
                        classColumnIndex={classColumnIndex++}
                        value={value}
                        mediaType={mediaType}
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
            selectedPosts: [],
            title: "",
            overview: "",
            pursuitCategory: this.props.pursuitNames ? this.props.pursuitNames[0] : null,
            startDate: "",
            endDate: "",
            isComplete: false,
            minDuration: null,
            coverPhoto: null,
            projectSelected: null,
            feedData: [[]],

        }
        this.modalRef = React.createRef(null);
        this.handleBackClick = this.handleBackClick.bind(this);
        this.handleProjectClick = this.handleProjectClick.bind(this);
        this.handleEventClick = this.handleEventClick.bind(this);
        this.handleProjectEventSelect = this.handleProjectEventSelect.bind(this);
        this.handleWindowSwitch = this.handleWindowSwitch.bind(this);
        this.handleSortEnd = this.handleSortEnd.bind(this);
        this.handlePost = this.handlePost.bind(this);
        this.handleInputChange = this.handleInputChange.bind(this);
        this.updateFeedData = this.updateFeedData.bind(this);
        this.openModal = this.openModal.bind(this);
        this.closeModal = this.closeModal.bind(this);
    }

    updateFeedData(masterArray) {
        this.setState({ feedData: masterArray })
    }

    handleBackClick() {
        if (this.state.projectSelected) {
            console.log("Back");
            this.setState({ projectSelected: null },
                () => {
                    this.props.clearLoadedFeed();
                    this.props.shouldPull(true)
                });
        }
        else {
            this.props.onNewBackProjectClick();
        }

    }

    openModal() {
        this.modalRef.current.style.display = "block";
        document.body.style.overflow = "hidden";
        this.setState({
            isModalShowing: true
        });
    }

    closeModal() {
        this.modalRef.current.style.display = "none";
        document.body.style.overflow = "visible";
        this.setState({
            isModalShowing: false
        });
    }


    handleEventClick(selectedEvent, postIndex, columnIndex) {
        return AxiosHelper
            .retrievePost(selectedEvent._id, true)
            .then(
                (result) =>
                    this.setState({
                        selectedEvent: selectedEvent,
                        // selectedPostIndex: postIndex,
                        // selectedPostColumnIndex: columnIndex,
                        // textData: result.data,
                        // postType: selectedEvent.post_format
                    }, this.openModal(selectedEvent._id))
            )
            .catch(error => console.log(error));
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
        if (window === REVIEW) {
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
        this.setState({ selectedPosts: updatedProjectData });
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
        formData.append(USERNAME_FIELD, this.props.username);
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

    handleProjectClick(projectData) {
        this.setState({
            projectSelected: projectData,
        }, () => {
            this.props.shouldPull(true);
            this.props.clearLoadedFeed();
        });
    }

    render() {
        switch (this.state.window) {
            case (MAIN):
                const requiresBackButton = this.props.newProjectState || this.state.projectSelected;
                return (
                    <>
                        <ProfileModal
                            modalRef={this.modalRef}
                            isModalShowing={this.state.isModalShowing}
                            targetProfileID={this.props.targetProfileID}
                            targetIndexUserID={this.props.targetIndexUserID}
                            isOwnProfile={this.props.isOwnProfile}
                            visitorUsername={this.props.visitorUsername}
                            postIndex={this.state.selectedPostIndex}
                            visitorDisplayPhoto={this.props.visitorDisplayPhoto}
                            preferredPostPrivacy={this.props.preferredPostPrivacy}
                            postType={this.state.postType}
                            pursuitNames={this.props.pursuitNames}
                            eventData={this.state.selectedEvent}
                            textData={this.state.textData}
                            closeModal={this.closeModal}
                            onCommentIDInjection={this.handleCommentIDInjection}
                            disableCommenting={true}
                        />
                        <div className="">
                            {requiresBackButton ? (
                                <button
                                    onClick={this.handleBackClick}
                                >
                                    Back
                                </button>)
                                :
                                <button
                                    onClick={this.props.onNewBackProjectClick}
                                >
                                    New
                                </button>
                            }
                            {this.props.newProjectState ?
                                <button
                                    id="project-info-button"
                                    onClick={() => this.handleWindowSwitch(EDIT)}
                                >
                                    Next Step
                                </button>
                                :
                                <></>
                            }
                        </div>
                        <div className="">
                            {this.props.newProjectState ?
                                <ProjectText
                                    titleValue={this.state.title}
                                    descriptionValue={this.state.overview}
                                    onTextChange={this.handleInputChange}
                                />
                                : (<></>)
                            }
                            {this.props.newProjectState ?
                                <p>Select the posts you want to include in this project!</p>
                                : <></>}
                            {
                                this.props.feedIDList.length > 0 ?
                                    <Timeline
                                        nextOpenPostIndex={this.props.nextOpenPostIndex}
                                        mediaType={this.props.newProjectState || this.state.projectSelected ?
                                            POST : this.props.mediaType}
                                        selectedPosts={this.state.selectedPosts}
                                        newProjectView={this.props.newProjectState}
                                        onProjectEventSelect={this.handleProjectEventSelect}
                                        onProjectClick={this.handleProjectClick}
                                        allPosts={this.state.projectSelected ? (
                                            this.state.projectSelected.post_ids
                                        ) : (
                                            this.props.feedIDList)}
                                        onEventClick={this.handleEventClick}
                                        loadedFeed={this.props.loadedFeed}
                                        updateFeedData={this.props.updateFeedData}
                                        targetProfileID={this.props.targetProfileID}
                                        shouldPull={this.props.shouldPull}
                                        hasMore={this.props.hasMore}
                                    />
                                    :
                                    <div>
                                        <br />
                                        <p>You haven't made any projects yet. Feel free to make one!</p>
                                        <br />
                                        <br />
                                        <br />
                                        <br />
                                        <br />
                                        <br />
                                    </div>

                            }
                        </div>
                    </>
                );
            case (EDIT):
                return (
                    <div >
                        <div className="">
                            <button
                                onClick={() => this.handleWindowSwitch(MAIN)}
                            >
                                Return
                                </button>
                            <button
                                onClick={() => this.handleWindowSwitch(REVIEW)}
                            >
                                Finalize
                            </button>
                        </div>
                        <div id="projectcontroller-sortable-list-container">
                            <SortableList
                                mediaType={POST}
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
                                onClick={() => this.handleWindowSwitch(MAIN)}
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

export default ProjectController;