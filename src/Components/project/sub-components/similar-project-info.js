import React from 'react';
import withRouter from 'utils/withRouter';
import { returnProjectURL } from 'utils/url';

const SimilarProjectInfo = (props) => {
    console.log(props);
    return (
        <div className='similarprojectinfo'>
            <a href={returnProjectURL(props.preview.project_id)}>
                <h4>{props.preview.title}</h4>
                <p>{props.preview.remix}</p>
            </a>
        </div>
    );
}

export default withRouter(SimilarProjectInfo);