import React from 'react';
import './project-draft-controls.scss';

const ProjectDraftControls = (props) => {
    const doDraftsExist = props.drafts.length > 0;
    const draftOptions = doDraftsExist ? props.drafts.map((item) =>
        <option value={item.content_id}>
            {item.title}
        </option>) :
        <option value={null} disabled>No Drafts Available</option>;
    if (doDraftsExist) draftOptions.unshift(<option value={''}></option>);
    return (
        <div id='projectdraftcontrols-main'>
            <label>Add to Existing Draft Project:</label>
            <select
                name='select'
                id='projectdraftcontrols-content'
                value={props.selectedDraft}
                onChange={e => props.setDraft(e.target.value)}>
                {draftOptions}
            </select>
        </div>
    )
}

export default ProjectDraftControls;