import React from 'react';
import {
    PERSONAL_PAGE,
    PRIVATE,
    PUBLIC_FEED
} from 'utils/constants/flags';

const PrePostControls = (props) => {
    const doDraftsExist = props.drafts.length > 0;
    const draftOptions = doDraftsExist ? props.drafts.map((item) =>
        <option value={item.content_id}>
            {item.title}
        </option>) :
        <option value={'No Drafts Available'} disabled>No Drafts Available</option>;
    if (doDraftsExist) draftOptions.unshift(<option value={''}></option>);
    return (
        <div>
            <div>
                <p>Post to:</p>
                <div>
                    <select
                        name='posts'
                        id='postPrivacyType'
                        value={props.preferredPostPrivacy ?
                            props.preferredPostPrivacy : PUBLIC_FEED}
                        onChange={(e) => props.setPostPrivacyType(e.target.value)}
                    >
                        <option value={PRIVATE}>
                            Make post private on your page
                        </option>
                        <option value={PERSONAL_PAGE}>
                            Make post public on your page:
                        </option>
                        <option value={PUBLIC_FEED}>
                            Post to your feed and page
                        </option>
                    </select>
                </div>
                <button
                    onClick={(e) => props.handleFormAppend()}
                    disabled={props.isSubmitting}>
                    {props.isUpdateToPost ?
                        props.isSubmitting ? 'Updating!' : 'Update!' :
                        props.isSubmitting ? 'Posting!' : 'Post!'}
                </button>

            </div>
            <div>
                <p>Save As Draft:</p>
                <div>
                    <select
                        name='select'
                        id='drafts'
                        value={props.selectedDraft}
                        onChange={e => props.setDraft(e.target.value)}>
                        {draftOptions}
                    </select>
                </div>
                <button
                    onClick={e => props.handleFormAppend(true)}
                    disabled={props.drafts.length === 0 || props.isSubmitting}>
                    Save Draft
                </button>
            </div>
        </div>
    )
}

export default PrePostControls;