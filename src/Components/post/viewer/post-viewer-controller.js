// import React from 'react';
// import ShortPostViewer from "./short-post";
// import LongPostViewer from "./long-post";
// import { SHORT, LONG } from "../../constants/flags";
// import { withFirebase } from "../../../Firebase/index";
// import { AuthUserContext } from '../../session';

// const PostViewerController = (props) => {
//     const textData = props.textData && props.eventData.is_paginated ?
//         JSON.parse(props.textData) : props.textData;
//     switch (props.eventData.post_format) {
//         case (SHORT):
//             return (
//                 <AuthUserContext.Consumer>
//                     {
//                         authUser =>
//                             <ShortPostViewer
//                                 projectID={props.projectID}
//                                 postID={props.eventData._id}
//                                 postIndex={props.postIndex}
//                                 targetIndexUserID={props.targetIndexUserID}
//                                 preferredPostPrivacy={props.preferredPostPrivacy}
//                                 textData={textData}
//                                 largeViewMode={props.largeViewMode}
//                                 isOwnProfile={props.isOwnProfile}
//                                 isPostOnlyView={props.isPostOnlyView}
//                                 eventData={props.eventData}
//                                 closeModal={props.closeModal}
//                                 passDataToModal={props.passDataToModal}
//                                 onCommentIDInjection={props.onCommentIDInjection}
//                                 selectedPostFeedType={props.selectedPostFeedType}
//                                 disableCommenting={props.disableCommenting}
//                                 labels={props.labels}

//                                 {...props}
//                                 authUser={authUser}
//                             />
//                     }
//                 </AuthUserContext.Consumer>


//             );
//         case (LONG):
//             const title = props.eventData.title;
//             return (
//                 <LongPostViewer
//                     postID={props.eventData._id}
//                     postIndex={props.postIndex}
//                     displayPhoto={props.visitorDisplayPhoto}
//                     visitorUsername={props.visitorUsername}
//                     pursuitNames={props.pursuitNames}
//                     preferredPostPrivacy={props.preferredPostPrivacy}
//                     largeViewMode={props.largeViewMode}
//                     title={title}
//                     textData={JSON.parse(props.textData)}
//                     isOwnProfile={this.state.isOwnProfile}
//                     isPostOnlyView={props.isPostOnlyView}
//                     eventData={props.eventData}
//                     closeModal={props.closeModal}
//                     passDataToModal={props.passDataToModal}
//                     onCommentIDInjection={props.onCommentIDInjection}
//                     selectedPostFeedType={props.selectedPostFeedType}
//                     disableCommenting={props.disableCommenting}

//                 />
//             );
//         default:
//             throw new Error("No content type matched in event-modal.js");
//     }
// }

// export default withFirebase(PostViewerController);