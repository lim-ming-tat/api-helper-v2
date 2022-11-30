export type ValidateExceptionData = Array<string | Record<string, unknown>>;

export interface ValidationDetails {
    errorCode: number;
    errors: {
        [x: string]: ValidateExceptionData;
    }[];
}

export class ValidationException extends Error {
    public details: ValidationDetails;

    constructor(details: ValidationDetails, message?: string) {
        super(message); // 'Error' breaks prototype chain here
        Object.setPrototypeOf(this, new.target.prototype); // restore prototype chain

        this.details = details;
    }

    get errorCode() {
        return this.details.errorCode;
    }

    get errors() {
        return this.details.errors;
    }

    // public getMessage() {
    //     return 'ValidationException:::\n' + JSON.stringify(this.details, null, 4);
    // }

    // public showMessage() {
    //     // console.log('ValidationException:::');
    //     // console.log(JSON.stringify(this.details, null, 4));
    //     console.log(`---ValidationException---\n${JSON.stringify(this.details, null, 4)}\n---ValidationException---`);
    // }
}
