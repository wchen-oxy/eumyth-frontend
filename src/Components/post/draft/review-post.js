import React, { useState } from 'react';
import ProjectDraftControls from './sub-components/project-draft-controls';

const ReviewPost = (props) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleFormAppend = () => {
        setIsSubmitting(true);
        let formData = new FormData();
        const required = {
            selectedDraft: props.selectedDraft,
            textData: props.textData,
        }
        const images = {
            useImageForThumbnail: props.useImageForThumbnail, //viewer only //keep
            coverPhoto: props.coverPhoto,  //draft only  //keep
            compressedPhotos: props.compressedPhotos,
        }

        const functions = {
            setIsSubmitting,
            setLoading,
            setError,
            closeModal: props.closeModal
        }

        //NEW
        props.handleFormAppend(formData, required, images, functions);
    }

    const handleReturnClick = (stageValue) => {
        props.setPostStage(stageValue);
    }
    const disableCond1 = !props.selectedDraft;
    const disableCond2 = props.threadTitle.length === 0 || !props.selectedPursuit;

    return (
        < div id='reviewpost'>
            <div>
                <div id='reviewpost-header'>
                    <h2>Add your metadata!</h2>
                    {disableCond1 && <p>**Please Select or Create a Series**</p>}

                </div>
                <div id="reviewpost-nav">
                    <button
                        value={props.previousState}
                        onClick={e => handleReturnClick(e.target.value)}
                    >  Return
                    </button>
                    <button
                        onClick={(e) => handleFormAppend()}
                        disabled={isSubmitting || props.threadToggleState ? disableCond2 : disableCond1}>
                        {props.isUpdateToPost ?
                            isSubmitting ? 'Updating!' : 'Update!' :
                            isSubmitting ? 'Posting!' : 'Post!'}
                    </button>
                </div>
                <div>
                    <ProjectDraftControls
                        isUpdateToPost={props.isUpdateToPost}
                        drafts={props.drafts}
                        selectedDraft={props.selectedDraft}
                        pursuit={props.selectedPursuit}
                        title={props.threadTitle}
                        titlePrivacy={props.titlePrivacy}
                        toggleState={props.threadToggleState}
                        isCompleteProject={props.isCompleteProject}
                        pursuitNames={props.pursuitNames.map(pursuit => pursuit.name)}

                        setPursuit={props.setSelectedPursuit}
                        setDraft={props.setDraft}
                        setTitlePrivacy={props.setTitlePrivacy}
                        setThreadTitle={props.setThreadTitle}
                        setToggleState={props.setThreadToggleState}
                        setCompleteProject={props.setIsCompleteProject}
                    />

                </div>
                {error && <p>An Error Occured. Please try again. </p>}
                {loading && <div>  <p> Loading...</p>  </div>}
            </div>
        </div >
    );
}

export default ReviewPost;