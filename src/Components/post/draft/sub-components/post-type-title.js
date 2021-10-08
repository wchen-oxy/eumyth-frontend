import React from 'react';
import { SHORT } from 'utils/constants/flags';

const PostTypeTitle = (props) =>
(
    props.postType === SHORT ?
        (
            <div>
                <h2>Add your metadata!</h2>
                <p>Optional of course</p>
            </div>
        )
        :
        (
            <div>
                <h2>Add your metadata!</h2>
                <p>Optional of course</p>
            </div>
        )
)

export default PostTypeTitle;