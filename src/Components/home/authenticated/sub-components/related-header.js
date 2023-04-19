import React, { useEffect, useState } from 'react';
import AxiosHelper from 'utils/axios';
import HeaderObject from './header-object';

const RelatedProjectHeader = (props) => {
    const [hasRecent, setHasRecent] = useState(false);
    const [projectPreview, setProjectPreview] = useState(null);
    const [similarProjects, setSimilarProjects] = useState(null);
    const [index, setIndex] = useState(0);

    useEffect(() => {
        if (props.recent) {
            AxiosHelper.getSingleProjectPreview(props.recent.project_preview_id)
                .then(results => {
                    const projectPreview = results.data;
                    setProjectPreview(projectPreview);
                    setHasRecent(true);
                    return AxiosHelper
                        .getRelatedProjectPreview(
                            projectPreview._id,
                            projectPreview.labels,
                            projectPreview.pursuit
                        )
                        .then(results => {
                            console.log(results);
                            setSimilarProjects(results.data);
                        })
                })
        }

    }, []);

    const onClick = (value) => {
        const newIndex = index + value;
        if (newIndex === -1) setIndex(0);
        else if (newIndex === 3) setIndex(2);
        else setIndex(newIndex);

    }
    if (!hasRecent) {
        return (
            <div id='relatedheader'>
                <h3>Similar Spotlight </h3>
                <p>Create Your First Post To Start Seeing Suggestions!</p>
                <div>
                </div>
            </div>)
    }
    return (
        <div id='relatedheader'>
            <h3>Similar Spotlight </h3>
            {similarProjects ? <p>Showing Work Similar To</p> : <p>Loading</p>}
            <div id='relatedheader-self'>
                <h2> {projectPreview && projectPreview.title}</h2>
                {projectPreview && projectPreview.overview}
            </div>
            <div className='relatedheader-other'>
                <button onClick={() => onClick(-1)} > Prev</button>
                {similarProjects ?
                    <HeaderObject {...similarProjects[index]} />
                    :
                    <p>None Found</p>}

                <button onClick={() => onClick(1)} > Next</button>
            </div>

        </div>
    )



}

export default RelatedProjectHeader;