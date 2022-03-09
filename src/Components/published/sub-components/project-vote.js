import React, { useState, useEffect } from 'react';
import AxiosHelper from 'utils/axios';
import { PROJECT } from 'utils/constants/flags';
import "./project-vote.scss";

const validateInclusion = (array, ID) => {
    return array.length > 0 && array.includes(ID);
}

const ProjectVote = props => {
    const [previousVote, setPreviousVote] = useState(0);
    const [overallVoteScore, setOverallVoteScore] = useState(0);
    const [bookmarkState, setBookmarkState] = useState(false);

    useEffect(() => {
        setOverallVoteScore(props.likes.length - props.dislikes.length);
        if (validateInclusion(props.bookmarks, props.userPreviewID)) {
            setBookmarkState(true);
        }
        if (validateInclusion(props.likes, props.userPreviewID)) {
            setPreviousVote(1);
        }
        else if (validateInclusion(props.dislikes, props.userPreviewID)) {
            setPreviousVote(-1);
        }
    }, [])

    const handleBookmark = () => {
        return AxiosHelper
            .bookmarkContent(
                PROJECT,
                props.projectID,
                props.userPreviewID,
                !bookmarkState
            )
            .then((results) => {
                setBookmarkState(!bookmarkState);
            })
            .catch(err => {
                console.log(err);
            })
    }

    const handleVote = (currentVote) => {
        const temporaryOverallVoteScore = overallVoteScore;
        const temporaryPreviousVoteValue = previousVote;
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
            console.log(combinedVote)
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

        return AxiosHelper.voteOnProject(
            props.projectID,
            props.userPreviewID,
            voteValue
        )
            .then(res => {
                setOverallVoteScore(temporaryOverallVoteScore + overallVoteScoreModifier)
                setPreviousVote(newCurrentVote);
            })
            .catch((res) => { console.log(res) });
    }

    return (
        <div className='projectvote-main-container'>
            <div className='projectvote-controls-container'>
                <button onClick={() => handleVote(1)}>Upvote</button>
                <p>{overallVoteScore}</p>
                <button onClick={() => handleVote(-1)}>DownVote</button>
            </div>
            <div className='projectvote-controls-container'>
                <p>{bookmarkState ? "Bookmarked" : "Bookmark"}</p>
                <button onClick={handleBookmark}>Bookmark</button>
            </div>

        </div>
    )
}

export default ProjectVote;