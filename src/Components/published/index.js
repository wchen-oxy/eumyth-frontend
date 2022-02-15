import React from 'react';
import { AuthUserContext} from 'store/session';
import AxiosHelper from 'utils/axios';
import Fields from './sub-components/fields';
import Spotlight from './sub-components/spotlight';
import Results from './sub-components/results';
import { ALL, RESULTS, SPOTLIGHT  } from 'utils/constants/flags';
import { PURSUIT_FIELD } from 'utils/constants/form-data';

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
            results: [],
            resultsIDList: [],
        }
        this.setInitalState = this.setInitalState.bind(this);
        this.handleFieldChange = this.handleFieldChange.bind(this);
        this.handleSubmitSearch = this.handleSubmitSearch.bind(this);
    }

    componentDidMount() {
        //get the top branched project from all projects
        //set the current spotlight project with the top branch one
        return AxiosHelper.getSpotlightProjects(2, ['ALL'])
            .then(results => {
                console.log(results.data);
                this.setInitalState(results.data.projects)
            })

    }

    setInitalState(data) {
        console.log(data);
        const state = this.props.authUser ?
            {
                spotlight: data,
                pursuits:
                    this.props.authUser.pursuits
                        .map(pursuit => pursuit.name)
            } :
            { spotlight: data }
        this.setState({ ...state })
    }

    handleFieldChange(value) {
        switch (value) {
            case (PURSUIT_FIELD):
                this.setState({ selectedPursuit: value })
                break;
            default:
        }

    }

    handleSubmitSearch() {
        const pursuits = this.state.selectedPursuit === ALL ?
            this.state.pursuits : this.state.selectedPursuit;
            console.log(pursuits);
        return AxiosHelper.searchProject(pursuits, this.state.resultsIDList)
            .then(results => {
                console.log(results);
                const resultsIDList = results.data.map(project => project._id)
                this.setState({
                    results: results.data,
                    resultsIDList: resultsIDList,
                    display: RESULTS
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
                    <Results results={this.state.results} />
                }
            </div>
        );
    }
}

export default Published;