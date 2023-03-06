import { MILESTONE, NEUTRAL, SETBACK } from './flags';

export const ACCEPT_REQUEST_TEXT = 'Accept';
export const DECLINE_REQUEST_TEXT = 'Decline';
export const REMOVE_TEXT = 'Remove';
export const CANCEL_REQUEST_TEXT = 'Cancel Request';

export const FOLLOW_BUTTON_TEXT = 'Follow';
export const FOLLOWED_BUTTON_TEXT = 'Followed';
export const FOLLOWING_BUTTON_TEXT = 'Following';
export const REQUESTED_BUTTON_TEXT = 'Requested';

export const SETBACK_PROGRESSION_TEXT = 'Setback';
export const NEUTRAL_PROGRESSION_TEXT = '';
export const MILESTONE_PROGRESSION_TEXT = 'Milestone';

export const CHALLENGING_TEXT = 'Challenging';
export const DIFFICULT_TEXT = 'Difficult';


export const displayDifficulty = (value) => {
    const isnum = /^\d+$/.test(value);
    if (isnum) value = parseInt(value);
    switch (value) {
        case (0):
            return null;
        case (1):
            return CHALLENGING_TEXT;
        case (2):
            return DIFFICULT_TEXT;
        default:
            throw new Error('No Difficulty matched');
    }
}

export const displayProgressionType = (value) => {
    const isnum = /^\d+$/.test(value);
    if (isnum) value = parseInt(value);
    switch (value) {
        case (0):
            return SETBACK_PROGRESSION_TEXT;
        case (SETBACK):
            return SETBACK_PROGRESSION_TEXT;
        case (1):
            return NEUTRAL_PROGRESSION_TEXT;
        case (NEUTRAL):
            return NEUTRAL_PROGRESSION_TEXT;
        case (2):
            return MILESTONE_PROGRESSION_TEXT;
        case (MILESTONE):
            return MILESTONE_PROGRESSION_TEXT;
        default:
            throw new Error('No Progress Type Matched');
    }
}

export const returnFormattedDate = (rawDate) => {
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const date = new Date(rawDate);
    const month = monthNames[date.getMonth()];
    return (
        {
            month: month,
            day: date.getDate(),
            year: date.getFullYear()
        }

    );
}

export const returnFormattedDistance = (distance) => {
    if (!distance) return null;
    switch (distance) {
        case (distance < 1):
            return "Your Local Neighbor";
        case (distance < 7):
            return "Your City Neighbor";
        case (distance < 39):
            return "Your County Neighbor";
        case (distance < 100):
            return "Your Next City Over Neighbor";
        case (distance < 500):
            return "Your State Neighbor";
        default:
            return "Your Super Far Away Neighbor Who Lives " +
                Math.floor(distance) + ' miles from you';
    }
    return distance < 1 ? "Your Neighbor" : Math.floor(distance) + ' miles from you';
}