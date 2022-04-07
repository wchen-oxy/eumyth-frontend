import React from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import './project-draft-controls.scss';

const ProjectDraftControls = (props) => {

    const doDraftsExist = props.drafts.length > 0;
    let draftOptions = doDraftsExist ? props.drafts.map((item) =>
        <option value={item.content_id}>
            {item.title}
        </option>) :
        <option value={null} disabled>No Drafts Available</option>;

    if (doDraftsExist) {
        draftOptions.unshift(<option value={null}></option>);
    }
    else {
        draftOptions = [<option value={null}></option>];
    }

    return (
        <div >
            <div className='projectdraftcontrols-main'>
                <span>
                    <label>Add to Existing Thread:</label>
                    <label class="switch">
                        <input type="checkbox" onChange={() => props.setToggleState(!props.toggleState)} />
                        <span class="slider round"></span>
                    </label>
                    <label>Create New Thread</label>
                </span>
            </div>
            {
                props.toggleState ?
                    <div className='projectdraftcontrols-inner'>
                        <TextareaAutosize
                            name='subtitle'
                            id='titleinput-content'
                            placeholder='Write the Title of Your Thread'
                            onChange={(e) => props.setThreadTitle(e.target.value)}
                            minRows={2}
                            maxLength={140} />
                        <div className='projectdraftcontrols-inner'>
                            <label>Make Title Private</label>
                            <input type="checkbox" onChange={() => props.setTitlePrivacy(!props.titlePrivacy)} />
                        </div>
                    </div>
                    :
                    <div className='projectdraftcontrols-inner'>
                        <select
                            name='select'
                            id='projectdraftcontrols-content'
                            value={props.selectedDraft}
                            onChange={e => props.setDraft(e.target.value)}>
                            {draftOptions}
                        </select>
                        <div className='projectdraftcontrols-inner'>
                            <label>Complete Thread</label>
                            <input type="checkbox" onChange={() => props.setCompleteProject(!props.isCompleteProject)} />
                        </div>
                    </div>
            }
        </div>
    )
}

export default ProjectDraftControls;