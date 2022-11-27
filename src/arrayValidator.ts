import { validateOrReject, IsArray, ValidateNested, validateSync as ValidateSync } from 'class-validator';
import { ValidationError } from 'class-validator';
import { DtoBase } from './dtoBase.js';
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

    // public static async validateBackup<T extends object>(array: T) {
    //     const dtoError = await ArrayValidator.validateData(array);

    //     // if (DtoBase.debug)
    //     console.log(`array validate:::${JSON.stringify(dtoError, null, 4)}`);

    //     // throw new Error(JSON.stringify(dtoError, null, 4));
    // }

    public async validate() {
        const dtoError = await ArrayValidator.validateData(this);

        // if (DtoBase.debug)
        // console.log(`array validate:::${JSON.stringify(dtoError, null, 4)}`);
        if (dtoError.errorCode !== 0) throw new ValidationException(dtoError, 'Data validation errors');

        // throw new Error(JSON.stringify(dtoError, null, 4));
        return true;
    }

    public validateSync() {
        const valError = ValidateSync(this);

        const dtoError = { errorCode: valError.length > 0 ? 500 : 0, errors: ArrayValidator.getErrorMessage(valError) };

        if (dtoError.errorCode !== 0) {
            const err = new ValidationException(dtoError, 'Data validation errors');
            // console.log(err.showMessage())

            throw new TypeError(err.getMessage());
        }

        // throw new Error(JSON.stringify(dtoError, null, 4));
    }

    private static async validateData<T extends object>(input: T) {
        try {
            await validateOrReject(input);
            return { errorCode: 0, errors: [] };
        } catch (err) {
            if (DtoBase.debug) console.warn('new [Validations] error');
            if (DtoBase.debug) console.log(JSON.stringify(err, null, 4));
            const validationErrors = err as ValidationError[];

            return { errorCode: 500, errors: this.getErrorMessage(validationErrors) };
        }
    }
    // private static async validateData<T extends object>(input: T) {
    //     try {
    //         await validateOrReject(input);
    //         return { errors: {} };
    //     } catch (err) {
    //         if (DtoBase.debug) console.warn('new [Validations] error');
    //         if (DtoBase.debug) console.log(JSON.stringify(err, null, 4));
    //         const validationErrors = err as ValidationError[];
    //         // const errorsList: Record<string, string> = validationErrors.reduce((prevError, currError) => {
    //         //     const property = currError.property;
    //         //     const message = Object.values(currError.constraints!)[0];
    //         //     return { ...prevError, [property]: message };
    //         // }, {});
    //         // return { errors: errorsList };

    //         return ArrayValidator.getErrorMessage(validationErrors);
    //     }
    // }

    protected static getErrorMessage(errors: ValidationError[], parentProprtyName = 'sourceData'): { [x: string]: ValidateExceptionData }[] {
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
    // protected static getErrorMessage(errors: ValidationError[], parentProprtyName = 'sourceData') {
    //     return errors.map(({ property, constraints, children }) => {
    //         const msg:
    //             | Array<string>
    //             | {
    //                   [key: string]: any;
    //               } = [];
    //         if (children != undefined && children.length > 0) {
    //             this.getErrorMessage(children, property).forEach((item) => msg.push(item));
    //         } else {
    //             for (const key in constraints) {
    //                 msg.push(constraints[key]);
    //             }
    //         }
    //         return { [`${parentProprtyName}.${property}`]: msg };
    //     });
    //     // .join('\n\n');
    // }

    // private static formatError(err: ValidationError[]): Record<string, string> {
    //     const validationErrors = err;
    //     const errorsList: Record<string, string> = validationErrors.reduce((prevError, currError) => {
    //         const property = currError.property;
    //         const message = this.getErrorMessage([currError]);

    //         return { ...prevError, [property]: message };
    //     }, {});

    //     return errorsList;
    // }

    // public validateData() {
    //     // validating and check the errors, throw the errors if exist
    //     const errors = validateSync(this as object);

    //     if (errors.length > 0) {
    //         throw new TypeError(ArrayValidator.formatErrorMessage(errors[0].target, ArrayValidator.getErrorMessage(errors)));
    //     }
    // }

    // protected static formatErrorMessage<T>(data: T, message: string, property?: string) {
    //     let formatedMsg = message;
    //     if (property !== undefined) {
    //         formatedMsg = `.${property}\n  ${message}`;
    //     }

    //     return `Source:\n${JSON.stringify(data, null, 4)}\n\nError Message:\n${formatedMsg}`;
    // }

    // protected static getErrorMessage(errors: ValidationError[], proprtyName = '', tab = '') {
    //     const TAB = '  ';
    //     return errors
    //         .map(({ property, constraints, children }) => {
    //             let msg = '';
    //             if (children != undefined && children.length > 0) {
    //                 msg += `\n${ArrayValidator.getErrorMessage(children, property, `${tab}${TAB}`)}`;
    //             } else {
    //                 for (const key in constraints) {
    //                     msg += `\n${tab}${TAB}${constraints[key]}`;
    //                 }
    //             }
    //             return `${tab}${proprtyName}.${property}:${msg}`;
    //         })
    //         .join('\n\n');
    // }
}
