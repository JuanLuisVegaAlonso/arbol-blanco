export const validPeerId = (name: string) => /^[A-Za-z0-9]+(?:[ _-][A-Za-z0-9]+)*$/.test(name);
export const required = (value: string) => !!value;

/**
 * Order of the validations is important if one fails the rest wont be evaluated. So if you want multiple error messages use another function
 * @param value to be validated
 * @param validations validations that must be passed
 * @returns if its valid or not
 */
export const evalue =<T>(value: T, ...validations: ((value: T) => boolean)[]): boolean =>{
    let valid = true;
    for(let validation of validations) {
        valid = validation(value);
        if (!valid) {
            break;
        }
    }
    return valid;
};
