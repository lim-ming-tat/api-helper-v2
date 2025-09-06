import { validateOrReject as ValidateOrReject, IsArray, ValidateNested, validateSync as ValidateSync } from 'class-validator';
import { ValidationError } from 'class-validator';

import { ValidateExceptionData, ValidationException } from './validationException.js';

export class ArrayValidator<T> extends Array<T> {
    @IsArray()
    @ValidateNested({ each: true })
    private array: Array<T>;

    constructor(inputArray: Array<T>) {
        super();
        inputArray.forEach((item) => this.push(item));

        this.array = this;
    }

    public async validate() {
        const dtoError = await ArrayValidator.validateData(this);

        // for error message validation in test case
        // console.log(`array validate:::\n${JSON.stringify(dtoError, null, 4)}`);
        if (dtoError.errorCode !== 0) throw new ValidationException(dtoError, 'Data validation errors');

        return true;
    }

    public validateSync() {
        const valError = ValidateSync(this);

        const dtoError = { errorCode: valError.length > 0 ? 500 : 0, errors: ArrayValidator.getErrorMessage(valError) };

        if (dtoError.errorCode !== 0) {
            throw new ValidationException(dtoError, 'Data validation errors');
        }

        return true;
    }

    // groups validation not supported for array
    // private static async validateData<T extends object>(input: T, groups: Array<string>) {
    private static async validateData<T extends object>(input: T) {
        try {
            await ValidateOrReject(input);

            return { errorCode: 0, errors: [] };
        } catch (err) {
            const validationErrors = err as ValidationError[];

            return { errorCode: 500, errors: this.getErrorMessage(validationErrors) };
        }
    }

    private static getErrorMessage(errors: ValidationError[], parentProprtyName = 'data'): { [x: string]: ValidateExceptionData }[] {
        return errors.map(({ property, constraints, children }) => {
            const validateExceptionData: ValidateExceptionData = [];
            if (children != undefined && children.length > 0) {
                this.getErrorMessage(children, property).forEach((item) => validateExceptionData.push(item));
            } else {
                for (const key in constraints) {
                    validateExceptionData.push(constraints[key]);
                }
            }
            return { [`${parentProprtyName}.${property}`]: validateExceptionData };
        });
    }
}
