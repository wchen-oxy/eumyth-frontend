import React from 'react';
import ProjectController from '../project/index';
import { default as PostController } from '../post/profile-controller';
import { POST, PROJECT } from 'utils/constants/flags';

const HeroContentDecider = (props) => {
    if (props.visibility.fail) {
        return (
            <p>The user you're looking for does not exist.</p>)
    }
    else if (props.visibility.shouldHide) {
        return (
            <p>This profile is private. To see
                these posts, please request access. </p>
        );
    }
    else {
        if (props.contentType === POST) {
            return (
                <div key={props.selectedPursuitIndex}>
                    <PostController    {...props} />
                </div>
            )
        }
        else if (props.contentType === PROJECT) {
            return (
                <div key={props.selectedPursuitIndex}>
                    <ProjectController  {...props} />
                </div>
            )
        }
    }
    return new Error("Missing Content Type Field");
}

export default HeroContentDecider;