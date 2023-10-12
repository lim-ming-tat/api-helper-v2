export class ValidationException extends Error {
    constructor(details, message) {
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
}
//# sourceMappingURL=validationException.js.map