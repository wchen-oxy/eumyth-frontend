import React from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import AxiosHelper from 'utils/axios';
import { distanceSwitch } from 'utils/constants/states';
import { geoLocationOptions } from 'utils/constants/settings';

class ExtraFeed extends React.Component {
    _isMounted = false;
    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            nextOpenPostIndex: 0,
            distance: 50,
            lat: null,
            long: null,
            feedData: [],
            usedPeople: [this.props.authUser.userPreviewID]

        }

        this.initializeFirstPull = this.initializeFirstPull.bind(this);
        this.success = this.success.bind(this);
        this.error = this.error.bind(this);
        this.createFeed = this.createFeed.bind(this);
        this.getLocation = this.getLocation.bind(this);
        this.setCoordinates = this.setCoordinates.bind(this);
        this.pullFeedData = this.pullFeedData.bind(this);
        this.getSpotlight = this.getSpotlight.bind(this);

    }

    componentDidMount() {
        this._isMounted = true;
        this.getLocation()

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


    createFeed(feed) {
        return feed.map(item => <p>{item}</p>)
    }

    getLocation() {
        return AxiosHelper.getLocation(this.props.authUser.userPreviewID)
            .then(results => {
                if (results.status === 204) {
                    navigator
                        .geolocation
                        .getCurrentPosition(this.success, this.error, geoLocationOptions);
                }
                else {
                    this.setCoordinates(results.data.coordinates);
                }
            });
    }

    initializeFirstPull() {
        this.pullFeedData()
        AxiosHelper.setLocation(
            this.state.lat,
            this.state.long,
            this.props.authUser.userPreviewID)
            .then(result => {
                alert("Location Set!")
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
        }, this.initializeFirstPull);

    }

    error(err) {
        console.warn(`ERROR(${err.code}): ${err.message}`);
    }

    setCoordinates(crd) {
        this.setState({
            lat: crd.latitude,
            long: crd.longitude
        }, this.pullFeedData);
    }


    pullFeedData() {
        const distance = distanceSwitch(this.state.distance);
        const promisedSimilarPeople = AxiosHelper.getSimilarPeopleAdvanced(
            distance,
            this.props.pursuitObjects.names,
            this.state.usedPeople,
            this.state.lat,
            this.state.long);

        const promisedBranched = AxiosHelper.searchBranches()
        Promise.all([promisedSimilarPeople, promisedBranched])
        AxiosHelper.getSimilarPeopleAdvanced(
            distance,
            this.props.pursuitObjects.names,
            this.state.usedPeople,
            this.state.lat,
            this.state.long)
            .then(results => {
                const beginner = results.data.beginner;
                const familiar = results.data.familiar;
                const experienced = results.data.experienced;
                const expert = results.data.expert;

            })
    }

    handlePulledFeedData(pursuits) {


        this.setState((state) => ({
            usedPeople: state.usedPeople.concat(pursuits),
            loading: false,
        })
        )
    }
    render() {
        if (this.state.loading) {
            return <p>Loading</p>
        }
        console.log(this.state.usedPeople);
        return (
            <InfiniteScroll
                dataLength={this.state.nextOpenPostIndex}
                next={this.pullFeedData}
                hasMore={this.state.hasMore}
                loader={<h4>Loading...</h4>}
                endMessage={
                    <p style={{ textAlign: 'center' }}>
                        <b>Yay! You have seen it all</b>
                    </p>}>
                {/* FIXME ADD THE CONTENT HERE */}

                {this.createFeed(this.state.usedPeople)}
            </InfiniteScroll>
        );
    }
}

export default ExtraFeed;