export const getType = v => v === undefined ? 'undefined' : v === null ? 'null' : v.constructor.name.toLowerCase();

export const is = (type, val) => ![, null].includes(val) && val.constructor === type;