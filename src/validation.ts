export const validPeerId = (name: string) => /^[A-Za-z0-9]+(?:[ _-][A-Za-z0-9]+)*$/.test(name);
export const required = (value: string) => !!value;

export const evalue =<T>(value: T, ...validations: ((value: T) => boolean)[]) => validations.reduce((acc, next) =>  acc && next(value) , true);
