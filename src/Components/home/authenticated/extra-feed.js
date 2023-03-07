import React from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import _ from 'lodash';
import AxiosHelper from 'utils/axios';
import { distanceSwitch } from 'utils/constants/states';
import { geoLocationOptions, REGULAR_CONTENT_REQUEST_LENGTH } from 'utils/constants/settings';
import { addRemainingCachedContent, addRemainingContent, addRemainingDynamicContent, convertPursuitToQueue, extractContentFromRaw, getCachedType, getDynamicType, initializeContent, setSimilarPeopleAdvanced } from 'store/services/extra-feed';
import { CACHED, DYNAMIC, EXTRAS_STATE, POST, POST_VIEWER_MODAL_STATE, USER } from 'utils/constants/flags';
import EventController from 'components/timeline/timeline-event-controller';
import PostController from "components/post/index";
import { alterRawCommentArray, updateProjectPreviewMap } from 'utils';
import Modal from './modal';
import UserFeedItem from './user-feed-item';

const _formatPursuitsForQuery = (pursuits) => {
    const formatted = [];
    for (let i = 1; i < pursuits.length; i++) {
        const pursuit = pursuits[i];
        formatted.push({ name: pursuit.name, experience: pursuit.experience_level });
    }
    return formatted;
}

class ExtraFeed extends React.Component {
    _isMounted = false;
    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            hasMore: true,
            nextOpenPostIndex: 0,
            numOfContent: 0,
            distance: 10000000,
            lat: null,
            long: null,
            contentList: [],
            feedData: [],
            projectPreviewMap: {},
            formattedPursuits: _formatPursuitsForQuery(this.props.authUser.pursuits),
            dynamic: {
                usedPeople: [this.props.authUser.userPreviewID],
                beginner: [],
                familiar: [],
                experienced: [],
                expert: []
            },
            selected: null,
            textData: null,
            selectedIndex: null,
        }

        this.debounceFetch = _.debounce(() => this.fetch(), 10);
        this.fetch = this.fetch.bind(this);
        this.getContent = this.getContent.bind(this);
        this.initializeFirstPull = this.initializeFirstPull.bind(this);
        this.onSuccess = this.onSuccess.bind(this);
        this.onError = this.onError.bind(this);
        this.displayFeed = this.displayFeed.bind(this);
        this.checkValidLocation = this.checkValidLocation.bind(this);
        this.setCoordinates = this.setCoordinates.bind(this);
        this.getDynamicFeed = this.getDynamicFeed.bind(this);
        this.getCachedFeed = this.getCachedFeed.bind(this);
        this.getSpotlight = this.getSpotlight.bind(this);
        this.mergeData = this.mergeData.bind(this);
        this.prepareRenderedFeedInput = this.prepareRenderedFeedInput.bind(this);
        this.handleEventClick = this.handleEventClick.bind(this);
        this.handleCommentIDInjection = this.handleCommentIDInjection.bind(this);
        this.saveProjectPreview = this.saveProjectPreview.bind(this);
        this.setFeedState = this.setFeedState.bind(this);
        this.setModal = this.setModal.bind(this);
        this.closeModal = this.closeModal.bind(this);

    }

    handleEventClick(index) {
        this.props.passDataToModal(this.state.feedData[index], EXTRAS_STATE, index);
    }

    componentDidMount() {
        this._isMounted = true;
        return AxiosHelper
            .getLocation(this.props.authUser.userPreviewID)
            .then(this.checkValidLocation)


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

    checkValidLocation(results) {
        if (results.status === 204) {
            //first time
            navigator
                .geolocation
                .getCurrentPosition(this.onSuccess, this.onError, geoLocationOptions);
        }
        else {
            //usual time
            console.log(results.data);
            this.setCoordinates(results.data.coordinates);
        }
    }

    setCoordinates(crd) {
        console.log(crd);
        this.setState({
            lat: crd[1],
            long: crd[0]
        }, this.getContent);
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

    displayFeed(feed) {
        return feed.map(item => <p>{item}</p>)
    }


    initializeFirstPull() {
        AxiosHelper.setLocation(
            this.state.lat,
            this.state.long,
            this.props.authUser.userPreviewID)
            .then(result => {
                alert("Location Set!")
                return this.getContent()
            });
    }

    prepareRenderedFeedInput(cached, dynamic) { //cached comes with all post data
        const contentList = [];
        const usedPeople = [];

        //return a generated feed 
        const newIndices = extractContentFromRaw(
            cached,
            dynamic,
            contentList,
            usedPeople
        );

        //finish cached  
        addRemainingCachedContent(
            newIndices.cachedTypeIndex,
            newIndices.cachedItemIndex,
            cached,
            contentList,
        );

        addRemainingDynamicContent(
            {
                pursuitIndex: newIndices.pursuitIndex,
                max: dynamic.length
            },
            dynamic,
            contentList,
            usedPeople
        );

        return { contentList, usedPeople };
    }

    getContent() {
        return this.getDynamicFeed()
            .then((results) => {
                const extractedData = this.prepareRenderedFeedInput(this.props.cached, results);
                const contentList = extractedData.contentList;
                const usedPeople = [
                    ...new Set(
                        this.state.dynamic.usedPeople.concat(extractedData.usedPeople)
                    )];

                return this.setState({
                    dynamic: results,
                    usedPeople,
                    contentList,
                }, this.fetch)
            })
    }

    setFeedState(content, hasMore, nextOpenPostIndex, numOfContent) {
        this.setState({
            feedData: content,
            hasMore: hasMore,
            nextOpenPostIndex,
            numOfContent,
            loading: false,
        })
    }

    mergeData(old, data) {
        const dictionary = {};
        data.forEach(item => { dictionary[item._id] = item });
        return old.map(item => item.data = dictionary[item.post]);
    }

    fetch() { //fetch for the timeline
        this.debounceFetch.cancel();
        const slicedPostIDs = this.state.contentList.slice(
            this.state.nextOpenPostIndex,
            this.state.nextOpenPostIndex + REGULAR_CONTENT_REQUEST_LENGTH
        );
        const formatted = slicedPostIDs.filter(object => !!object.post);
        if (formatted.length > 0)
            return AxiosHelper
                .returnMultiplePosts(formatted)
                .then((results) => {
                    console.log(results.data.contentList);
                    const merged = this.mergeData(slicedPostIDs, results.data.contentList);
                    const content = this.state.feedData.concat(merged);
                    const hasMore = REGULAR_CONTENT_REQUEST_LENGTH === content.length;
                    const nextOpenPostIndex = this.state.nextOpenPostIndex + REGULAR_CONTENT_REQUEST_LENGTH;
                    const numOfContent = this.state.numOfContent + content.length;
                    this.setFeedState(content, hasMore, nextOpenPostIndex, numOfContent);
                })
                .catch(err => console.log(err))
        else {
            const curLength = this.state.feedData.length + slicedPostIDs.length;
            const content = this.state.feedData.concat(slicedPostIDs);
            const hasMore = curLength < this.state.contentList.length;
            const nextOpenPostIndex = this.state.nextOpenPostIndex + REGULAR_CONTENT_REQUEST_LENGTH;
            const numOfContent = this.state.numOfContent + slicedPostIDs.length;
            this.setFeedState(content, hasMore, nextOpenPostIndex, numOfContent);
        }
    }

    getCachedFeed() { //initial
        return AxiosHelper
            .getCachedFeed(this.props.authUser.cached_feed_id)
    }

    getDynamicFeed() {
        const distance = distanceSwitch(this.state.distance);

        return AxiosHelper.getSimilarPeopleAdvanced(
            distance,
            this.state.formattedPursuits,
            this.state.dynamic.usedPeople,
            this.state.lat,
            this.state.long)
            .then((results) => {
                const data = results.data;
                return data.map(convertPursuitToQueue);
            }
            );
    }

    handlePulledFeedData(pursuits) {
        // this.setState((state) => ({
        //     usedPeople: state.usedPeople.concat(pursuits),
        //     loading: false,
        // }))
    }

    saveProjectPreview(projectPreview) {
        if (!this.state.projectPreviewMap[projectPreview._id]) {
            let projectPreviewMap =
                updateProjectPreviewMap(
                    this.state.projectPreviewMap,
                    projectPreview
                );
            this.setState({ projectPreviewMap });
        }
    }

    handleCommentIDInjection(postIndex, rootCommentsArray) {
        const feedData = alterRawCommentArray(
            postIndex, rootCommentsArray, this.state.feedData)
        this.setState({ feedData })
    }

    createFeedRow(viewerObjects, viewerFunctions) {
        if (!this._isMounted || this.state.feedData.length === 0) {
            return [];
        }
        return this.state.feedData.map(
            (item, index) => {
                console.log(item);
                switch (item.type) {
                    case (POST):
                        const viewerObject = {
                            key: index,
                            largeViewMode: false,
                            textData: item.data.text_data,
                            eventData: item.data,
                            ...viewerObjects
                        }

                        return (
                            <div key={index} className='returninguser-feed-object'>
                                <PostController
                                    isViewer
                                    viewerObject={viewerObject}
                                    viewerFunctions={viewerFunctions}
                                    authUser={this.props.authUser}
                                    closeModal={this.closeModal}
                                />
                            </div>)
                    case (USER):
                        return (
                            <div key={index} className='returninguser-feed-object'>
                                <UserFeedItem
                                    {...item.content}
                                    data={item.data}
                                />
                            </div>
                        )
                    default:
                        throw new Error("Malformed content type")

                }
            })
    }


    setModal(data, text, index) {
        console.log(data);
        this.setState({
            selected: data,
            textData: text,
            selectedIndex: index
        }, () => this.props.openMasterModal(POST_VIEWER_MODAL_STATE));
    }

    closeModal() {
        this.setState({ selected: null },
            this.props.closeMasterModal());
    }

    render() {

        const sharedViewerObjects = {
            isPostOnlyView: false,
            pursuitObjects: this.props.pursuitObjects,
            projectPreviewMap: this.state.projectPreviewMap,
        }

        const viewerFunctions = {
            onCommentIDInjection: this.handleCommentIDInjection, //used to inject comment data
            saveProjectPreview: this.saveProjectPreview,
            setModal: this.setModal,
            clearModal: this.closeModal,
        }

        if (this.state.loading) {
            return <p>Loading</p>
        }
        return (
            <div>
                <Modal
                    {...sharedViewerObjects}
                    authUser={this.props.authUser}
                    modalState={this.props.modalState}
                    viewerFunctions={viewerFunctions}
                    selectedIndex={this.state.selectedIndex}
                    selected={this.state.selected}

                    returnModalStructure={this.props.returnModalStructure}
                    clearModal={this.closeModal}
                />
                <div id='returninguser-infinite-scroll'>
                    <InfiniteScroll
                        dataLength={this.state.numOfContent}
                        next={this.debounceFetch}
                        hasMore={this.state.hasMore}
                        loader={<h4>Loading...</h4>}
                        endMessage={
                            <p style={{ textAlign: 'center' }}>
                                <b>Yay! You have seen it all</b>
                            </p>}>
                        {this.createFeedRow(sharedViewerObjects, viewerFunctions)}

                        {/* {this.displayFeed(this.state.postIDList)} */}
                    </InfiniteScroll>
                </div>
            </div>

        );
    }
}

export default ExtraFeed;