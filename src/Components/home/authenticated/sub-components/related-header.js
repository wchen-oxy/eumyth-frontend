import React, { useEffect, useState } from 'react';
import AxiosHelper from 'utils/axios';
import HeaderObject from './header-object';

const RelatedProjectHeader = (props) => {
    const [hasRecent, setHasRecent] = useState(false);
    const [projectPreview, setProjectPreview] = useState(null);
    const [similarProjects, setSimilarProjects] = useState([]);
    const [index, setIndex] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

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
                            setSimilarProjects(results.data);
                            setIsLoading(false);
                        })
                })
                .catch(err => {
                    console.log(err);
                    setIsLoading(false);
                });
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
            <div className='relatedheader'>
                <h3>Similar Spotlight </h3>
                <p>Create Your First Post To Start Seeing Suggestions!</p>
                <div id='relatedheader-self-other'>
                    <div id='relatedheader-self'>
                        <h2>Your Latest Series</h2>
                        <div id='relatedheader-self-preview'>
                            <div className='relatedheader-blanks'>

                            </div>
                        </div>
                    </div>
                    <div id='relatedheader-other'>
                        <h2>Their Latest Series</h2>
                        <div className='relatedheader-other-preview'>
                            <button
                                className='relatedheader-other-preview-button'
                                disabled={true}
                            >
                                &lt;
                            </button>
                            <div id='relatedheader-blanks-theirs'>
                                <div className='relatedheader-blanks' id='relatedheader-other-blank'>
                                </div>
                                <div className='relatedheader-blanks'>
                                </div>
                            </div>
                            <button
                                className='relatedheader-other-preview-button'
                                disabled={true}
                            >
                                &gt;
                            </button>
                        </div>
                        <p id='relatedheader-index-blank'>0 of 0</p>
                    </div>
                </div>
            </div >)
    }
    return (
        <div className='relatedheader'>
            <h3>Journey Spotlight </h3>
            {isLoading ?
                <p className='relatedheader-subtext'>Loading</p> :
                <p className='relatedheader-subtext'>Showing Work From Someone Who's Pursuing
                    Something Similar To Your Most Recent Work</p>
            }
            <div id='relatedheader-self-other'>
                <div id='relatedheader-self'>
                    <h2>Your Latest Series</h2>
                    <div id='relatedheader-self-preview'>
                        <div id='relatedheader-self-preview-object'>
                            {projectPreview && <h2>{projectPreview.title}</h2>}
                            {projectPreview && <p>{projectPreview.overview}</p>}
                        </div>
                    </div>
                </div>
                <div id='relatedheader-other'>
                    <h2>Their Latest Series</h2>
                    <div className='relatedheader-other-preview'>
                        <button
                            className='relatedheader-other-preview-button'
                            disabled={similarProjects === null || index - 1 < 0}
                            onClick={() => onClick(-1)}>
                            &lt;
                        </button>
                        {similarProjects.length > 0 ?
                            <HeaderObject {...similarProjects[index]} />
                            :
                            <div>
                                <div id='relatedheader-none' >
                                    <p>No Matches... For now</p>
                                </div>
                            </div>
                        }
                        <button
                            className='relatedheader-other-preview-button'
                            disabled={similarProjects === null || index + 1 > similarProjects.length - 1}
                            onClick={() => onClick(1)}>
                            &gt;
                        </button>
                    </div>
                    {similarProjects.length > 0 && <p id='relatedheader-index' >{index + 1} of {similarProjects.length} </p>}
                </div>
            </div>

        </div >
    )



}

export default RelatedProjectHeader;