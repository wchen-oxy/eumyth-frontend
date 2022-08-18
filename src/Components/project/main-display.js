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
    const isOwner = props.projectMetaData?.index_user_id === props.userInfo.indexUserID;

    return (
        <div>
            <TopButtonBar
                isOwner={isOwner}
                userInfo={props.userInfo}
                projectID={props.projectMetaData?._id}
                projectSelectSubState={props.projectSelectSubState}
                barType={props.barType}
                postIDList={props.projectMetaData?.post_ids}
                onBackClick={props.onBackClick}
                onNewProjectSelect={props.onNewProjectSelect}
                onEditExistingProject={props.onEditExistingProject}
                handleWindowSwitch={props.handleWindowSwitch}
                title={props.title}
                status={props.projectMetaData?.status}
                forkData={props.forkData}
                onPublish={props.onPublish}

                returnModalStructure={props.returnModalStructure}

                modalState={props.modalState}
                openMasterModal={props.openMasterModal}
                closeMasterModal={props.closeMasterModal}
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
                    projectMetaData={props.projectMetaData}
                    onPriorForkClick={props.onPriorForkClick}
                    isContentOnlyView={props.isContentOnlyView}
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
        </div>
    )
}



export default MainDisplay;