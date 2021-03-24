import React from 'react';
import imageCompression from 'browser-image-compression';
import CustomMultiSelect from "../../custom-clickables/createable-single";
import AxiosHelper from '../../../Axios/axios';
import _ from 'lodash';
import { withFirebase } from '../../../Firebase';
import './initial-customization.scss';
import ProfilePhotoEditor from '../../profile-photo-editor.js';

const INITIAL_STATE = {
    firstName: '',
    lastName: '',
    username: '',
    pursuits: [],
    experienceSelects: [],
    isTaken: false,
    isUpperCase: false,
    croppedImage: null,
    fullImage: null,
    imageScale: 1,
    imageRotation: 0,
}

class InitialCustomizationPage extends React.Component {
    constructor(props) {
        super(props);
        this.editor = React.createRef(null);
        this.handleTextChange = this.handleTextChange.bind(this);
        this.handleUsernameChange = _.debounce((username) => this.checkUsernameAvailable(username), 1000);
        this.handleExperienceSelect = this.handleExperienceSelect.bind(this);
        this.handleProfileSubmit = this.handleProfileSubmit.bind(this);
        this.handlePursuitExperienceChange = this.handlePursuitExperienceChange.bind(this);
        this.handleProfilePhotoChange = this.handleProfilePhotoChange.bind(this);
        this.handleImageDrop = this.handleImageDrop.bind(this);
        this.testForSpecialCharacter = this.testForSpecialCharacter.bind(this);
        this.checkUsernameAvailable = this.checkUsernameAvailable.bind(this);
        this.clearFile = this.clearFile.bind(this);
        this.setEditorRef = this.setEditorRef.bind(this);
        this.rotateImage = this.rotateImage.bind(this);
        this.scaleImage = this.scaleImage.bind(this);
        this.state = {
            ...INITIAL_STATE
        }
    }

    clearFile() {
        this.setState((state) => ({
            imageKey: state.imageKey + 1,
            profilePhoto: null
        }))
    }

    rotateImage(value) {
        this.setState({
            imageRotation: parseFloat(value)
        })
    }

    scaleImage(value) {
        this.setState({
            imageScale: parseFloat(value)
        })

    }

    checkUsernameAvailable(username) {
        return AxiosHelper.checkUsernameAvailable(username)
            .then(
                (response) => {
                    let isTaken = null;
                    if (response.status === 200) {
                        isTaken = true;
                    }
                    else if (response.state === 204) {
                        isTaken = false;
                    }
                    this.setState({
                        isTaken: isTaken
                    });
                }
            )
            .catch((err) => {
                console.log(err);
            })
    }

    handleTextChange(e) {
        e.preventDefault();
        this.setState({ [e.target.name]: e.target.value });
        if (e.target.name === "username") {
            const username = e.target.value;
            if (username === username.toLowerCase()) {
                this.handleUsernameChange(username);
                this.setState({ isUpperCase: false });
            }
            else {
                this.setState({ isUpperCase: true });
            }
        }
    }

    handleExperienceSelect(newValue) {
        let pursuitArray = [];
        let experienceSelects = [];
        if (newValue) {
            for (const pursuit of newValue) {
                pursuitArray.push({ name: pursuit.value, experience: "Beginner" });
                experienceSelects.push(
                    <span key={pursuit.value}>
                        <label>{pursuit.value}</label>
                        <select
                            className="initialcustomization-select"
                            name={pursuit.value}
                            onChange={this.handlePursuitExperienceChange}
                        >
                            <option value="Beginner">Beginner</option>
                            <option value="Familiar">Familiar</option>
                            <option value="Experienced">Experienced</option>
                            <option value="Expert">Expert</option>
                        </select>
                    </span>
                );
            }
        }
        this.setState({ pursuits: pursuitArray, experienceSelects: experienceSelects });
    }

    handleProfileSubmit(e) {
        e.preventDefault();
        if (this.editor) {
            const canvasScaled = this.editor.getImage();
            Promise.all(
                [this.props.firebase.writeBasicUserData(
                    this.state.username,
                    this.state.firstName,
                    this.state.lastName
                ),
                this.props.firebase.doUsernameUpdate(this.state.username),
                imageCompression.canvasToFile(canvasScaled),
                ]
            )
                .then(
                    (results) => {
                        return Promise.all([
                            imageCompression(
                                results[2],
                                {
                                    maxWidthOrHeight: 250,
                                    maxSizeMB: 1,
                                    fileType: "image/jpeg"
                                }),
                            imageCompression(
                                results[2],
                                {
                                    maxWidthOrHeight: 125,
                                    maxSizeMB: 1,
                                    fileType: "image/jpeg"
                                }),
                            imageCompression(
                                results[2],
                                {
                                    maxWidthOrHeight: 62,
                                    maxSizeMB: 1,
                                    fileType: "image/jpeg"
                                }),
                        ]);
                    }
                )
                .then(
                    (results) => {
                        const titles = ["normal", "small", "tiny"];
                        let imageArray = [];
                        for (let i = 0; i < 3; i++) {
                            imageArray.push(
                                new File(
                                    [results[i]],
                                    titles[i],
                                    { type: "image/jpeg" })
                            );
                        }
                        return imageArray;
                    }
                )
                .then(
                    (results) => {
                        let formData = new FormData();
                        formData.append("username", this.state.username);
                        formData.append("pursuits", JSON.stringify(this.state.pursuits));
                        formData.append("croppedImage", results[0]);
                        formData.append("smallCroppedImage", results[1]);
                        formData.append("tinyCroppedImage", results[2]);

                        return AxiosHelper.createUserProfile(formData)
                    }
                )
                .then(
                    (result) => {
                        if (result.status === 201) window.location.reload();
                    }
                )
                .catch((error) => console.log(error));
        }
        else {
            Promise.all(
                [this.props.firebase.writeBasicUserData(
                    this.state.username,
                    this.state.firstName,
                    this.state.lastName
                ),
                this.props.firebase.doUsernameUpdate(this.state.username),
                ]
            )
                .then(
                    (results) => {
                        let formData = new FormData();
                        formData.append("username", this.state.username);
                        formData.append("firstName", this.state.firstName);
                        formData.append("lastName", this.state.lastName);
                        formData.append("pursuits", JSON.stringify(this.state.pursuits));
                        return AxiosHelper.createUserProfile(formData);
                    }
                )
                .then(
                    (result) => {
                        if (result.status === 201) window.location.reload();
                        else { alert("Something unexpected happen: (", result.status) }
                    }
                )
                .catch((error) => console.log(error));
        }

    }

