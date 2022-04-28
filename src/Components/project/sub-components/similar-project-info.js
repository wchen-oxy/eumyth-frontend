import React from 'react';
import withRouter from 'utils/withRouter';
import { returnProjectURL } from 'utils/url';
import './similar-project-info.scss';

const SimilarProjectInfo = (props) => {
    return (
        <div className='similarprojectinfo-container'>
            <a href={returnProjectURL(props.preview.project_id)}>
                <h4>{props.preview.title}</h4>
                <p>{props.preview.remix}</p>
            </a>
        </div>
    );
}

export default withRouter(SimilarProjectInfo);