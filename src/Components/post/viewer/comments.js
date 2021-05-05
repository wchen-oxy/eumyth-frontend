import React from 'react';
import AxiosHelper from '../../../Axios/axios';
import SingleComment from "./sub-components/single-comment";
import CommentInput from "./sub-components/comment-input";
import { SHORT, EXPANDED, COLLAPSED, RECENT_POSTS } from "../../constants/flags";

import "./comments.scss";

class Comments extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            windowType: this.props.windowType,
            commentText: "",
            loadingComments: true,
        }
        this.renderCommentSectionType = this.renderCommentSectionType.bind(this);
        this.renderCommentInput = this.renderCommentInput.bind(this);
        this.renderCommentThreads = this.renderCommentThreads.bind(this);
        this.recursiveRenderComments = this.recursiveRenderComments.bind(this);
        this.handleCommentTextChange = this.handleCommentTextChange.bind(this);
        this.handleCommentPost = this.handleCommentPost.bind(this);
    }

    componentDidMount() {
        if (this.props.commentIDArray.length > 0) {
            if (this.props.visitorUsername) {
                console.log(this.props.visitorUsername);
                return Promise.all([
                    AxiosHelper.getComments(
                        JSON.stringify(this.props.commentIDArray),
                        this.state.windowType
                    ),
                    AxiosHelper.getUserPreviewID(this.props.visitorUsername)
                ])
                    .then(
                        (result) => {
                            this.setState({
                                visitorProfilePreviewId: result[1].data.userPreviewId,
                                loadingComments: false,

                            }, () => {
                                if (this.props.postType === SHORT) {
                                    this.props.passAnnotationData(
                                        result[0].data.rootComments,
                                        result[1].data.userPreviewId)
                                }
                                else {
                                    this.props.passAnnotationData(
                                        result[0].data.rootComments,
                                        null)
                                }
                            });
                        }
                    );
            }
            else {
                AxiosHelper.getComments(
                    JSON.stringify(this.props.commentIDArray),
                    this.state.windowType
                )
                    .then(
                        (result) => {
                            this.setState({
                                loadingComments: false,
                            }, () => {
                                if (this.props.postType === SHORT) {
                                    this.props.passAnnotationData(
                                        result.data.rootComments,
                                        null)
                                }
                                else {
                                    this.props.passAnnotationData(
                                        result[0].data.rootComments,
                                        null)
                                }
                            });
                        }
                    );
            }
        }
        else {
            if (this.props.visitorUsername) {
                return AxiosHelper.getUserPreviewID({ params: { username: this.props.visitorUsername } })
                    .then((result) => {
                        this.setState({
                            visitorProfilePreviewId: result.data.userPreviewId,
                            loadingComments: false,

                        }, () => {
                            if (this.props.postType === SHORT) {
                                this.props.passAnnotationData(
                                    null,
                                    result.data.userPreviewId
                                );
                            }
                        });
                    })
            }
            else {
                this.setState({
                    loadingComments: false,

                }, () => {
                    if (this.props.postType === SHORT) {
                        this.props.passAnnotationData(
                            null,
                            null
                        );
                    }
                });
            }

        }
    }

    handleCommentTextChange(text) {
        this.setState({ commentText: text })
    }

    handleCommentPost() {
        return AxiosHelper
            .postComment(
                this.state.visitorProfilePreviewID,
                this.state.commentText,
                this.props.postId,
                0)
            .then(
                (result) => {
                    const commentArray = result.data.rootCommentIdArray
                    return AxiosHelper
                        .refreshComments(JSON.stringify(commentArray))
                        .then((result) => {
                            this.props.onCommentDataInjection(
                                this.props.postIndex,
                                result.data.rootComments,
                                this.props.selectedPostFeedType);
                        })
                })
            .then(() => alert("Success!"))

    }

    renderCommentSectionType(viewingMode) {
        if (this.state.loadingComments || !this.props.fullCommentData) {
            return <div>
                Loading...
            </div>
        }

        if (viewingMode === COLLAPSED) {
            return (
                this.renderCommentThreads(this.props.fullCommentData)
            )
        }
        else if (viewingMode === EXPANDED) {
            console.log(this.props.fullCommentData);
            return (
                this.renderCommentThreads(this.props.fullCommentData)
            )
        }
        else {
            throw new Error("No viewing modes matched");
        }
    }

    recursiveRenderComments(commentData, level) {
        const currentLevel = level + 1;
        const annotation =
            commentData.annotation ?
                JSON.parse(commentData.annotation.data) : null;
        const text = commentData.comment ?
            commentData.comment : annotation.text;
        if (!commentData.replies) {
            return (
                <SingleComment
                    level={currentLevel}
                    postId={this.props.postId}
                    visitorProfilePreviewId={this.state.visitorProfilePreviewId}
                    commentId={commentData._id}
                    ancestors={commentData.ancestor_post_ids}
                    username={commentData.username}
                    commentText={text}
                    likes={commentData.likes}
                    dislikes={commentData.dislikes}
                    displayPhoto={commentData.display_photo_key}
                    score={commentData.score}

                    annotation={annotation}
                    onMouseOver={this.props.onMouseOver}
                    onMouseOut={this.props.onMouseOut}
                    onMouseClick={this.props.onMouseClick}
                />
            );
        }
        else {
            let replies = [];
            commentData.replies.sort(
                (a, b) => {
                    if (a.createdAt < b.createdAt) {
                        return -1;
                    }
                    if (a.createdAt > b.createdAt) {
                        return 1;
                    }
                    return 0;
                });
            for (const reply of commentData.replies) {
                replies.push(this.recursiveRenderComments(reply, currentLevel));
            }
            return (
                <div>
                    <SingleComment
                        level={currentLevel}
                        postId={this.props.postId}
                        visitorProfilePreviewId={this.state.visitorProfilePreviewId}
                        visitorUsername={this.props.visitorUsername}
                        commentId={commentData._id}
                        ancestors={commentData.ancestor_post_ids}
                        username={commentData.username}
                        commentText={text}
                        score={commentData.score}
                        likes={commentData.likes}
                        dislikes={commentData.dislikes}
                        displayPhoto={commentData.display_photo_key}

                        annotation={annotation}
                        onMouseOver={this.props.onMouseOver}
                        onMouseOut={this.props.onMouseOut}
                        onMouseClick={this.props.onMouseClick}
                    />
                    <div className="comments-reply-container">
                        {replies}
                    </div>
                </div>
            )
        }
    }


    renderCommentThreads(rawComments) {
        let renderedCommentArray = [];
        for (const rootComment of rawComments) {
            renderedCommentArray.push(
                this.recursiveRenderComments(rootComment, 0)
            );
        }
        return renderedCommentArray;
    }

    renderCommentInput(viewingMode) {
        if (this.props.visitorUsername) {
            return (
                <div className={viewingMode === COLLAPSED ?
                    "comments-collapsed-input-container"
                    :
                    "comments-expanded-input-container"}
                >
                    <CommentInput
                        classStyle={viewingMode === COLLAPSED ?
                            "comments-collapsed-input" : "comments-expanded-input"}
                        minRows={4}
                        handleTextChange={this.handleCommentTextChange}
                        commentText={this.state.commentText}
                    />
                    <div>
                        <button
                            disabled={this.state.commentText.trim().length === 0}
                            onClick={this.handleCommentPost}
                        >
                            Add Comment
                                </button>
                        {this.props.isImageOnly ?
                            <button
                                onClick={this.props.onPromptAnnotation}
                            >
                                Annotate
                            </button>
                            : null}
                    </div>

                </div>
            );
        }
        else {
            return (
                <div>
                    <p>You must sign in before you can leave a comment.</p>
                </div>
            )
        }
    }



    render() {
        if (this.state.windowType === COLLAPSED) {
            return (
                <div className="comments-main-container">
                    {this.renderCommentSectionType(COLLAPSED)}
                    {this.renderCommentInput(COLLAPSED)}
                </div>
            );
        }
        else if (this.state.windowType === EXPANDED) {
            return (
                <div className="comments-main-container">
                    {this.renderCommentInput(EXPANDED)}
                    {this.renderCommentSectionType(EXPANDED)}
                    <br />
                    <br />
                </div>
            )
        }

    }
}
export default Comments;