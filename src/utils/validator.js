export const checkInputNotNull = (data, func) => data ? func(data) : null;
