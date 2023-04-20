import React from 'react';
import { useNavigate } from 'react-router-dom';
import { returnFormattedDate } from 'utils/constants/ui-text';
import { returnProjectURL } from 'utils/url';

const HeaderObject = (props) => {
    let navigate = useNavigate();
    const routeChange = () => {
        let path = returnProjectURL(props.project_id);
        navigate(path);
    }

    const date = returnFormattedDate(props.updatedAt);
    return (
        <div className='headerobject' onClick={routeChange}>
            <div className='headerobject-cover'>
                {props.cover && <img alt='cover' src={props.cover} />}
            </div>
            <div className='headerobject-text'>
                <h2>{props.title}</h2>
                <p>Last Updated at {date.month} {date.day}, {date.year}</p>
                {props.overview ? <p>{props.overview}</p> : null}
                <div className='headerobject-label'>
                    {props.labels ? props.labels.map(
                        (label, index) =>
                            <p key={index}
                                className='headerobject-label-text'>{label}
                            </p>
                    )
                        : null}
                </div>
            </div>
        </div>
    )
}

export default HeaderObject;