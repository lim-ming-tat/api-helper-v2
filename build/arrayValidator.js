var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { validateOrReject as ValidateOrReject, IsArray, ValidateNested, validateSync as ValidateSync } from 'class-validator';
import { ValidationException } from './validationException.js';
export class ArrayValidator extends Array {
    constructor(inputArray) {
        super();
        inputArray.forEach((item) => this.push(item));
        this.array = this;
    }
    async validate() {
        const dtoError = await ArrayValidator.validateData(this);
        // for error message validation in test case
        // console.log(`array validate:::\n${JSON.stringify(dtoError, null, 4)}`);
        if (dtoError.errorCode !== 0)
            throw new ValidationException(dtoError, 'Data validation errors');
        return true;
    }
    validateSync() {
        const valError = ValidateSync(this);
        const dtoError = { errorCode: valError.length > 0 ? 500 : 0, errors: ArrayValidator.getErrorMessage(valError) };
        if (dtoError.errorCode !== 0) {
            throw new ValidationException(dtoError, 'Data validation errors');
        }
        return true;
    }
    // groups validation not supported for array
    // private static async validateData<T extends object>(input: T, groups: Array<string>) {
    static async validateData(input) {
        try {
            await ValidateOrReject(input);
            return { errorCode: 0, errors: [] };
        }
        catch (err) {
            const validationErrors = err;
            return { errorCode: 500, errors: this.getErrorMessage(validationErrors) };
        }
    }
    static getErrorMessage(errors, parentProprtyName = 'data') {
        return errors.map(({ property, constraints, children }) => {
            const validateExceptionData = [];
            if (children != undefined && children.length > 0) {
                this.getErrorMessage(children, property).forEach((item) => validateExceptionData.push(item));
            }
            else {
                for (const key in constraints) {
                    validateExceptionData.push(constraints[key]);
                }
            }
            return { [`${parentProprtyName}.${property}`]: validateExceptionData };
        });
    }
}
__decorate([
    IsArray(),
    ValidateNested({ each: true }),
    __metadata("design:type", Array)
], ArrayValidator.prototype, "array", void 0);
//# sourceMappingURL=arrayValidator.js.map