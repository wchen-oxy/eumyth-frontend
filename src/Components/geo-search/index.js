import React from 'react';
import { AuthUserContext } from 'store/session';
import AxiosHelper from 'utils/axios';
import Results from './results';
import GeoSpotlight from './geo-spotlight';
import ShortPostViewer from 'components/post/viewer/short-post';
import PeopleFields from './sub-components/people-fields';
import { POST_VIEWER_MODAL_STATE, SPOTLIGHT_POST } from 'utils/constants/flags';
import { DIFFICULTY_FIELD, DISTANCE_FIELD, PROGRESSION_FIELD, PURSUIT_FIELD } from 'utils/constants/form-data';
import './index.scss';

const SPOTLIGHT = 'SPOTLIGHT';
const RESULTS = 'RESULTS';

const options = {
    enableHighAccuracy: true,
    timeout: 5000,
    maximumAge: 0
};
function capitalize(string) {
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
}


const GeoSearch = (props) =>
(<AuthUserContext.Consumer>
    {
        authUser =>
            <AuthenticatedGeoSearch
                {...props}
                authUser={authUser}
            />

    }
</AuthUserContext.Consumer>);

class AuthenticatedGeoSearch extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            lat: null,
            long: null,
            resultState: SPOTLIGHT,
            spotlight: [],
            people: [],
            pursuits: this.props.authUser.pursuits.map(item => item.name),
            selectedContent: null,

            distance: 10,
            difficulty: 0,
            progression: 1,
            selectedPursuit: 'ALL',
        }
        this.success = this.success.bind(this);
        this.error = this.error.bind(this);
        this.getSpotlight = this.getSpotlight.bind(this);
        this.setModal = this.setModal.bind(this);
        this.clearModal = this.clearModal.bind(this);
        this.renderModal = this.renderModal.bind(this);
        this.handleEventClick = this.handleEventClick.bind(this);
        this.handleFieldChange = this.handleFieldChange.bind(this);
        this.handleRefreshClick = this.handleRefreshClick.bind(this);
        this.handleDistanceChange = this.handleDistanceChange.bind(this);
        this.refreshResults = this.refreshResults.bind(this);


    }
    componentDidMount() {
        return AxiosHelper.getLocation(this.props.authUser.userPreviewID)
            .then(results => {
                if (results.status === 204) {
                    navigator
                        .geolocation
                        .getCurrentPosition(this.success, this.error, options);
                }
                else {
                    const crd = results.data.coordinates;
                    this.setState({
                        lat: crd.latitude,
                        long: crd.longitude
                    }, () => this.getSpotlight(results.data.coordinates));
                }
            });
    }

    success(pos) {
        const crd = pos.coords;
        // console.log('Your current position is:');
        // console.log(`Latitude : ${crd.latitude}`);
        // console.log(`Longitude: ${crd.longitude}`);
        // console.log(`More or less ${crd.accuracy} meters.`);

        this.setState({
            lat: crd.latitude,
            long: crd.longitude
        }, () => this.getSpotlight(crd));

        return AxiosHelper.setLocation(
            crd.latitude,
            crd.longitude,
            this.props.authUser.userPreviewID)
            .then(result => {
                alert("Location Set!")
            });
    }

    error(err) {
        console.warn(`ERROR(${err.code}): ${err.message}`);
    }

    getSpotlight(crd) {
        return AxiosHelper.getSpotlight(
            5,
            crd.latitude,
            crd.longitude,
            [this.props.authUser.userPreviewID])
            .then(result => {
                this.setState({ spotlight: result.data.users });
            });
    }


    setModal() {
        this.props.openMasterModal(POST_VIEWER_MODAL_STATE);
    }

    clearModal() {
        this.setState({
            selectedContent: null
        },
            this.props.closeMasterModal());
    }

    handleEventClick(selectedContent, postIndex) {
        this.setState({
            selectedContent,
        }, this.setModal());

    }

    renderModal() {
        if (this.props.modalState === POST_VIEWER_MODAL_STATE &&
            this.state.selectedContent) {
            const formattedTextData = this.state.selectedContent?.text_data && this.state.selectedContent.is_paginated ?
                JSON.parse(this.state.selectedContent.text_data) : this.state.selectedContent.text_data;

            const content = (
                <ShortPostViewer
                    authUser={this.props.authUser}
                    key={this.state.selectedContent._id}
                    largeViewMode={true}
                    isPostOnlyView={false}
                    postType={SPOTLIGHT_POST}
                    eventData={this.state.selectedContent}
                    textData={formattedTextData}
                />
            )
            return this.props.returnModalStructure(
                content,
                this.clearModal
            )
        }
        else {
            return null;
        }
    }

    handleFieldChange(field, value) {
        switch (field) {
            case (DIFFICULTY_FIELD):
                this.setState({ difficulty: value });
                break;
            case (PROGRESSION_FIELD):
                this.setState({ progression: value });
                break;
            case (DISTANCE_FIELD):
                this.setState({ distance: value });
                break;
            case (PURSUIT_FIELD):
                this.setState({ selectedPursuit: value });
                break;
            default:
                throw new Error("No fields matched");
        }

    }

    handleRefreshClick() {
        this.setState({ loading: true }, this.refreshResults)
    }

    handleDistanceChange(distance) {
        this.setState({ distance })
    }

    refreshResults() {
        const selectedPursuit = this.state.selectedPursuit === 'ALL' ?
            this.state.pursuits.slice(1) : [capitalize(this.state.selectedPursuit)];
        const selectedPeople = this.state.people.map(person => person._id);
        selectedPeople.push(this.props.authUser.userPreviewID);

        AxiosHelper
            .getSimilarPeople(
                this.state.distance,
                selectedPursuit,
                selectedPeople,
                this.state.lat,
                this.state.long,
            )
            .then(results => {
                console.log(results);
                if (results.data.users.length === 0 && this.state.people.length === 0) {
                    return;
                }
                else {
                    let people = this.state.people.concat(results.data.users);
                    this.setState({
                        people,
                        loading: false,
                        resultState: RESULTS
                    })
                }
            })
    }

    render() {
        return (
            <div>
                <div id="geosearch-header-container">
                    {/* <div id="geosearch-title-container">
                        <h1>See What People Like You Are Doing</h1>
                    </div> */}
                    <PeopleFields
                        pursuits={this.state.pursuits}
                        onFieldChange={this.handleFieldChange}
                        onRefreshClick={this.handleRefreshClick}
                        selectedPursuit={this.state.selectedPursuit}
                        onDistanceChange={this.handleDistanceChange}

                    />
                    {/* <PostFields
                        onFieldChange={this.handleFieldChange}
                        onRefreshClick={this.handleRefreshClick}

                    /> */}
                </div>

                <div id="geosearch-results-container">
                    {this.state.resultState === "SPOTLIGHT" ?
                        <GeoSpotlight
                            users={this.state.spotlight}
                            onEventClick={this.handleEventClick}
                        /> :
                        this.state.people.length > 0 ?
                            this.state.people.map(
                                person =>
                                    <Results
                                        person={person}
                                        onEventClick={this.handleEventClick}
                                    />)

                            :
                            <p>No Results Found</p>
                    }
                </div>
                {this.renderModal()}
            </div >
        );
    }
}

export default GeoSearch;

