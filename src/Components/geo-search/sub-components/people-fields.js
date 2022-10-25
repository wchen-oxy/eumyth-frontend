import React, { useState, useRef } from 'react';
import { PURSUIT_FIELD } from 'utils/constants/form-data';
import PursuitOption from './pursuit-option';


const PeopleFields = (props) => {
    const [isPursuitsVisible, setIsPursuitVisible] = useState(false);
     const pursuitDropdown = useRef(null);
    const overlay = useRef(null);
    const handleDisplayClick = () => {
        if (isPursuitsVisible) {
            pursuitDropdown.current.style.display = 'none';
            overlay.current.style.display = 'none';
            setIsPursuitVisible(false);
        }
        else {
            pursuitDropdown.current.style.display = 'block';
            overlay.current.style.display = "block";
            setIsPursuitVisible(true);
        }
    }
    const handlePursuitClick = (e) => {
        props.onFieldChange(e);
        handleDisplayClick();
    }

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') props.onRefreshClick();
    }
    return (
        <div id='peoplefields'>
            <div id='peoplefields-overlay' ref={overlay} onClick={handleDisplayClick}>
            </div>
            <div id='peoplefields-createable'
                className='peoplefields-fields input-hero-search' >
                <input
                    id='peoplefields-input-text'
                    type='text'
                    value={props.selectedPursuit}
                    onKeyDown={e => handleKeyPress(e)}
                    onChange={(e) => props.onFieldChange(PURSUIT_FIELD, e.target.value)} />
                <button onClick={handleDisplayClick}>
                    Your Pursuits
                </button>
                <div ref={pursuitDropdown} id='peoplefields-pursuit-dropdown'>
                    {props.pursuits.map(
                        pursuit =>
                            <PursuitOption
                                pursuit={pursuit}
                                onPursuitClick={handlePursuitClick} />
                    )}
                </div>

                <div id='peoplefields-distance'>
                    <select onChange={(e) => props.onDistanceChange(e.target.value)}>
                        <option value={10}>10 Miles</option>
                        <option value={50}>50 Miles</option>
                        <option value={100}>100 Miles</option>
                        <option value={250}>250 Miles</option>
                        <option value={500}>500 Miles</option>
                    </select>

                </div>
            </div>
            <div className='peoplefields-fields'>
                <button
                    id="peoplefields-refresh"
                    className="btn-round"
                    disabled={props.selectedPursuit.length === 0}
                    onClick={(e) => {
                        e.preventDefault();
                        props.onRefreshClick();
                    }}
                >
                    Search
                </button>
            </div>
        </div>

    )
}

export default PeopleFields;