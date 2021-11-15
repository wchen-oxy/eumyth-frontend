import React, { useState } from 'react';
import AxiosHelper from 'utils/axios';

const DeleteWindow = (props) => {
    const [isDeletePostsChecked, setIsDeletePostsChecked] = useState(false);
    const deleteProject = (projectID, shouldDeletePosts) => {
        return AxiosHelper.deleteProject(
            projectID,
            shouldDeletePosts,
            props.userInfo.indexUserID,
            props.userInfo.completeUserID
        )
            .then((result) => console.log(result))
            .catch((err) => console.log(err));
    }

    return (<div id={'rightmanagebuttons-delete-container'}>
        <p>
            Deleting this project is irreversible. Are you sure you want to continue?
        </p>
        <input
            type="checkbox"
            checked={isDeletePostsChecked}
            onChange={() => setIsDeletePostsChecked(!isDeletePostsChecked)}
        />
        <button onClick={() => deleteProject(props.projectID, isDeletePostsChecked)}>Confirm</button>

        <button onClick={props.toggleDelete}>Cancel</button>
    </div>)
}

export default DeleteWindow;