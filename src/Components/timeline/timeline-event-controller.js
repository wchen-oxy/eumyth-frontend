import React from 'react';
import EventHeroContent from './timeline-event-hero-content';
import ProjectEvent from './timeline-project-event';
import { POST, PROJECT, PROJECT_EVENT, SPOTLIGHT_POST, SPOTLIGHT_PROJECT } from 'utils/constants/flags';
import EventCheckbox from './sub-components/event-checkbox';

const selectClassStyle = (num, modulo) => {
    if (modulo === 4)
        switch (num) {//POST VIEWS (DURING EDITING)
            case (0):
                return 'event-first';
            case (1):
                return 'event-middle';
            case (2):
                return 'event-middle';
            case (3):
                return 'event-last';
            default:
                return 'event-middle';
        }
    else if (modulo === 3) { //POST VIEWS (NON EDIT)
        switch (num) {
            case (0):
                return 'post-first';
            case (1):
                return 'post-second';
            case (2):
                return 'post-third';
            default:
                return new Error("Something went wrong with determing class styling for posts")

        }

    }

    else if (modulo === 2 || modulo === 1) { //PROJECT VIEWS  
        switch (num) {
            case (0):
                return 'project-one';
            case (1):
                return 'project-two';
            default:

        }
    }
}


const EventController = (props) => {
    const post = props.eventData;
    if (props.contentType === PROJECT) {
        return (
            <div
                onClick={props.disableModalPreview ?
                    () => console.log('Selected')
                    :
                    () => props.onProjectClick(post)}
                className={selectClassStyle(props.columnIndex, props.modulo)}>
                <ProjectEvent shouldShowPursuit={props.shouldShowPursuit} post={post} />
            </div>
        );
    }
    else if (props.contentType === SPOTLIGHT_POST) {
        return (
            <div className={selectClassStyle(props.columnIndex, props.modulo)}>
                <div onClick={props.disableModalPreview ?
                    () => console.log('Selected')
                    :
                    () => props.onEventClick(post)} >
                    <EventHeroContent
                        post={post}
                        commentCount={post.comments.length}
                    />
                </div>
            </div>)
    }

    else if (props.contentType === POST || props.contentType === PROJECT_EVENT) {
        const eventClickParams = props.isRecentEvents ?
            [post, props.index] : [props.eventIndex];
        return (
            <div className={selectClassStyle(props.columnIndex, props.modulo)}>
                <div onClick={props.disableModalPreview ?
                    () => console.log('Selected')
                    :
                    () => props.onEventClick(...eventClickParams)} >
                    <EventHeroContent
                        post={post}
                        commentCount={post.comment_count}
                    />
                </div>
                {props.editProjectState &&
                    <EventCheckbox
                        post={post}
                        isChecked={props.isSelected}
                        onProjectEventSelect={props.onProjectEventSelect}
                    />}
                {
                    props.shouldMarkAsNew &&
                    <div>
                        <p>To Be Added Post</p>
                    </div>
                }
            </div>
        );
    }
    else if (props.contentType === SPOTLIGHT_PROJECT) {
        return (
            <div
                onClick={props.disableModalPreview ?
                    () => console.log('Selected')
                    :
                    () => props.onProjectClick(post)}
                className={selectClassStyle(props.columnIndex, props.modulo)}>
                <ProjectEvent post={post} />
            </div>
        );
    }
    else {
        throw new Error('No props.contentType matched');
    }

}

export default EventController;