import React from 'react';
import SingleComment from './sub-components/single-comment';
import CommentInput from './sub-components/comment-input';
import AxiosHelper from 'utils/axios';
import { SHORT, EXPANDED, COLLAPSED } from 'utils/constants/flags';

class Comments extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            commentText: '',
            selectedCommentThread: false,
            loadingComments: true,
        }
        this.setCommentThread = this.setCommentThread.bind(this);
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
                return AxiosHelper.getComments(
                    this.props.commentIDArray,
                    this.props.windowType)
                    .then(
                        (result) => {
                            this.setState({
                                loadingComments: false,
                            }, () => {
                                if (this.props.postType === SHORT) {
                                    this.props.passAnnotationData(result.data.rootComments)
                                }
                                else {
                                    this.props.passAnnotationData(result.data.rootComments)
                                }
                            });
                        }
                    );
            }
            else {
                AxiosHelper.getComments(
                    JSON.stringify(this.props.commentIDArray),
                    this.props.windowType
                )
                    .then(
                        (result) => {
                            this.setState({
                                loadingComments: false,
                            }, () => {
                                this.props.passAnnotationData(result.data.rootComments)

                            });
                        }
                    );
            }
        }
        else {
            return (
                this.setState({ loadingComments: false, },
                    () => {
                        if (this.props.postType === SHORT) {
                            this.props.passAnnotationData(null);
                        }
                    }));
        }
    }

    setCommentThread(ID) {
        const thread = ID ? [ID] : this.props.commentIDArray;
        return AxiosHelper.getComments(
            JSON.stringify(thread),
            this.props.windowType)
            .then((result) => this.setState({
                loadingComments: false,
                selectedCommentThread: ID ? true : false
            }, () => {
                this.props.passAnnotationData(result.data.rootComments)

            }))
    }

    handleCommentTextChange(text) {
        this.setState({ commentText: text })
    }

    handleCommentPost() {
        return AxiosHelper
            .postComment(
                this.props.visitorProfilePreviewID,
                this.state.commentText,
                this.props.postID,
                0)
            .then(
                (result) => {
                    const commentArray = result.data.rootCommentIDArray
                    return AxiosHelper
                        .refreshComments(JSON.stringify(commentArray))
                        .then((result) => {
                            this.props.onCommentDataInjection(
                                this.props.selectedIndex,
                                result.data.rootComments);
                        })
                })
            .then(() => alert('Success!'))

    }

    renderCommentSectionType(viewingMode) {
        if (this.state.loadingComments || !this.props.fullCommentData) {
            return (<div>
                Loading...
            </div>);
        }

        if (viewingMode === COLLAPSED) {
            return (this.renderCommentThreads(this.props.fullCommentData));
        }
        else if (viewingMode === EXPANDED) {
            return (this.renderCommentThreads(this.props.fullCommentData));
        }
        else {
            throw new Error('No viewing modes matched');
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
                <div key={commentData._id + 'outer'}>
                    <SingleComment
                        hasAnnotation={!!annotation}
                        level={currentLevel}
                        postID={this.props.postID}
                        visitorProfilePreviewID={this.props.visitorProfilePreviewID}
                        commentID={commentData._id}
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
                </div>
            );
        }
        else {
            const replies = [];
            const threadIndicatorArray = [];
            const shouldHideReplies =
                currentLevel % 14 === 0 && commentData.replies.length > 0;

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
            if (!shouldHideReplies) {
                for (const reply of commentData.replies) {
                    replies.push(this.recursiveRenderComments(reply, currentLevel));
                }
            }
            else {
                for (let i = 0; i < currentLevel; i++) {
                    threadIndicatorArray.push(
                        <div key={this.props.commentID + 'inner' + Math.random() * 2}
                            className='singlecomment-thread-indicator'>
                        </div>);
                }
            }
            return (
                <div key={commentData._id}>
                    <SingleComment
                        level={currentLevel}
                        postID={this.props.postID}
                        visitorProfilePreviewID={this.props.visitorProfilePreviewID}
                        visitorUsername={this.props.visitorUsername}
                        commentID={commentData._id}
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

                    {shouldHideReplies ? (
                        <div className='singlecomment-multiple-thread-style'>
                            <div className='singlecomment-thread-indicator-container'>
                                {threadIndicatorArray}
                            </div>
                            <button className='comments-extended-thread'
                                value={commentData._id}
                                onClick={() => this.setCommentThread(commentData._id)} >
                                Continue this thread &rarr;
                            </button>
                        </div>
                    ) :
                        <div className='comments-reply-container'>{replies}</div>
                    }
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
                    'comments-collapsed'
                    :
                    'comments-expanded'}
                >
                    <CommentInput
                        reference={this.props.reference}
                        classStyle={viewingMode === COLLAPSED ?
                            'comments-collapsed-input' : 'comments-expanded-input'}
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
                        {this.props.isImageOnly &&
                            <button
                                onClick={this.props.onPromptAnnotation}
                            >
                                Annotate
                            </button>}
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
        if (this.props.windowType === COLLAPSED) {
            return (
                <div className='comments-main'>
                    {this.renderCommentSectionType(COLLAPSED)}
                    {this.renderCommentInput(COLLAPSED)}
                </div>
            );
        }
        else if (this.props.windowType === EXPANDED) {
            return (
                <div className='comments-main'>
                    {this.renderCommentInput(EXPANDED)}
                    {this.state.selectedCommentThread &&
                        <button
                            id='comments-return'
                            className='comments-extended-thread'
                            onClick={() => this.setCommentThread(null)} >
                            &larr; Return To Parent Thread</button>}
                    {this.renderCommentSectionType(EXPANDED)}
                    <br />
                    <br />
                    <br />
                    <br />
                    <br />
                </div>
            )
        }

    }
}
export default Comments;