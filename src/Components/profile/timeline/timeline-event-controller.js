import React from 'react';
import EventHeroContent from "./timeline-event-hero-content";
import ProjectEvent from "./timeline-project-event";
import { POST, PROJECT, LONG, SHORT, PROJECT_EVENT } from "../../constants/flags";
import EventCheckbox from './sub-components/event-checkbox';
import './timeline-event.scss';

const selectClassStyle = (num) => {
    switch (num) {
        case (0):
            return "event-first-container";
        case (1):
            return "event-middle-container";
        case (2):
            return "event-middle-container";
        case (3):
            return "event-last-container";
        default:
            throw new Error("Element Index in Timeline Event is incorrect: ", num);
    }
}

const EventController = (props) => {
    const post = props.eventData;
    const handleRecentEventClick = () => {
        if (!props.disableModalPreview) {
            props.onEventClick(post, props.index)
        }
        else {
            console.log("Selected, but disabled")
        }
    };

    if (props.isRecentEvents) {
        return (
            <div className={"event-middle-container"}>
                <div onClick={handleRecentEventClick}>
                    <EventHeroContent
                        post={post}
                        commentCount={post.comment_count}
                    />
                </div>
                <EventCheckbox
                    post={post}
                    newProjectView={props.newProjectView}
                    isChecked={post.isChecked}
                    onProjectEventSelect={props.onProjectEventSelect}
                />
            </div>
        );
    }
    else if (props.mediaType === POST || props.mediaType === PROJECT_EVENT) {
        console.log(props.onProjectEventSelect);
        return (
            <div className={props.columnIndex !== null ?
                selectClassStyle(props.columnIndex) : "event-middle-container"}>
                <div onClick={props.disableModalPreview ?
                    () => console.log("Selected")
                    :
                    () => props.onEventClick(post, props.eventIndex, props.columnIndex)} >
                    <EventHeroContent
                        post={post}
                        commentCount={post.comment_count}
                    />
                </div>
                <EventCheckbox
                    post={post}
                    newProjectView={props.newProjectView}
                    isChecked={post.isChecked}
                    onProjectEventSelect={props.onProjectEventSelect}
                />
            </div>
        );
    }
    else if (props.mediaType === PROJECT) {
        return (
            <div
                onClick={props.disableModalPreview ?
                    () => console.log("Selected")
                    :
                    () => props.onProjectClick(post)}
                className={props.columnIndex !== null ?
                    selectClassStyle(props.columnIndex) : "event-middle-container"}>
                <ProjectEvent post={post} />
            </div>
        );
    }
    else {
        throw new Error("No props.mediaType matched");
    }

}

export default EventController;