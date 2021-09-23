import React from 'react';
import Timeline from '../profile/timeline';
import TopButtonBar from './sub-components/top-button-bar';
import ProjectHeaderInput from './sub-components/project-header-input';
import ProjectHeader from './project-header';

const MainDisplay = (props) => {
    console.log(props.feedID);
    return (
        <div>

            <TopButtonBar
                barType={props.barType}
                onBackClick={props.onBackClick}
                onNewProjectSelect={props.onNewProjectSelect}
                selectedProjectID={props.selectedProjectID}
                onEditExistingProject={props.onEditExistingProject}
                copyToClipboard={props.copyToClipboard}
            />

            {props.newProjectView &&
                <ProjectHeaderInput
                    titleValue={props.header.title}
                    descriptionValue={props.descriptionValue}
                    onTextChange={props.handleInputChange}
                />
            }

            {props.selectedProjectID &&
                <ProjectHeader
                    titleValue={props.header.title}
                    descriptionValue={props.header.overview}
                    username={props.header.username}
                    displayPhoto={props.header.displayPhoto}
                    onPriorForkClick={props.onPriorForkClick}
                    priorProjectID={props.priorProjectID}
                />
            }

            {
                props.allPosts.length > 0 ?
                    <Timeline
                        feedID={props.feedID}
                        nextOpenPostIndex={props.nextOpenPostIndex}
                        contentType={props.contentType}
                        selectedPosts={props.selectedPosts}
                        newProjectView={props.newProjectView}
                        onProjectEventSelect={props.onProjectEventSelect}
                        onProjectClick={props.onProjectClick}
                        allPosts={props.allPosts}
                        onEventClick={props.onEventClick}
                        loadedFeed={props.loadedFeed}
                        updateFeedData={props.updateFeedData}
                        targetProfileID={props.targetProfileID}
                        shouldPull={props.shouldPull}
                        hasMore={props.hasMore}
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