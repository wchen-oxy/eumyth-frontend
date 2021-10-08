import React from 'react';
import Timeline from '../profile/timeline';
import TopButtonBar from './sub-components/top-button-bar';
import ProjectHeaderInput from './sub-components/project-header-input';
import ProjectHeader from './project-header';
import ProjectUtilityButtons from './sub-components/project-utility-buttons';
import { PROJECT_CONTENT_ONLY_VIEW_STATE, PROJECT_MICRO_VIEW_STATE } from 'utils/constants/flags';

const MainDisplay = (props) => {
    return (
        <div>
            <TopButtonBar
                selectStage={props.selectStage}
                barType={props.barType}
                onBackClick={props.onBackClick}
                onNewProjectSelect={props.onNewProjectSelect}
                selectedProjectID={props.selectedProjectID}
                onEditExistingProject={props.onEditExistingProject}
                copyToClipboard={props.copyToClipboard}
                handleWindowSwitch={props.handleWindowSwitch}
            />

            {props.editProjectState &&
                <ProjectHeaderInput
                    titleValue={props.header.title}
                    descriptionValue={props.descriptionValue}
                    onTextChange={props.handleInputChange}
                />
            }

            {props.barType === PROJECT_CONTENT_ONLY_VIEW_STATE
                || props.barType === PROJECT_MICRO_VIEW_STATE
                ?
                <ProjectHeader
                    titleValue={props.header.title}
                    descriptionValue={props.header.overview}
                    username={props.header.username}
                    displayPhoto={props.header.displayPhoto}
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
            {
                props.allPosts.length > 0 ?
                    <Timeline
                        feedID={props.feedID}
                        nextOpenPostIndex={props.nextOpenPostIndex}
                        contentType={props.contentType}
                        selectedPosts={props.selectedPosts}
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
    )
}



export default MainDisplay;