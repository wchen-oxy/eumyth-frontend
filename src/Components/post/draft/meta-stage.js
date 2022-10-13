import React, { useState } from 'react';
import Steps from './sub-components/steps';
import CustomMultiSelect from '../../custom-clickables/createable-single';
// import CoverPhotoControls from './sub-components/cover-photo-controls';
import DateInput from './sub-components/data-input';
import DifficultyInput from './sub-components/difficulty-input';
import MinutesInput from './sub-components/minutes-input';
import TitleInput from './sub-components/title-input';

import { displayDifficulty, } from 'utils/constants/ui-text';
import PrePostControls from './sub-components/pre-post-controls';

const MetaStage = (props) => {
    console.log(props);
    return (
        <div className="small-post-window">
            <h2 id="metastage-title">Post Info</h2>
            <div className='metastage-nav'>
                <button value={props.previousState} onClick={e => props.setPostStage(e.target.value)}>
                    Return
                </button>
                <Steps current={props.current} />
                <button
                    value={props.previousState + 2}
                    onClick={e => props.setPostStage(e.target.value)}
                >
                    Review Series
                </button>
            </div>
            <div>
                <div id='metastage-desc'>
                    <h4>Post</h4>
                    <p>Add any additional information you&#39;d like
                        before you submit your post!</p>
                </div>
                <div>
                    <div>
                        <TitleInput
                            title={props.previewTitle}
                            setTitle={props.handleTitleChange}
                        />
                        <DateInput date={props.date} setDate={props.setDate} />

                        <MinutesInput
                            minDuration={props.minDuration}
                            setMinDuration={props.setMinDuration}
                        />
                        <DifficultyInput
                            difficulty={props.difficulty}
                            displayDifficulty={displayDifficulty}
                            setDifficulty={props.setDifficulty}
                        />
                    </div>
                    <div>
                        <label>Tags</label>
                        <CustomMultiSelect
                            options={props.pastLabels}
                            selectedLabels={props.selectedLabels}
                            name={'Tags'}
                            onSelect={props.setLabels}
                        />

                    </div>
                    <div className='reviewstage-button-container'>
                        <PrePostControls
                            postPrivacyType={props.postPrivacyType}
                            setPostPrivacyType={props.setPostPrivacyType}
                        />
                    </div>
                </div>

            </div>
        </div>
    );
}

export default MetaStage;