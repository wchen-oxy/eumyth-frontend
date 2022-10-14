import React, { useState } from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import PursuitCategoryInput from './pursuit-category-input';

const ProjectDraftControls = (props) => {
    const [priorThread, setPriorThread] = useState(props.selectedDraft);
    const doDraftsExist = props.drafts.length > 0;
    let draftOptions = doDraftsExist ? props.drafts.map(
        (item) => {
            if (props.isUpdateToPost && item.content_id === props.selectedDraft) {
                return (
                    <option selected value={item.content_id}>
                        {item.title}
                    </option>)
            }
            else {
                return (
                    <option value={item.content_id}>
                        {item.title}
                    </option>);
            }
        }) :
        [<option value={null} disabled>No Drafts Available</option>];

    if (doDraftsExist && !props.isUpdateToPost) {
        draftOptions.unshift(<option selected value={null}></option>);
    }

    return (
        <div id='projectdraftcontrols'>
            <div className='projectdraftcontrols-header'>
                <span>
                    <label>Add to Existing Series:</label>
                    <label className="switch">
                        <input type="checkbox" onChange={() => props.setToggleState(!props.toggleState)} />
                        <span className="slider round"></span>
                    </label>
                    <label>Create New Series</label>
                </span>
                <h6>A Series is a collection of posts that have a common theme or idea.
                    When you add more posts to a Series, you can see how your pursuit develops over time.
                    As a Series grows, you may be surprised who may interested in your hard work!
                </h6>
            </div>

            {
                props.toggleState ?
                    <div>
                        <div className='projectdraftcontrols-inner'>
                            <TextareaAutosize
                                name='subtitle'
                                id='titleinput-content'
                                placeholder='Write the Title of Your New Series'
                                onChange={(e) => props.setThreadTitle(e.target.value)}
                                minRows={2}
                                maxLength={140} />

                        </div>
                        <PursuitCategoryInput
                            pursuitNames={props.pursuitNames}
                            pursuit={props.pursuit}
                            setPursuit={props.setPursuit}
                        />

                        <div className='projectdraftcontrols-inner'>
                            <label>Make Series Title Private</label>
                            <input type="checkbox" onChange={() => props.setTitlePrivacy(!props.titlePrivacy)} />
                        </div>
                    </div>

                    :
                    <div className='projectdraftcontrols-inner'>
                        <label>Series</label>
                        <select
                            name='select'
                            id='projectdraftcontrols-content'
                            value={props.selectedDraft}
                            onChange={e => props.setDraft(e.target.value)}>
                            {draftOptions}
                        </select>
                        <div className='projectdraftcontrols-inner'>
                            <label>Complete Series</label>
                            <input type="checkbox" onChange={() => props.setCompleteProject(!props.isCompleteProject)} />
                        </div>
                    </div>
            }
            {props.isUpdateToPost && priorThread && priorThread !== props.selectedDraft &&
                <p>Changing the series this post belongs to may require you
                    to reorder your posts in the new parent series. You may do so
                    by directly editing the parent series. </p>}
        </div>
    )
}

export default ProjectDraftControls;