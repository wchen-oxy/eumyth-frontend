import React from 'react';
import withRouter from 'utils/withRouter';
import { returnProjectURL } from 'utils/url';
import { returnFormattedDate } from 'utils/constants/ui-text';

const SimilarProjectInfo = (props) => {
    console.log(props);
    const date = returnFormattedDate(props.updatedAt);
    return (
        <div className='similarprojectinfo'>
            <a href={returnProjectURL(props.project_id)}>
                <h4>{props.title}</h4>
                {props.overview && <p>{props.overview}</p>}
                {props.updatedAt && <p>Last Updated {date.month} {date.day}, {date.year}</p>}
                {props.remix && <p>Branched As: {props.remix}</p>}
                {props.hasChildren &&
                    <p className='similarprojectinfo-children'>
                        Has Children
                    </p>}
            </a>
        </div>
    );
}

export default withRouter(SimilarProjectInfo);