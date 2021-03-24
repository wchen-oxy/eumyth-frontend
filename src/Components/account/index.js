import React, { useState, useEffect } from 'react';
import PasswordChangeForm from '../password/change';
import imageCompression from 'browser-image-compression';
import AxiosHelper from "../../Axios/axios";
import { AuthUserContext, withAuthorization } from '../session';
import { withFirebase } from '../../Firebase';
import { PUBLIC, PRIVATE, DISPLAY, COVER } from "../constants/flags";
import "./index.scss";
import ProfilePhotoEditor from '../profile-photo-editor.js';

const AccountPage = (props) => {
  const [indexUserID, setIndexUserID] = useState(null);
  const [displayPhoto, setDisplayPhoto] = useState(null);
  const [hasDisplayPhoto, setHasDisplayPhoto] = useState(true);
  const [coverPhoto, setCoverPhoto] = useState(null);
  const [bio, setBioText] = useState('');
  const [previousTemplates, setPreviousTemplates] = useState(null);
  const [templateText, setTemplateText] = useState('');
  const [templateCategory, setTemplateCategory] = useState(null);
  const [pursuitNames, setPursuitNames] = useState(null);
  const [displayPhotoScale, setDisplayPhotoScale] = useState(1);
  const [displayPhotoRotation, setDisplayPhotoRotation] = useState(0);
  const [AvatarEditorInstance, setAvatarEditorInstance] = useState(null);
  const [isPrivate, setIsPrivate] = useState(null);
  const [imageKey, setImageKey] = useState(0);
  const displayPhotoRef = React.createRef();
  const coverPhotoRef = React.createRef();

  useEffect(() => {
    AxiosHelper
      .returnAccountSettingsInfo(props.firebase.returnUsername())
      .then((result) => {
        const pursuits = result.data.pursuits;
        let pursuitNameArray = [];
        if (pursuits) {
          for (const pursuitName in pursuits) {
            pursuitNameArray.push(pursuitName);
          }
        }
        setHasDisplayPhoto(result.data.cropped_display_photo_key !== null);
        setBioText(result.data.bio);
        setIsPrivate(result.data.private);
        setPursuitNames(pursuitNameArray);
        setPreviousTemplates(pursuits);
        setTemplateText(pursuits[pursuitNameArray[[0]]]);
        setTemplateCategory(pursuitNameArray[[0]]);
        setIndexUserID(result.data._id);
      });
  }, [props.firebase])

  const handleImageDrop = (dropped) => {
    setDisplayPhoto(dropped);
  }

  const showPhotoEditor = (ref) => {
    if (ref.current.style.display === "") { ref.current.style.display = "flex"; }
    else {
      ref.current.style.display = "";
    }
  }

  const removePhoto = (photoType) => {
    const username = props.firebase.returnUsername();
    if (window.confirm("Are you sure you want to remove your photo?")) {
      AxiosHelper
        .deleteAccountPhoto(username, photoType)
        .then(() => {
          let formData = new FormData();
          formData.append("username", username);
          formData.append("imageKey", "");
          return AxiosHelper.updatePostDisplayPhotos(formData)
        })
        .then(() => {
          if (photoType === DISPLAY) {
            window.alert(
              `Your Display Photo has been removed. 
              You should see the changes take effect soon.`
            );
          }
          else if (photoType === COVER) {
            window.alert(
              `Your cover photo has been removed. You should
               see the changes take effect immediately.`
            );
          }
          window.location.reload();
        })
        .catch((err) => {
          console.log(err);
          window.alert(
            `Something went wrong while deleting your image.
             Please wait and try again later`
          );
        });
    }
  }

  const handlePhotoSubmitCallback = (formData, photoType, username) => {
    return AxiosHelper.updateAccountImage(formData, photoType)
      .then((results) => {
        const form = {
          username: username,
          imageKey: results.data.imageKey
        };
        return AxiosHelper.updatePostDisplayPhotos(form)
      })
      .then((results) => {
        console.log(results);
        alert("Successfully updated!");
        window.location.reload();
      })
      .catch((err) => {
        console.log(err);
        alert("Something has gone wrong while updating :(")
      })
  }

  const handlePhotoSubmit = (formData, photoType) => {
    const username = props.firebase.returnUsername();
    if (hasDisplayPhoto) {
      return (
        AxiosHelper
          .deleteAccountPhoto(username, photoType)
          .then((result) => {
            console.log(result);
            return handlePhotoSubmitCallback(formData, photoType, username);
          }));
    }

    else {
      return handlePhotoSubmitCallback(formData, photoType, username);
    }
  }

  const handleBioSubmit = () => {
    return (
      AxiosHelper.updateBio({
        bio: bio,
        username: props.firebase.returnUsername()
      })
        .then(() => {
          alert("Successfully updated your bio!");
          window.location.reload();
        })
        .catch((err) => console.log(err))
    );
  }


  const handleTemplateTextSubmit = () => {
    return (
      AxiosHelper.updateTemplate({
        indexUserID: indexUserID,
        text: templateText,
        pursuit: templateCategory
      })
    )
  }


  const handleProfilePrivacyChange = (privacySetting) => {
    const isPrivate = privacySetting === PRIVATE ? true : false;
    setIsPrivate(isPrivate);
    return AxiosHelper
      .setProfilePrivacy(
        props.firebase.returnUsername(),
        isPrivate
      ).catch((err) => {
        console.log(err);
        alert("Unable to update Profile Privacy.");
      })
  }

  const submitPhoto = (photoType) => {
    let formData = new FormData();
    formData.append('username', props.firebase.returnUsername());
    if (photoType === DISPLAY) {
      const titles = ["normal", "small", "tiny"];
      const canvas = AvatarEditorInstance.getImage();
      const image = imageCompression.canvasToFile(canvas);
      image.then((result) =>
        Promise.all([
          imageCompression(
            result,
            {
              maxWidthOrHeight: 250,
              maxSizeMB: 1,
              fileType: "image/jpeg"
            }),
          imageCompression(
            result,
            {
              maxWidthOrHeight: 125,
              maxSizeMB: 1,
              fileType: "image/jpeg"
            }),
          imageCompression(
            result,
            {
              maxWidthOrHeight: 62,
              maxSizeMB: 1,
              fileType: "image/jpeg"
            })
        ]))
        .then((results) => {
          let imageArray = [];
          for (let i = 0; i < 3; i++) {
            imageArray.push(
              new File([results[i]], titles[i], { type: "image/jpeg" })
            );
          }
          formData.append("croppedImage", results[0]);
          formData.append("smallCroppedImage", results[1]);
          formData.append("tinyCroppedImage", results[2]);
          return handlePhotoSubmit(formData, photoType);
        }
        )
    }
    else if (photoType === COVER) {
      if (coverPhoto.size > 1000000) {
        return (
          imageCompression(coverPhoto, { maxSizeMB: 1, fileType: "image/jpeg" })
            .then(formattedImage => {
              formData.append('coverPhoto', formattedImage);
              handlePhotoSubmit(formData, photoType);
            })
        );
      }
      else {
        formData.append('coverPhoto', coverPhoto);
        return handlePhotoSubmit(formData, photoType);
      }
    }
  }

  const renderPursuitOptions = () => {
    let pursuits = [];
    if (pursuitNames !== null) {
      for (const pursuit of pursuitNames) {
        pursuits.push(
          <option key={pursuit} value={pursuit}>
            {pursuit}
          </option >
        )
      }
      return pursuits;
    }

  }

  const handleTemplateTextSet = (templateCategory) => {
    console.log(previousTemplates[templateCategory]);
    setTemplateText(previousTemplates[templateCategory]);
    setTemplateCategory(templateCategory);
  }

  const clearFile = () => {
    setImageKey(imageKey + 1);
    setDisplayPhoto(null);
  }
  return (
    <AuthUserContext.Consumer>
      {
        authUser => {
          return (
            <div id="account-container">
              <h1>Account: {authUser.email}</h1>
              <PasswordChangeForm />
              <div className="account-section-container">
                <label>
                  Choose the privacy of your profile!
              </label>
                <select
                  value={isPrivate ? PRIVATE : PUBLIC}
                  onChange={(e) => handleProfilePrivacyChange(e.target.value)}>
                  <option key="private" value={PRIVATE}>Private</option>
                  <option key="public" value={PUBLIC}>Public</option>
                </select>
              </div>
              <div className="account-section-container">
                <button onClick={() => showPhotoEditor(displayPhotoRef)}>
                  Edit your Display Photo
              </button>
                <div
                  ref={displayPhotoRef}
                  className="account-photo-edit-container"
                >
                  <label>Change your display photo!</label>
                  <input
                    name="displayPhoto"
                    type="file"
                    key={imageKey}
                    onChange={(e) => setDisplayPhoto(e.target.files[0])}
                  />
                  {displayPhoto ?

                    <ProfilePhotoEditor
                      clearFile={clearFile}
                      profilePhoto={displayPhoto}
                      handleImageDrop={handleImageDrop}
                      imageScale={displayPhotoScale}
                      imageRotation={displayPhotoRotation}
                      scaleImage={setDisplayPhotoScale}
                      rotateImage={setDisplayPhotoRotation}
                      setEditorRef={setAvatarEditorInstance}
                    />
                    // renderProfilePhotoEditor()
                    : <div></div>}
                  <button
                    disabled={!displayPhoto}
                    onClick={() => submitPhoto(DISPLAY)}>
                    Submit your display photo!
                </button>
                  <button onClick={() => removePhoto(DISPLAY)}>
                    Remove display Photo?
                </button>
                </div>
              </div>
              <div className="account-section-container">

                <button onClick={() => showPhotoEditor(coverPhotoRef)}>
                  Edit your Cover Photo
              </button>
                <div ref={coverPhotoRef} className="account-photo-edit-container">
                  <label>Change your cover photo!</label>
                  <input type="file" onChange={(e) => {
                    setCoverPhoto(e.target.files[0]);
                  }} />
                  <button
                    disabled={!coverPhoto}
                    onClick={() => submitPhoto(COVER)}>
                    Submit your cover photo!
                </button>
                  <button onClick={() => removePhoto(COVER)}>
                    Remove your cover photo
                </button>
                </div>
              </div>

              <div id="account-bio-container" className="account-section-container">
                <label>Edit your bio</label>
                <textarea
                  type="text"
                  onChange={e => setBioText(e.target.value)}
                  value={bio}
                  maxLength={500}
                />
                <button onClick={handleBioSubmit}>
                  Submit Bio
              </button>
              </div>
              <div
                id="account-template-container"
                className="account-section-container">
                <label>Add Template for Pursuit</label>
                <p>Add a predefined text you can add to a post for ease of access</p>
                <select
                  name="pursuit-category"
                  value={templateCategory}
                  onChange={(e) => handleTemplateTextSet(e.target.value)}>
                  {renderPursuitOptions()}
                </select>
                <textarea
                  type="text"
                  onChange={e => setTemplateText(e.target.value)}
                  value={templateText}
                />
                <button onClick={handleTemplateTextSubmit}>
                  Submit Template
              </button>
              </div>
            </div>
          );
        }
      }
    </AuthUserContext.Consumer>
  );
}

const condition = authUser => !!authUser;
export default withAuthorization(condition)(withFirebase(AccountPage));