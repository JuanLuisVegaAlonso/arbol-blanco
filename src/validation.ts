export const validPeerId = (name: string) => /^[A-Za-z0-9]+(?:[ _-][A-Za-z0-9]+)*$/.test(name);
export const required = (value: string) => !!value;

export const evalue = (value: any, ...validations: ((value: any) => boolean)[]) => validations.reduce((acc, next) =>  acc && next(value) , true);
