import React from 'react';
import Timeline from '../timeline';
import TopButtonBar from './sub-components/top-button-bar';
import ProjectHeaderInput from './sub-components/project-header-input';
import ProjectHeader from './project-header';
import ProjectSelectHeader from './sub-components/project-select-header';
import ProjectUtilityButtons from './sub-components/project-utility-buttons';

import { PROJECT_CONTENT_ONLY_VIEW_STATE, PROJECT_MICRO_VIEW_STATE } from 'utils/constants/flags';
import { REGULAR_CONTENT_REQUEST_LENGTH } from 'utils/constants/settings';

const MainDisplay = (props) => {
    return (
        <div>
            <TopButtonBar
                userInfo={props.userInfo}
                projectID={props.projectMetaData?._id}
                projectSelectSubState={props.projectSelectSubState}
                barType={props.barType}
                postIDList={props.projectMetaData?.post_ids}
                onBackClick={props.onBackClick}
                onNewProjectSelect={props.onNewProjectSelect}
                onEditExistingProject={props.onEditExistingProject}
                copyToClipboard={props.copyToClipboard}
                handleWindowSwitch={props.handleWindowSwitch}
            />

            {props.editProjectState &&
                <ProjectHeaderInput
                    titleValue={props.title}
                    descriptionValue={props.overview}
                    onTextChange={props.handleInputChange}
                />
            }
            {props.barType === PROJECT_CONTENT_ONLY_VIEW_STATE
                || props.barType === PROJECT_MICRO_VIEW_STATE
                ?
                <ProjectHeader
                    titleValue={props.title}
                    descriptionValue={props.overview}
                    username={props.projectMetaData.username}
                    displayPhoto={props.projectMetaData.displayPhoto}
                    onPriorForkClick={props.onPriorForkClick}
                    priorProjectID={props.priorProjectID}
                />
                :
                null
            }
            {props.editProjectState &&
                <ProjectUtilityButtons
                    onSelectAll={props.onSelectAll}
                />
            }
            {props.editProjectState &&
                <ProjectSelectHeader stage={props.projectSelectSubState} />}
            <Timeline
                feedID={props.feedID}
                requestLength={REGULAR_CONTENT_REQUEST_LENGTH}
                nextOpenPostIndex={props.nextOpenPostIndex}
                contentType={props.contentType}
                editProjectState={props.editProjectState}
                onProjectEventSelect={props.onProjectEventSelect}
                onProjectClick={props.onProjectClick}
                allPosts={props.allPosts}
                onEventClick={props.onEventClick}
                loadedFeed={props.loadedFeed}
                updateFeedData={props.updateFeedData}
                targetProfileID={props.targetProfileID}
                shouldPull={props.shouldPull}
                hasMore={props.hasMore}
                createTimelineRow={props.createTimelineRow}
            />
            <br />
            <br />
            <br />
            <br />
            <br />
            <br />
            <br />
            <br />
            <br />
            {/* {
                props.allPosts.length > 0 ?
                    <Timeline
                        feedID={props.feedID}
                        nextOpenPostIndex={props.nextOpenPostIndex}
                        contentType={props.contentType}
                        editProjectState={props.editProjectState}
                        onProjectEventSelect={props.onProjectEventSelect}
                        onProjectClick={props.onProjectClick}
                        allPosts={props.allPosts}
                        onEventClick={props.onEventClick}
                        loadedFeed={props.loadedFeed}
                        updateFeedData={props.updateFeedData}
                        targetProfileID={props.targetProfileID}
                        shouldPull={props.shouldPull}
                        hasMore={props.hasMore}
                        createTimelineRow={props.createTimelineRow}
                    />
                    :
                    <div>
                        <br />
                        <br />
                        <br />
                        <br />
                        <br />
                        {
                            props.contentType === PROJECT ?
                                <p>You haven't made any projects yet. Feel free to make one!</p> :
                                <p>You haven't added any posts yet.</p>
                        }

                        <br />
                        <br />
                        <br />
                        <br />
                        <br />
                        <br />
                        <br />
                        <br />
                        <br />
                        <br />
                        <br />
                        <br />
                        <br />
                        <br />
                        <br />
                        <br />
                        <br />
                    </div>

            } */}
        </div>
    )
}



export default MainDisplay;