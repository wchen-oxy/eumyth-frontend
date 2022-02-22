import Timeline from 'components/timeline';
import React from 'react';
import { DYNAMIC } from 'utils/constants/flags';
import { DYNAMIC_CONTENT_LENGTH } from 'utils/constants/settings';
import SpotlightPreview from './spotlight-preview';

class Results extends React.Component {
    constructor(props) {
        super(props);
        this.state = {

        }

        this.shouldPull = this.shouldPull.bind(this);
        this.createRenderedPosts = this.createRenderedPosts.bind(this);
    }
 
    shouldPull(value) {
        this.setState({ hasMore: value });
    }

    createRenderedPosts() {
        if (this.props.results.length === 0) return [];
        else {
            return this.props.results.map(
                project =>
                    <SpotlightPreview
                        {...this.props}
                        project={project} />
            )
        }
    }

    render() {
        return (
            <div>
                <Timeline
                    feedID={this.props.feedID}
                    contentType={DYNAMIC}
                    requestQuantity={DYNAMIC_CONTENT_LENGTH}
                    pursuitObject={this.props.pursuitObject}
                    resultsIDList={this.props.resultsIDList}
                    submittingIndexUserID={this.props.submittingIndexUserID}
                    loadedFeed={this.createRenderedPosts()}
                    hasMore={this.props.hasMore}
                    nextOpenPostIndex={this.state.nextOpenPostIndex}

                    shouldPull={this.shouldPull}
                    createTimelineRow={this.props.createTimeline}
                />

            </div>
        )
    }
}

export default Results;