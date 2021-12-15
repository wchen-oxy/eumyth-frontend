import React from 'react';
import CommentInput from './comment-input';
import AxiosHelper from 'utils/axios';
import { TEMP_PROFILE_PHOTO_URL } from 'utils/constants/urls';
import { returnUserImageURL } from 'utils/url';
import './single-comment.scss';

class SingleComment extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            overallVoteScore: this.props.score,
            previousVote: 0,
            isReplyBoxToggled: false,
            replyText: '',
            replies: []
        }
        this.toggleReplyBox = this.toggleReplyBox.bind(this);
        this.setReplyText = this.setReplyText.bind(this);
        this.handleVote = this.handleVote.bind(this);
        this.postReply = this.postReply.bind(this);
        this.renderReply = this.renderReply.bind(this);
        this.isReplyTextInvalid = this.isReplyTextInvalid.bind(this);
        this.renderThreadIndicators = this.renderThreadIndicators.bind(this);
        this.cancelTextInput = this.cancelTextInput.bind(this);
    }
    componentDidMount() {
        if (this.props.likes.includes(this.props.visitorProfilePreviewID)) {
            this.setState({ previousVote: 1 })
        }
        else if (this.props.dislikes.includes(this.props.visitorProfilePreviewID)) {
            this.setState({ previousVote: -1 })
        }
    }

    setReplyText(text) {
        this.setState({
            replyText: text
        })
    }

    toggleReplyBox() {
        this.setState((state) => ({
            isReplyBoxToggled: !state.isReplyBoxToggled
        }))
    }

    handleVote(currentVote) {
        const temporaryOverallVoteScore = this.state.overallVoteScore;
        const temporaryPreviousVoteValue = this.state.previousVote;
        const combinedVote = temporaryPreviousVoteValue + currentVote;
        const voteValue = combinedVote > -1 && combinedVote < 1 ?
            currentVote : combinedVote;
        let newCurrentVote = currentVote;
        let overallVoteScoreModifier = currentVote;

        if (combinedVote < -1 || combinedVote > 1) {
            newCurrentVote = 0;
        }
        if (combinedVote < -1) {
            overallVoteScoreModifier = 1;
        }
        if (combinedVote > 1) {
            overallVoteScoreModifier = -1;
        }

        else if (combinedVote === 0) {
            if (temporaryPreviousVoteValue === -1) {
                overallVoteScoreModifier = 2;
            }
            else if (temporaryPreviousVoteValue === 1) {
                overallVoteScoreModifier = -2;
            }
        }

        this.setState({
            overallVoteScore: temporaryOverallVoteScore + overallVoteScoreModifier,
            previousVote: newCurrentVote
        })

        return AxiosHelper
            .voteOnComment(
                this.props.visitorProfilePreviewID,
                this.props.commentID,
                voteValue,
            )
            .then((result) => {
                console.log(result);
            })
            .catch((err) => {
                console.log(err);
                console.log('Something went wrong with the server.');
                this.setState({
                    overallVoteScore: temporaryOverallVoteScore,
                    previousVote: temporaryPreviousVoteValue
                })
            })
    }

    isReplyTextInvalid() {
        return (
            this.state.replyText.replaceAll('\\s+', '').length === 0
            || this.state.replyText.length === 0
        );
    }

    postReply() {
        if (this.isReplyTextInvalid()) {
            alert('You need to write something');
        }
        else {

            let ancestorArray = this.props.ancestors;
            ancestorArray.push(this.props.commentID);
            return AxiosHelper.postReply(
                this.props.postID,
                this.props.visitorProfilePreviewID,
                JSON.stringify(ancestorArray),
                this.state.replyText
            )
                .then((result) => {
                    alert('Comment added! Refresh the page to see!');
                    this.renderReply(result.data, this.props.level)
                    this.toggleReplyBox(false);
                })
                .catch(err => console.log(err));
        }
    }

    cancelTextInput() {
        if (this.isReplyTextInvalid()) {
            this.setState({ replyText: '', isReplyBoxToggled: false })
            return;
        }
        if (window.confirm('Are you sure you want discard your comment?')) {
            this.setState({ isReplyBoxToggled: false });
        }
    }

    renderThreadIndicators(levels) {
        let threadIndicatorArray = [];
        for (let i = 0; i < levels; i++)
            threadIndicatorArray.push(
                <div key={this.props.commentID + 'inner' + Math.random() * 2}
                    className='singlecomment-thread-indicator'>
                </div>
            )
        return threadIndicatorArray;
    }

    renderReply(commentData, pastLevel) {
        console.log(pastLevel);
        const currentLevel = pastLevel + 1;
        const annotation =
            commentData.annotation ?
                JSON.parse(commentData.annotation.data) : null;
        const text = commentData.comment ?
            commentData.comment : annotation.text;
        const replies = this.state.replies;
        replies.push(

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
                displayPhoto={this.props.displayPhoto}
                score={commentData.score}
                annotation={annotation}
                onMouseOver={this.props.onMouseOver}
                onMouseOut={this.props.onMouseOut}
                onMouseClick={this.props.onMouseClick}
            />
        );
        this.setState({ replies })

    }
    render() {
        const masterClassName = this.props.level > 1 ?
            'singlecomment-multiple-thread-style' : '';
        const displayPhotoURL = this.props.displayPhoto ?
            returnUserImageURL(this.props.displayPhoto) : TEMP_PROFILE_PHOTO_URL;
        return (
            <div>
                <div className={masterClassName}>
                    {this.props.level > 1 && (
                        <div className='singlecomment-thread-indicator-container'>
                            {this.renderThreadIndicators(this.props.level - 1)}
                        </div>
                    )}
                    <div className='singlecomment-main-container'>
                        <div className='singlecomment-header-container'>
                            <div className='singlecomment-display-photo-container'>
                                <img
                                    alt='Single Comment Display Photo Url'
                                    src={displayPhotoURL} />
                            </div>
                            <div className='singlecomment-username-container'>
                                <p>{this.props.username}</p>
                            </div>
                        </div>
                        <div className='singlecomment-body-container'>
                            <div className='singlecomment-thread-indicator-container'>
                                {this.renderThreadIndicators(1)}
                            </div>
                            <div className={'singlecomment-main-content-container'}>
                                {this.props.hasAnnotation &&
                                    <div className='singlecomment-annotation-indicator'>Annotation</div>
                                }
                                <div className='singlecomment-comment-container'

                                    onMouseOver={() => (
                                        this.props.onMouseOver(this.props.commentID))}
                                    onMouseOut={() => (
                                        this.props.onMouseOut(this.props.commentID))}
                                    onClick={() => (
                                        this.props.onMouseClick(this.props.commentID))}
                                >
                                    <pre>{this.props.commentText}</pre>
                                </div>
                                <div className='singlecomment-management-container'>
                                    <button onClick={() => this.handleVote(1)}>
                                        Upvote
                                    </button>
                                    <p>{this.state.overallVoteScore}</p>
                                    <button onClick={() => this.handleVote(-1)}>
                                        Downvote
                                    </button>
                                    <button onClick={() => this.toggleReplyBox()}>
                                        Reply
                                    </button>
                                </div>
                                <div>
                                    {this.state.isReplyBoxToggled &&
                                        <>
                                            <CommentInput
                                                classStyle={''}
                                                minRows={4}
                                                handleTextChange={this.setReplyText}
                                                commentText={this.state.replyText}
                                            />
                                            <button onClick={this.cancelTextInput}>
                                                Cancel
                                            </button>
                                            <button onClick={this.postReply}>
                                                Reply
                                            </button>
                                        </>
                                    }
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
                <div key={'Reply' + Math.random() * 2}>
                    {this.state.replies}
                </div>
            </div>
        );
    }
}


export default SingleComment;