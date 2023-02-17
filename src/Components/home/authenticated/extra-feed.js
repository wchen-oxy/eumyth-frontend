import React from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import _ from 'lodash';
import AxiosHelper from 'utils/axios';
import { distanceSwitch } from 'utils/constants/states';
import { geoLocationOptions } from 'utils/constants/settings';
import { addRemainingContent, getCachedType, getDynamicType, initializeContent, setSimilarPeopleAdvanced } from 'store/services/extra-feed';
import { CACHED, DYNAMIC } from 'utils/constants/flags';

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
            postIDList: [],
            cached: {
                following: [],
                parents: [],
                siblings: [],
                children: [],
            },
            dynamic: {
                usedPeople: [this.props.authUser.userPreviewID],
                beginner: [],
                familiar: [],
                experienced: [],
                expert: []
            },

        }
        this.debounceFetch = _.debounce(() => this.fetch(), 10);
        this.fetch = this.fetch.bind(this);
        this.getContent = this.getContent.bind(this);
        this.initializeFirstPull = this.initializeFirstPull.bind(this);
        this.onSuccess = this.onSuccess.bind(this);
        this.onError = this.onError.bind(this);
        this.displayFeed = this.displayFeed.bind(this);
        this.getLocation = this.getLocation.bind(this);
        this.setCoordinates = this.setCoordinates.bind(this);
        this.getDynamicFeed = this.getDynamicFeed.bind(this);
        this.getCachedFeed = this.getCachedFeed.bind(this);
        this.getSpotlight = this.getSpotlight.bind(this);
        this.extractContentIDs = this.extractContentIDs.bind(this);
    }

    componentDidMount() {
        this._isMounted = true;
        this.getLocation()
            .then(this.getContent);

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

    getLocation() {
        return AxiosHelper.getLocation(this.props.authUser.userPreviewID)
            .then(results => {
                if (results.status === 204) {
                    navigator
                        .geolocation
                        .getCurrentPosition(this.onSuccess, this.onError, geoLocationOptions);
                }
                else {
                    this.setCoordinates(results.data.coordinates);
                }
            });
    }

    displayFeed(feed) {
        return feed.map(item => <p>{item}</p>)
    }


    initializeFirstPull() {
        this.getDynamicFeed()
        AxiosHelper.setLocation(
            this.state.lat,
            this.state.long,
            this.props.authUser.userPreviewID)
            .then(result => {
                alert("Location Set!")
            });
    }

    onSuccess(pos) {
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

    onError(err) {
        console.warn(`onError(${err.code}): ${err.message}`);
    }

    setCoordinates(crd) {
        this.setState({
            lat: crd.latitude,
            long: crd.longitude
        }, this.getDynamicFeed);
    }

    extractContentIDs(cached, dynamic) { //cached comes with all post data
        const postIDList = [];

        let cachedTypeIndex = 0; //max is 4
        let cachedItemIndex = 0;
        let dynamicTypeIndex = 0; //max is 4
        let dynamicItemIndex = 0;

        //return a generated feed 
        const newIndices = initializeContent(
            cachedTypeIndex,
            cachedItemIndex,
            dynamicTypeIndex,
            dynamicItemIndex,
            cached,
            dynamic,
            postIDList,
        );

      console.log(newIndices);
        //finish cached  
        addRemainingContent(
            CACHED,
            newIndices.cachedTypeIndex,
            newIndices.cachedItemIndex,
            cached,
            postIDList
        );

        addRemainingContent(
            DYNAMIC,
            newIndices.dynamicTypeIndex,
            newIndices.dynamicItemIndex,
            dynamic,
            postIDList
        );

        return postIDList;
    }

    getContent() {
        const cached = this.getCachedFeed();
        const dynamic = this.getDynamicFeed();
        Promise.all([cached, dynamic])
            .then((results) => {
                console.log(results);
                const cached = results[0].data;
                const dynamic = results[1];
                const postIDList = this.extractContentIDs(cached, dynamic);

                this.setState({
                    cached,
                    dynamic,
                    postIDList,
                    loading: false,
                })
            })


    }

    fetch() {
        return AxiosHelper
            .returnMultiplePosts(this.state.postIDList, true)
            .then((results) => {
                console.log(results.data);
            })
    }

    getCachedFeed() {
        console.log("get cached");
        console.log(this.props.authUser);
        return AxiosHelper
            .getCachedFeed(this.props.authUser.cached_feed_id)
    }

    getDynamicFeed() {
        const distance = distanceSwitch(this.state.distance);
        return AxiosHelper.getSimilarPeopleAdvanced(
            distance,
            this.props.pursuitObjects.names,
            this.state.dynamic.usedPeople,
            this.state.lat,
            this.state.long)
            .then((results) => setSimilarPeopleAdvanced(results, this.state.dynamic.usedPeople));
    }

    handlePulledFeedData(pursuits) {
        // this.setState((state) => ({
        //     usedPeople: state.usedPeople.concat(pursuits),
        //     loading: false,
        // }))
    }


    render() {
        if (this.state.loading) {
            return <p>Loading</p>
        }
        return (
            <InfiniteScroll
                dataLength={this.state.nextOpenPostIndex}
                next={this.fetch}
                hasMore={this.state.hasMore}
                loader={<h4>Loading...</h4>}
                endMessage={
                    <p style={{ textAlign: 'center' }}>
                        <b>Yay! You have seen it all</b>
                    </p>}>

                {this.displayFeed(this.state.postIDList)}
            </InfiniteScroll>
        );
    }
}

export default ExtraFeed;