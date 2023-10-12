export declare type ValidateExceptionData = Array<string | Record<string, unknown>>;
export interface ValidationDetails {
    errorCode: number;
    errors: {
        [x: string]: ValidateExceptionData;
    }[];
}
export declare class ValidationException extends Error {
    details: ValidationDetails;
    constructor(details: ValidationDetails, message?: string);
    get errorCode(): number;
    get errors(): {
        [x: string]: ValidateExceptionData;
    }[];
}
//# sourceMappingURL=validationException.d.ts.map