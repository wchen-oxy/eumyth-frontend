import React from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import _ from 'lodash';
import AxiosHelper from 'utils/axios';
import { geoLocationOptions, REGULAR_CONTENT_REQUEST_LENGTH } from 'utils/constants/settings';
import { convertPursuitToQueue, joinCached, joinDynamic, mergeArrays } from 'store/services/extra-feed';
import { EXTRAS_STATE, POST, POST_VIEWER_MODAL_STATE, USER } from 'utils/constants/flags';
import PostController from "components/post/index";
import { updateProjectPreviewMap } from 'utils';
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
            distance: 1000000000000000,
            lat: null,
            long: null,
            contentList: [],
            feedData: [],
            projectPreviewMap: {},
            formattedPursuits: _formatPursuitsForQuery(this.props.authUser.pursuits),
            usedPeople: [this.props.authUser.userPreviewID],
            dynamic: {
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
        // this.getCachedFeed = this.getCachedFeed.bind(this);
        this.formatFeed = this.formatFeed.bind(this);
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
        else if (results.status === 200) {
            //usual time
            this.setCoordinates(results.data.coordinates);
        }
        else{
            throw new Error("Unexpected Coordinates results")
        }
    }

    setCoordinates(crd) {
        console.log(crd);
        const coordinates = crd;
        this.setState({
            lat: coordinates[1],
            long: coordinates[0]
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

    prepareRenderedFeedInput(cached, dynamic, isSeperated) { //cached comes with all post data
        // const sortedDynamic = dynamic.sort(sortByNearest)
        const contentList = [];
        const coordinates = { long: this.state.long, lat: this.state.lat }
        if (isSeperated) {
            // const usedPeople = {};

            // const newIndices = extractContentFromRaw(
            //     cached,
            //     dynamic,
            //     contentList,
            //     usedPeople,
            //     coordinates,
            // );
            // console.log(contentList);
            // //finish cached  
            // addRemainingCachedContent(
            //     newIndices.cachedTypeIndex,
            //     newIndices.cachedItemIndex,
            //     cached,
            //     contentList,
            // );

            // addRemainingDynamicContent(
            //     {
            //         pursuitIndex: newIndices.pursuitIndex,
            //         numOfPursuits: dynamic.length
            //     },
            //     dynamic,
            //     contentList,
            //     usedPeople,
            //     coordinates,

            // );

            // const keys = [];
            // for (const key in usedPeople) {
            //     keys.push(key)
            // }
            // return { contentList, keys };
        }
        else {
            const usedPeople = new Set();
            const _comparison = (a, b) => { return a.content.distance - b.content.distance };
            const formattedDynamic = joinDynamic(dynamic, coordinates, usedPeople).sort(_comparison);
            const formattedCached = joinCached(cached);
            mergeArrays(formattedDynamic, formattedCached, contentList);

            return { contentList, keys: usedPeople.keys() };
        }

        // contentList.sort((a, b) => {
        //     console.log(a, b);
        //     if (a.content && b.content) {
        //         return a.content.distance - b.content.distance
        //     };
        //     if (!a.content || b.content)
        // })


    }

    // getCachedFeed() { //initial
    //     return AxiosHelper
    //         .getCachedFeed(this.props.authUser.cached_feed_id)
    // }


    formatFeed(results) { //problem area is here
        const queuedData = results.data.map((item) => { return convertPursuitToQueue(item) }); //converts pursuit categories by exact and different to queues
        const extractedData = this.prepareRenderedFeedInput(this.props.cached, queuedData);
        const contentList = extractedData.contentList;
        const usedPeople = [
            ...new Set(
                this.state.usedPeople.concat(extractedData.usedPeople)
            )];
        return { dynamic: results, usedPeople, contentList };
    }

    getContent() {
        const baseFeedData = this
            .getDynamicFeed()
            .then(this.formatFeed);
        return baseFeedData.then((results) => this.fetch(results));
    }


    getDynamicFeed() {
        const distance = this.state.distance;
        return AxiosHelper
            .getSimilarPeopleAdvanced(
                distance,
                this.state.formattedPursuits,
                this.state.usedPeople,
                this.state.lat,
                this.state.long);
    }

    setFeedState(content, hasMore, nextOpenPostIndex, numOfContent, prevResults) {
        return this.setState({
            ...prevResults,
            feedData: content,
            hasMore: hasMore,
            nextOpenPostIndex,
            numOfContent,
            loading: false,
        })
    }

    mergeData(parentData, posts) {
        const dictionary = {};
        posts.forEach(item => { dictionary[item._id] = item });
        return parentData.map(item => {
            const postID = item.post ? item.post : undefined;
            if (postID) {
                item.data = dictionary[item.post];
            }
            return item;
        });

    }

    fetch(prevResults) { //fetch for the timeline
        this.debounceFetch.cancel();
        const content = prevResults ? prevResults.contentList : this.state.contentList;
        const slicedPostIDs = content.slice(
            this.state.nextOpenPostIndex,
            this.state.nextOpenPostIndex + REGULAR_CONTENT_REQUEST_LENGTH
        );
        const formatted = slicedPostIDs
            .filter(object => !!object.post)
            .map(item => item.post);
        if (formatted.length > 0)
            return AxiosHelper
                .returnMultiplePosts(formatted, true)
                .then((results) => {
                    const merged = this.mergeData(slicedPostIDs, results.data.posts);
                    const content = this.state.feedData.concat(merged);
                    const hasMore = REGULAR_CONTENT_REQUEST_LENGTH === content.length;
                    const nextOpenPostIndex = this.state.nextOpenPostIndex + REGULAR_CONTENT_REQUEST_LENGTH;
                    const numOfContent = this.state.numOfContent + content.length;
                    return this.setFeedState(content, hasMore, nextOpenPostIndex, numOfContent, prevResults);
                })
                .catch(err => console.log(err))
        else {
            const curLength = this.state.feedData.length + slicedPostIDs.length;
            const content = this.state.feedData.concat(slicedPostIDs);
            const hasMore = curLength < this.state.contentList.length;
            const nextOpenPostIndex = this.state.nextOpenPostIndex + REGULAR_CONTENT_REQUEST_LENGTH;
            const numOfContent = this.state.numOfContent + slicedPostIDs.length;
            return this.setFeedState(content, hasMore, nextOpenPostIndex, numOfContent, prevResults);
        }
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
        const feedData = this.state.feedData;
        feedData[postIndex].data.comment_count += 1;
        this.setState({ feedData })
    }

    createFeedRow(viewerObjects, viewerFunctions) {
        if (!this._isMounted || this.state.feedData.length === 0) {
            return [];
        }
        return this.state.feedData.map(
            (item, index) => {
                const viewerObject = {
                    key: index,
                    largeViewMode: false,
                    isPostOnlyView: false,
                    postIndex: index,
                    ...viewerObjects
                }
                switch (item.type) {
                    case (POST):
                        viewerObject['eventData'] = item.data;
                        viewerObject['textData'] = item.data.text_data;
                        return (
                            <div key={index} className='returninguser-feed-object extrafeed-object'>
                                <PostController
                                    isViewer
                                    viewerObject={viewerObject}
                                    viewerFunctions={viewerFunctions}
                                    authUser={this.props.authUser}
                                />
                            </div>)
                    case (USER):
                        return (
                            <div key={index} className='returninguser-feed-object'>
                                <UserFeedItem
                                    {...item}
                                    lat={this.state.lat}
                                    long={this.state.long}
                                    viewerObject={viewerObject}
                                    viewerFunctions={viewerFunctions}
                                    authUser={this.props.authUser}
                                    projectPreviewMap={this.state.projectPreviewMap}

                                />
                            </div>
                        )
                    default:
                        throw new Error("Malformed content type")

                }
            })
    }


    setModal(data, text, index) {
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
            pursuitObjects: this.props.pursuitObjects,
            projectPreviewMap: this.state.projectPreviewMap,
            windowWidth: this.props.windowWidth
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