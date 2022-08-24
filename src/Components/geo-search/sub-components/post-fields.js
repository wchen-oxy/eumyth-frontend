import React from 'react';
import { DIFFICULTY_FIELD, DISTANCE_FIELD, PROGRESSION_FIELD } from 'utils/constants/form-data';

const PostFields = (props) => {
    return (
        <div classname="postfield">
            <div className='postfield-toggle'>
                <label className={'postfield-label'}>Difficulty</label>
                <select
                    id="postfield-difficulty"
                    onChange={(e) => props.onFieldChange(DIFFICULTY_FIELD, e.target.value)}>
                    <option value={0}></option>
                    <option value={1}>Challenging</option>
                    <option value={2}>Difficult</option>
                </select>
            </div>

            <div className='postfield-toggle'>
                <label className={'postfield-label'}>Progress</label>
                <select
                    id="postfield-progress"
                    onChange={(e) => props.onFieldChange(PROGRESSION_FIELD, e.target.value)}>
                    <option value={1}></option>
                    <option value={0}>Setback</option>
                    <option value={2}>Milestone</option>pass

                </select>
            </div>
            <div className='postfield-toggle'>
                <label className={'postfield-label'}>Distance</label>
                <select
                    id="postfield-distance"
                    onChange={(e) => props.onFieldChange(DISTANCE_FIELD, e.target.value)}>
                    <option value={5}>5 miles</option>
                    <option value={10}>10 miles</option>
                    <option value={20}>20 miles</option>
                    <option value={50}>50 miles</option>
                </select>
            </div>
            <div className='postfield-toggle'>
                <button className="btn-round" onClick={props.onRefreshClick}> Refresh </button>
            </div>
        </div>
    )

}

export default PostFields;