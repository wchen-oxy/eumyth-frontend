import { MILESTONE, NEUTRAL, SETBACK } from "./flags";

export const FOLLOW_BUTTON_TEXT = "Follow";
export const FOLLOWED_BUTTON_TEXT = "Followed";
export const REQUESTED_BUTTON_TEXT = "Requested";

export const SETBACK_PROGRESSION_TEXT = "Setback";
export const NEUTRAL_PROGRESSION_TEXT = "";
export const MILESTONE_PROGRESSION_TEXT = "Milestone";

export const CHALLENGING_TEXT = "Challenging";
export const DIFFICULT_TEXT = "Difficult";


export const displayDifficulty = (value) => {
    const isnum = /^\d+$/.test(value);
    if (isnum) value = parseInt(value);
    switch (value) {
        case (0):
            return "";
        case (1):
            return CHALLENGING_TEXT;
        case (2):
            return DIFFICULT_TEXT;
        default:
            throw new Error("No Difficulty matched");
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
            throw new Error("No Progress Type Matched");
    }
}

export const returnFormattedDate = (rawDate) => {
    const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
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