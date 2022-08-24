import React, { useState, useEffect } from 'react';
import imageCompression from 'browser-image-compression';
import PasswordChange from './password/change';
import ProfilePhotoEditor from '../profile-photo-editor.js/index.js';
import AxiosHelper from 'utils/axios';
import { AuthUserContext, withAuthorization } from 'store/session';
import { withFirebase } from 'store/firebase';
import { PUBLIC, PRIVATE, DISPLAY, COVER } from 'utils/constants/flags';
import {
  USERNAME_FIELD,
  CROPPED_IMAGE_FIELD,
  SMALL_CROPPED_IMAGE_FIELD,
  TINY_CROPPED_IMAGE_FIELD,
  COVER_PHOTO_FIELD
} from 'utils/constants/form-data';
import PhotoContainer from './photo-container';

const AccountPage = (props) =>
(<AuthUserContext.Consumer>
  {
    authUser =>
      <AuthenticatedAccountPage
        {...props}
        authUser={authUser}
      />

  }
</AuthUserContext.Consumer>);

const AuthenticatedAccountPage = (props) => {
  const [isEditingDisplay, setIsEditingDisplay] = useState(false);
  const [isEditingCover, setIsEditingCover] = useState(false);
  const [displayPhoto, setDisplayPhoto] = useState(null);
  const [hasDisplayPhoto, setHasDisplayPhoto] = useState(true);
  const [coverPhoto, setCoverPhoto] = useState(null);
  const [bio, setBioText] = useState('');
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
      });
  }, [props.firebase])

  const handleImageDrop = (dropped) => {
    setDisplayPhoto(dropped);
  }

  const showPhotoEditor = (ref) => {
    if (ref.current.style.display === '') { ref.current.style.display = 'flex'; }
    else {
      ref.current.style.display = '';
    }
  }

  const removePhoto = (photoType) => {
    const username = props.firebase.returnUsername();
    if (window.confirm('Are you sure you want to remove your photo?')) {
      AxiosHelper
        .deleteAccountPhoto(username, photoType)
        .then(() => {
          return AxiosHelper.updatePostDisplayPhotos(username, '')
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
        if (photoType !== COVER) return AxiosHelper.updatePostDisplayPhotos(username, results.data.imageKey);
        else return;
      })
      .then((results) => {
        alert('Successfully updated!');
        window.location.reload();
      })
      .catch((err) => {
        console.log(err);
        alert('Something has gone wrong while updating :(')
      })
  }

  const handlePhotoSubmit = (formData, photoType) => {
    const username = props.firebase.returnUsername();
    if (hasDisplayPhoto) {
      return (
        AxiosHelper
          .deleteAccountPhoto(username, photoType)
          .then((result) => {
            return handlePhotoSubmitCallback(formData, photoType, username);
          }));
    }

    else {
      return handlePhotoSubmitCallback(formData, photoType, username);
    }
  }

  const handleBioSubmit = () => {
    return (
      AxiosHelper.updateBio(
        props.authUser.userPreviewID,
        props.authUser.indexProfileID,
        props.authUser.profileID,
        bio)
        .then(() => {
          alert('Successfully updated your bio!');
          window.location.reload();
        })
        .catch((err) => console.log(err))
    );
  }

  const handleProfilePrivacyChange = (privacySetting) => {
    const isPrivate = privacySetting === PRIVATE ? true : false;
    setIsPrivate(isPrivate);
    return AxiosHelper
      .setProfilePrivacy(
        props.firebase.returnUsername(),
        isPrivate
      )
      .then((res) => alert('Success!'))
      .catch((err) => {
        console.log(err);
        alert('Unable to update Profile Privacy.');
      })
  }

  const submitPhoto = (photoType) => {
    let formData = new FormData();
    formData.append(USERNAME_FIELD, props.firebase.returnUsername());
    if (photoType === DISPLAY) {
      const titles = ['normal', 'small', 'tiny'];
      const canvas = AvatarEditorInstance.getImage();
      const image = imageCompression.canvasToFile(canvas);
      image.then((result) =>
        Promise.all([
          imageCompression(
            result,
            {
              maxWidthOrHeight: 250,
              maxSizeMB: 1,
              fileType: 'image/jpeg'
            }),
          imageCompression(
            result,
            {
              maxWidthOrHeight: 125,
              maxSizeMB: 1,
              fileType: 'image/jpeg'
            }),
          imageCompression(
            result,
            {
              maxWidthOrHeight: 62,
              maxSizeMB: 1,
              fileType: 'image/jpeg'
            })
        ]))
        .then((results) => {
          let imageArray = [];
          for (let i = 0; i < 3; i++) {
            imageArray.push(
              new File([results[i]], titles[i], { type: 'image/jpeg' })
            );
          }
          formData.append(CROPPED_IMAGE_FIELD, results[0]);
          formData.append(SMALL_CROPPED_IMAGE_FIELD, results[1]);
          formData.append(TINY_CROPPED_IMAGE_FIELD, results[2]);
          return handlePhotoSubmit(formData, photoType);
        }
        )
    }
    else if (photoType === COVER) {
      if (coverPhoto.size > 1000000) {
        return (
          imageCompression(coverPhoto, { maxSizeMB: 1, fileType: 'image/jpeg' })
            .then(formattedImage => {
              formData.append(COVER_PHOTO_FIELD, formattedImage);
              handlePhotoSubmit(formData, photoType);
            })
        );
      }
      else {
        formData.append(COVER_PHOTO_FIELD, coverPhoto);
        return handlePhotoSubmit(formData, photoType);
      }
    }
  }

  const clearFile = () => {
    setImageKey(imageKey + 1);
    setDisplayPhoto(null);
  }

  const profilePhotoEditor =
    <ProfilePhotoEditor
      clearFile={clearFile}
      profilePhoto={displayPhoto}
      handleImageDrop={handleImageDrop}
      imageScale={displayPhotoScale}
      imageRotation={displayPhotoRotation}
      scaleImage={setDisplayPhotoScale}
      rotateImage={setDisplayPhotoRotation}
      setEditorRef={setAvatarEditorInstance}
    />;

  return (
    <div id='account'>
      <h1>Account: {props.authUser.email}</h1>
      <div className='account-section'>
        <PhotoContainer
          type={DISPLAY}
          isEditing={isEditingDisplay}
          setIsEditingPhoto={setIsEditingDisplay}
          setPhoto={setDisplayPhoto}
          showPhotoEditor={showPhotoEditor}
          photoExists={displayPhoto}
          photoRef={displayPhotoRef}
          profilePhotoEditor={profilePhotoEditor}
          submitPhoto={submitPhoto}
          removePhoto={removePhoto}
        />
      </div>
      <div className='account-section'>
        <PhotoContainer
          type={COVER}
          isEditing={isEditingCover}
          setIsEditingPhoto={setIsEditingCover}
          setPhoto={setCoverPhoto}
          showPhotoEditor={showPhotoEditor}
          photoExists={coverPhoto}
          photoRef={coverPhotoRef}
          profilePhotoEditor={profilePhotoEditor}
          submitPhoto={submitPhoto}
          removePhoto={removePhoto}
        />
      </div>
      <div className='account-section'>
        <label className="label-form">Bio</label>
        <textarea
          type='text'
          onChange={e => setBioText(e.target.value)}
          value={bio}
          maxLength={500}
        />
        <button
          className='btn-reg'
          onClick={handleBioSubmit}>
          Submit Bio
        </button>
      </div>

      <div className='account-section'>
        <label className="label-form">
          Choose the privacy of your profile!
        </label>
        <select
          value={isPrivate ? PRIVATE : PUBLIC}
          onChange={(e) => handleProfilePrivacyChange(e.target.value)}>
          <option key='private' value={PRIVATE}>Private</option>
          <option key='public' value={PUBLIC}>Public</option>
        </select>
      </div>
      <div className='account-section'>
        <PasswordChange />
      </div>
    </div>
  );
}

const condition = authUser => !!authUser;
export default withAuthorization(condition)(withFirebase(AccountPage));