import React, { useEffect, useState } from 'react';
import withRouter from 'utils/withRouter';
import { returnProjectURL } from 'utils/url';
const SimilarProjectInfo = (props) => {
    return (
        <div>
            <a href={returnProjectURL(props.preview.project_id)}>
                <h4>{props.preview.title}</h4>
                <p>{props.preview.remix}</p>
            </a>
        </div>
    );
}

export default withRouter(SimilarProjectInfo);