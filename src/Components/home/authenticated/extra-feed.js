import React from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import _ from 'lodash';
import AxiosHelper from 'utils/axios';
import { distanceSwitch } from 'utils/constants/states';
import { geoLocationOptions, REGULAR_CONTENT_REQUEST_LENGTH } from 'utils/constants/settings';
import { addRemainingContent, getCachedType, getDynamicType, initializeContent, setSimilarPeopleAdvanced } from 'store/services/extra-feed';
import { CACHED, DYNAMIC, EXTRAS_STATE, POST, POST_VIEWER_MODAL_STATE, USER } from 'utils/constants/flags';
import EventController from 'components/timeline/timeline-event-controller';
import PostController from "components/post/index";
import { alterRawCommentArray, updateProjectPreviewMap } from 'utils';
import Modal from './modal';

class ExtraFeed extends React.Component {
    _isMounted = false;
    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            hasMore: true,
            nextOpenPostIndex: 0,
            numOfContent: 0,
            distance: 50,
            lat: null,
            long: null,
            contentList: [],
            feedData: [],
            projectPreviewMap: {},
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
        this.extractContentIDs = this.extractContentIDs.bind(this);
        this.handleEventClick = this.handleEventClick.bind(this);
        this.handleCommentIDInjection = this.handleCommentIDInjection.bind(this);
        this.saveProjectPreview = this.saveProjectPreview.bind(this);
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
            this.setCoordinates(results.data.coordinates);
        }
    }

    setCoordinates(crd) {
        this.setState({
            lat: crd.latitude,
            long: crd.longitude
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



    extractContentIDs(cached, dynamic) { //cached comes with all post data
        const contentList = [];
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
            contentList,
        );
        console.log(contentList);
        //finish cached  
        addRemainingContent(
            CACHED,
            newIndices.cachedTypeIndex,
            newIndices.cachedItemIndex,
            cached,
            contentList
        );

        addRemainingContent(
            DYNAMIC,
            newIndices.dynamicTypeIndex,
            newIndices.dynamicItemIndex,
            dynamic,
            contentList
        );

        return contentList;
    }

    getContent() {
        return this.getDynamicFeed()
            .then((results) => {
                const dynamic = results.dynamic;
                const usedPeople = results.usedPeople;
                const contentList = this.extractContentIDs(this.props.cached, dynamic);

                return this.setState({
                    dynamic,
                    usedPeople,
                    contentList,
                }, this.fetch)
            })
    }

    fetch() { //fetch for the timeline
        this.debounceFetch.cancel();
        const slicedPostIDs = this.state.contentList.slice(
            this.state.nextOpenPostIndex,
            this.state.nextOpenPostIndex + REGULAR_CONTENT_REQUEST_LENGTH
        );
        console.log(slicedPostIDs);
        return AxiosHelper
            .returnExtraFeedContent(slicedPostIDs)
            .then((results) => {
                console.log(results);
                const content = results.data.contentList;
                this.setState({
                    feedData: content,
                    hasMore: REGULAR_CONTENT_REQUEST_LENGTH === content.length,
                    loading: false,
                    nextOpenPostIndex: this.state.nextOpenPostIndex + REGULAR_CONTENT_REQUEST_LENGTH,
                    numOfContent: this.numOfContent + content
                })
            })
            .catch(err => console.log(err))
    }

    getCachedFeed() { //initial
        return AxiosHelper
            .getCachedFeed(this.props.authUser.cached_feed_id)
    }

    getDynamicFeed() {
        console.log("DYNAMIC");
        const distance = distanceSwitch(this.state.distance);
        return AxiosHelper.getSimilarPeopleAdvanced(
            distance,
            this.props.pursuitObjects.names,
            this.state.dynamic.usedPeople,
            this.state.lat,
            this.state.long)
            .then((results) =>
                setSimilarPeopleAdvanced(
                    results,
                    this.state.dynamic.usedPeople
                )
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
                                {/* <EventController
                            key={index}
                            contentType={POST}
                            eventIndex={index}
                            eventData={post}
                            onEventClick={this.handleEventClick}
                        /> */}
                            </div>)
                    case (USER):
                        return (
                            <div key={index} className='returninguser-feed-object'>
                                <p>{item.content._id}</p>
                            </div>
                        )
                    default:
                        throw new Error("Malformed content type")

                }
                // if (content.type === POST) {
                //     const viewerObject = {
                //         key: index,
                //         largeViewMode: true,
                //         textData: content.text_data,
                //         isPostOnlyView: false,
                //         pursuitObjects: this.props.pursuitObjects,
                //         projectPreviewMap: this.state.projectPreviewMap,
                //         eventData: content,
                //     }

                //     return (
                //         <div key={index}>
                //             <PostController
                //                 isViewer
                //                 viewerObject={viewerObject}
                //                 viewerFunctions={viewerFunctions}
                //                 authUser={this.props.authUser}
                //                 closeModal={this.closeModal}
                //             />
                //             {/* <EventController
                //             key={index}
                //             contentType={POST}
                //             eventIndex={index}
                //             eventData={post}
                //             onEventClick={this.handleEventClick}
                //         /> */}
                //         </div>)
                // }
                // else if (content.type === USER) {


                // }
                // else{

                // }
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