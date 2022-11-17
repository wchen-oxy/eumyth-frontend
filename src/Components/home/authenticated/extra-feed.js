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
        this.createFeed = this.createFeed.bind(this);
        this.getLocation = this.getLocation.bind(this);
        this.setCoordinates = this.setCoordinates.bind(this);
        this.pullFeedData = this.pullFeedData.bind(this);
    }

    componentDidMount() {
        this._isMounted = true;
        this.getLocation()

    }

    createFeed(feed) {
        feed.map(item => <p>{item.name}</p>)
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

    setCoordinates(crd) {
        this.setState({
            lat: crd.latitude,
            long: crd.longitude
        }, this.pullFeedData);
    }


    pullFeedData() {
        const distance = distanceSwitch(this.state.distance);
        AxiosHelper.getSimilarPeopleAdvanced(
            distance,
            this.props.pursuitObjects.names,
            this.state.usedPeople,
            this.state.lat,
            this.state.long)
            .then(results => {
                console.log(results);
                this.setState((state) => ({
                    usedPeople: state.usedPeople.concat(results.data.users),
                    loading: false,
                })
                )
            })
    }
    render() {
        if (this.state.loading) {
            return <p>Loading</p>
        }

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

                {/* {this.createFeed(this.state.usedPeople)} */}
            </InfiniteScroll>
        );
    }
}

export default ExtraFeed;