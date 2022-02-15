import React from 'react';

class Results extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        return (
            <div>
                {this.props.results.length === 0 && <p>No Results Found</p>}
                {this.props.results.length !== 0 &&
                    <p>{this.props.results.map(item => item._id)}</p>
                }

            </div>
        )
    }
}

export default Results;