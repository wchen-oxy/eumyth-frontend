import React from 'react';
import EventHeroContent from './timeline-event-hero-content';
import ProjectEvent from './timeline-project-event';
import { POST, PROJECT, PROJECT_EVENT, SPOTLIGHT_POST, SPOTLIGHT_PROJECT } from 'utils/constants/flags';
import EventCheckbox from './sub-components/event-checkbox';
import './timeline-event.scss';

const selectClassStyle = (num) => {
    switch (num) {
        case (0):
            return 'event-first-container';
        case (1):
            return 'event-middle-container';
        case (2):
            return 'event-middle-container';
        case (3):
            return 'event-last-container';
        default:
            console.log("no column index");
            return'event-middle-container';
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
                className={selectClassStyle(props.columnIndex)}>
                <ProjectEvent post={post} />
            </div>
        );
    }
    else if (props.contentType === SPOTLIGHT_POST) {
        return (
            <div className={selectClassStyle(props.columnIndex)}>
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
        console.log(props.columnIndex);
        return (
            <div className={selectClassStyle(props.columnIndex)}>
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
                className={selectClassStyle(props.columnIndex)}>
                <ProjectEvent post={post} />
            </div>
        );
    }
    else {
        throw new Error('No props.contentType matched');
    }

}

export default EventController;