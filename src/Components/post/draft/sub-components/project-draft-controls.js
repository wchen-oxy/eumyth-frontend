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
        <div id={'projectdraftcontrols-main'}>
            <p>Add to Existing Draft Project:</p>
            <div>
                <select
                    name='select'
                    id='drafts'
                    value={props.selectedDraft}
                    onChange={e => props.setDraft(e.target.value)}>
                    {draftOptions}
                </select>
            </div>
        </div>
    )
}

export default ProjectDraftControls;