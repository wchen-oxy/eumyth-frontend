import React from 'react';
import ContentGene from './content-gene';
import './spotlight-meta.scss';

const SpotlightMeta = (props) => {

    return (
        <div>
            {props.parent && <a href={'/c/' + props.parent} target="_blank" rel='noreferrer'>See Parent</a>}
            <p>Start Date: {props.startDate ? props.startDate : "n/a"}</p>
            <p>Start Date: {props.endDate ? props.endDate : "n/a"}</p>
            <p>Duration: {props.duration ? props.duration : 'n/a'}</p>
            <p>Total Posts: {props.postListLength ? props.postListLength : "n/a"}</p>
            <ContentGene contentType="ANCESTORS" ancestors={props.ancestors} />
            <ContentGene contentType="CHILDREN" children={props.children} />
        </div>
    )
}

export default SpotlightMeta;