    handlePursuitExperienceChange(e) {
        let previousPursuitState = this.state.pursuits;
        for (const pursuit of previousPursuitState) {
            if (pursuit.name === e.target.name) pursuit.experience = e.target.value;
        }
        this.setState({ pursuits: previousPursuitState });
    }

    testForSpecialCharacter(string) {
        return /[~`!#$%\^&*+=\-\[\]\\';,/{}|\\":<>\?]/g.test(string) || /\s/.test(string);
    }

    handleProfilePhotoChange(photo) {
        this.setState({ profilePhoto: photo });
    }

    handleImageDrop(dropped) {
        this.setState({ profilePhoto: dropped[0] })
    }

    setEditorRef(editor) {
        this.editor = editor
    };

    render() {
        const available =
            this.state.username !== ''
                && !this.state.isTaken ?
                "Available" :
                "Taken";
        const upperCase =
            this.state.isUpperCase ?
                ", But Please Choose Only Lower Case Characters" :
                "";
        const specialCharacters = this.testForSpecialCharacter(this.state.username);
        const specialCharMessage =
            specialCharacters ?
                ", But No Special Characters Please" :
                "";
        const { username, firstName, lastName, pursuits } = this.state;
        let isInvalid =
            username === '' ||
            firstName === '' ||
            lastName === '' ||
            pursuits === null ||
            pursuits.length === 0 ||
            this.state.isTaken ||
            this.state.isUpperCase ||
            specialCharacters;

        const pursuitDetails =
            this.state.pursuits.length !== 0 ? (
                this.state.experienceSelects) :
                (<></>);

        return (
            <div className="initialcustomization-container">
                <form onSubmit={this.handleProfileSubmit}>
                    <h2>Let us know about you!</h2>
                    <label>
                        Don't worry this information won't be public if you don't want it to.
                    </label>
                    <div className="initialcustomization-content-container">
                        <label>Choose a display profile!</label>
                        <input
                            key={this.state.imageKey}
                            type="file"
                            name="displayPhoto"
                            onChange={(e) => (
                                this.handleProfilePhotoChange(e.target.files[0])
                            )}
                        />
                        {this.state.profilePhoto ?
                            <ProfilePhotoEditor
                                clearFile={this.clearFile}
                                profilePhoto={this.state.profilePhoto}
                                handleImageDrop={this.handleImageDrop}
                                imageScale={this.state.imageScale}
                                imageRotation={this.state.imageRotation}
                                rotateImage={this.rotateImage}
                                scaleImage={this.scaleImage}
                                setEditorRef={this.setEditorRef}
                            />
                            : (
                                <div id="initialcustomization-display-photo-container">
                                </div>
                            )}
                    </div>
                    <div className="initialcustomization-content-container">
                        <label>
                            <p>Choose a username!</p>
                            {this.state.username === '' ? "Invalid" : available}
                            <p>{upperCase}</p>
                            <p>{specialCharMessage}</p>
                        </label>
                        <input
                            type="text"
                            name="username"
                            placeholder="Username"
                            onChange={this.handleTextChange}
                        />
                        <label>First Name</label>
                        <input
                            type="text"
                            name="firstName"
                            placeholder="First Name"
                            onChange={this.handleTextChange}
                        />
                        <label>Last Name</label>
                        <input
                            type="text"
                            name="lastName"
                            placeholder="Last Name"
                            onChange={this.handleTextChange}
                        />
                    </div>
                    <div className="initialcustomization-content-container">
                        <label>
                            Tell us what you want to
                            pursue or choose one from the list!
                        </label>
                        <CustomMultiSelect
                            name="pursuits"
                            onSelect={this.handleExperienceSelect}
                        />
                        {pursuitDetails}
                        <button
                            disabled={isInvalid}
                            type="submit"
                        >
                            Submit
                             </button>
                    </div>
                </form>

            </div>
        );
    }
}
export default withFirebase(InitialCustomizationPage);