import React from 'react';

const Results = (props) => {
    const formatted = props.people.map(
        person => {
            return (
                <div key={person._id}>
                    {person.first_name}
                    {person.last_name}
                </div>
            )
        }
    )
    return (
        <div id='results-container'>
            {formatted}
        </div>
    )
}

export default Results;