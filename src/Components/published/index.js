import React from 'react';
import { AuthUserContext } from 'store/session';
import AxiosHelper from 'utils/axios';
import Fields from './sub-components/fields';
import Spotlight from './sub-components/spotlight';
import Results from './sub-components/results';
import { ALL, RESULTS, SPOTLIGHT } from 'utils/constants/flags';
import { PURSUIT_FIELD } from 'utils/constants/form-data';
import { DYNAMIC_CONTENT_LENGTH } from 'utils/constants/settings';

const Published = (props) =>
(
    <AuthUserContext.Consumer>
        {
            authUser =>
                <AuthenticatedProjectSearch
                    {...props}
                    authUser={authUser}
                />

        }
    </AuthUserContext.Consumer>
);

class AuthenticatedProjectSearch extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            options: null,
            display: SPOTLIGHT,
            spotlight: [],
            pursuits: null,
            selectedPursuit: ALL,
            finalPursuitObject: null,
            feedID: Math.random() * 8,

            results: [],
            resultsIDList: [],
            hasMore: true,

        }

        this.createTimeline = this.createTimeline.bind(this);
        this.setInitalState = this.setInitalState.bind(this);
        this.handleFieldChange = this.handleFieldChange.bind(this);
        this.handleSubmitSearch = this.handleSubmitSearch.bind(this);
    }

    componentDidMount() {
        //get the top branched project from all projects
        //set the current spotlight project with the top branch one
        return AxiosHelper.getSpotlightProjects(2, ['ALL'])
            .then(results => {
                this.setInitalState(results.data.projects)
            })

    }

    createTimeline(inputArray) {
        console.log(inputArray);
        console.log('HHJK')
        const hasMore = inputArray.length !== DYNAMIC_CONTENT_LENGTH ? false : true;
        const results = this.state.results
            .concat(inputArray);
        const resultsIDList = inputArray.map(project => project._id);
        this.setState({ resultsIDList, results, hasMore });

    }

    setInitalState(data) {
        let state = null;
        if (this.props.authUser) {
            const pursuits = this.props.authUser.pursuits
                .map(pursuit => pursuit.name);
            state = {
                spotlight: data,
                pursuits,
                finalPursuitObject: pursuits
            };
        }
        else {
            state = { spotlight: data }
        }
        this.setState({ ...state })
    }

    handleFieldChange(type, value) {
        switch (type) {
            case (PURSUIT_FIELD):
                const finalPursuitObject = value === ALL ?
                    this.state.pursuits : value;
                this.setState({ selectedPursuit: value, finalPursuitObject })
                break;
            default:
        }

    }

    handleSubmitSearch() {
        return AxiosHelper
            .searchProject(
                this.state.finalPursuitObject,
                [],
                DYNAMIC_CONTENT_LENGTH,
                this.props.authUser.indexProfileID
            )
            .then(results => {
                const resultsIDList = results.data.map(project => project._id)
                this.setState({
                    feedID: this.state.feedID + 1,
                    results: results.data,
                    resultsIDList: resultsIDList,
                    display: RESULTS,
                    hasMore: results.data.length !== DYNAMIC_CONTENT_LENGTH ? false : true
                })
            })

    }

    render() {
        return (
            <div>
                < Fields
                    pursuits={this.state.pursuits}
                    onFieldChange={this.handleFieldChange}
                    onSubmitSearch={this.handleSubmitSearch}
                />
                {this.state.display === SPOTLIGHT ?
                    <Spotlight
                        {...this.props}
                        spotlight={this.state.spotlight}
                    />
                    :
                    <Results
                        {...this.props}
                        results={this.state.results}
                        pursuitObject={this.state.finalPursuitObject}
                        resultsIDList={this.state.resultsIDList}
                        createTimeline={this.createTimeline}
                        hasMore={this.state.hasMore}
                        feedID={this.state.feedID}
                        submittingIndexUserID={this.props.authUser.indexProfileID}
                    />
                }
            </div>
        );
    }
}

export default Published;