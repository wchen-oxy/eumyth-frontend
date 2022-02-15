import React, { useState } from 'react';
import AxiosHelper from 'utils/axios';
import './spotlight-meta.scss';

const SpotlightMeta = (props) => {
    const [ancestorState, setAncestorState] = useState(false);
    const [retrievedAncestorInfo, setAncestorInfo] = useState(null);
    const getAncestorInfo = () => {
        setAncestorState(!ancestorState)
    }
    return (
        <div>
            {props.parent && <a href={'/c/' + props.parent}>See Parent</a>}
            <p>Start Date: {props.startDate ? props.startDate : "n/a"}</p>
            <p>Start Date: {props.endDate ? props.endDate : "n/a"}</p>
            <p>Duration: {props.duration ? props.duration : 'n/a'}</p>
            <p>Total Posts: {props.postListLength ? props.postListLength : "n/a"}</p>
            <p>Total Ancestors: {props.ancestors.length}</p>
            <button onClick={getAncestorInfo}>
                {ancestorState ? "Hide Ancestors" : "Show Ancestors"}
            </button>
            {ancestorState && props.ancestors.length > 0 ?
                props.ancestors.map(
                    (ancestor, index) => {
                        if (index === 0)
                            return (
                                <div>
                                    <p>Original:  <a href={"/c/" + ancestor}>{ancestor}</a></p>
                                </div>)
                        else {
                            return (
                                <div>
                                    <p>{index + 1}.    <a href={"/c/" + ancestor}>{ancestor}</a></p>

                                </div>
                            )
                        }
                    }
                )
                : null
            }
            <p></p>
        </div>
    )
}

export default SpotlightMeta;