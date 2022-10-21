import EventController from 'components/timeline/timeline-event-controller';
import React from 'react';
import { SPOTLIGHT_POST } from 'utils/constants/flags';
import { returnUserImageURL } from 'utils/url';
import { returnFormattedDistance } from 'utils/constants/ui-text';
import { toTitleCase } from 'utils';

const Results = (props) => {
    const distanceText = returnFormattedDistance(props.person.distance)
    const profileURL = returnUserImageURL(props.person.small_cropped_display_photo_key);
    return (
        <div key={props.person._id} className='results' >
            <div className='results-profile'>
                <div>
                    <div className='results-image'>
                        <img src={profileURL} />
                    </div>
                    <a className='results-name' href={'/u/' + props.person.username}>
                        <h3>{props.person.first_name + " " + props.person.last_name}</h3>
                    </a>
                    {distanceText && <p>{distanceText}</p>}
                </div>
                <div>
                    <p>{props.person.bio}</p>
                </div>
                {props.person.pursuits.map(
                    (pursuit, index) => {
                        if (index !== 0) return (
                            <div key={index} className='results-stats'>
                                <h4>{toTitleCase(pursuit.name)}</h4>
                                <p> {pursuit.num_milestones} Milestones</p>
                                <p> {pursuit.total_min} Total Minutes</p>
                            </div>)
                    }
                )}
            </div>
            {/* <div>
                <div className='results-title'>
                    <h4>Latest Project</h4>
                </div>
                <div>
                    
                </div>
            </div> */}
            <div className='results-post'>
                <div className='results-title'>
                    <h4>Recent Posts</h4>
                </div>
                <div className='results-post-preview'>
                    {
                        props.person.pursuits[0].posts.length > 0 ?
                            props.person.pursuits[0].loaded.map(
                                (post, index) => (
                                    <div key={index}>
                                        <EventController
                                            contentType={SPOTLIGHT_POST}
                                            eventIndex={1}
                                            columnIndex={index}
                                            eventData={post}
                                            onEventClick={props.onEventClick}
                                        />
                                    </div>
                                )
                            )
                            :
                            <p>No Posts Yet</p>
                    }
                </div>
            </div>
        </div>
    )
}

export default Results;