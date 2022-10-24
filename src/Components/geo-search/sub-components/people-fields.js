import React, { useState, useRef } from 'react';
import PursuitOption from './pursuit-option';


const PeopleFields = (props) => {
    const [isPursuitsVisible, setIsPursuitVisible] = useState(false);
    const pursuitDropdown = useRef(null);
    const overlay = useRef(null);
    const handlePursuitClick = () => {
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

    return (
        <div id='peoplefields'>
            <div id='peoplefields-overlay' ref={overlay} onClick={handlePursuitClick}>
            </div>
            <div id='peoplefields-createable'
                className='peoplefields-fields input-hero-search' >
                <input id='peoplefields-input-text' type='text' />
                <button onClick={handlePursuitClick}>
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