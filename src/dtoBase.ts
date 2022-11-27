// https://devdojo.com/discoverlance/snippet/form-validation-with-class-validator-1

import { plainToInstance } from 'class-transformer';
import fs from 'fs';

import { validateOrReject, IsArray, ValidateNested, validateSync as ValidateSync } from 'class-validator';
import { ValidationError } from 'class-validator';

// import { get } from 'stack-trace';

import path from 'path';
import { fileURLToPath } from 'url';
import { ArrayValidator } from './arrayValidator.js';
import { ValidationException, ValidateExceptionData } from './validationException.js';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export declare type ClassName<T> = { new (...args: unknown[]): T };

// ref: https://bkerr.dev/blog/declarative-validation-for-express-apis-with-class-validator-and-class-transformer/

export class DtoBase {
    public static debug = false;

    // protected static async plain2Instance<T>(cls: ClassName<T>, dto: object, validate: boolean): Promise<T> {
    //     // console.log(`plain2Instance:::dto:::\n${JSON.stringify(dto, null, 4)}`)
    //     const dtoObject = plainToInstance(cls, dto, { excludeExtraneousValues: true }) as unknown as T;
    //     // console.log(`plain2Instance:::\n${JSON.stringify(dtoObject, null, 4)}`)

    //     if (validate) {
    //         const dtoError = await this.validateData(dtoObject as object, []);
    //         if (dtoError.errorCode !== 0) throw new ValidationException(dtoError, 'Data validation errors');

    //         // console.log(`object validate:::${JSON.stringify(dtoError, null, 4)}`);

    //         // if (DtoBase.debug) console.log(JSON.stringify(dtoError, null, 4));
    //         // if (DtoBase.debug) console.log(`plain2Instance:::dtoError:::\n${JSON.stringify(dtoError, null, 4)}`)
    //     }

    //     return dtoObject;
    // }

    // protected static async plain2Instances<T>(cls: ClassName<T>, dto: object, validate: boolean): Promise<ArrayValidator<T>> {
    //     const dtoObject = plainToInstance(cls, dto, { excludeExtraneousValues: true }) as unknown as ArrayValidator<T>;

    //     // convert arry of dto to ArrayValidator with generic type
    //     const dtoArray = new ArrayValidator(dtoObject);

    //     if (validate) {
    //         if (this.debug) console.log('dtoArray:::' + JSON.stringify(dtoArray, null, 4));

    //         const dtoError = await this.validateData(dtoArray as object, []);
    //         if (dtoError.errorCode !== 0) throw new ValidationException(dtoError, 'Data validation errors');
    //         // const dtoError = await this.validateData(dtoObject as object);
    //         // console.log(`array object validate:::${JSON.stringify(dtoError, null, 4)}`);

    //         if (this.debug) console.log(JSON.stringify(dtoError, null, 4));

    //         // throw new Error(JSON.stringify(dtoError, null, 4));
    //     }

    //     return dtoArray;
    // }

    // public static async validateDataBackup<T extends object>(input: T) {
    //     try {
    //         await validateOrReject(input);
    //         return { errors: {} };
    //     } catch (err) {
    //         if (DtoBase.debug) console.warn('dtoBase - [Validations] error');
    //         if (DtoBase.debug) console.log(JSON.stringify(err, null, 4));
    //         const validationErrors = err as ValidationError[];
    //         const errorsList: Record<string, string> = validationErrors.reduce((prevError, currError) => {
    //             const property = currError.property;
    //             const message = currError.constraints ? Object.values(currError.constraints)[0] : '';
    //             return { ...prevError, [property]: message };
    //         }, {});
    //         return { errors: errorsList };
    //     }
    // }

    private static async validateData<T extends object>(input: T, groups: Array<string>) {
        try {
            if (groups.length > 0) {
                await validateOrReject(input, { groups: groups });
            } else {
                await validateOrReject(input);
            }
            return { errorCode: 0, errors: [] };
        } catch (err) {
            if (DtoBase.debug) console.warn('new [Validations] error');
            if (DtoBase.debug) console.log(JSON.stringify(err, null, 4));
            const validationErrors = err as ValidationError[];

            return { errorCode: 500, errors: this.getErrorMessage(validationErrors) };
        }
    }

    // protected static getErrorMessageBackup(errors: ValidationError[], parentProprtyName = 'sourceData') {
    //     return errors.map(({ property, constraints, children }) => {
    //         let msg:
    //             | Array<string>
    //             | Record<string, any>
    //               = [];
    //         if (children != undefined && children.length > 0) {
    //             this.getErrorMessage(children, property).forEach((item) => msg.push(item));
    //         } else {
    //             for (const key in constraints) {
    //                 msg.push(constraints[key]);
    //             }
    //         }
    //         return { [`${parentProprtyName}.${property}`]: msg };
    //     });
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

    // protected static getErrorMessageBackup(errors: ValidationError[], proprtyName = '', tab = '') {
    //     const TAB = '  ';
    //     return errors
    //         .map(({ property, constraints, children }) => {
    //             let msg = '';
    //             if (children != undefined && children.length > 0) {
    //                 msg += `\n${this.getErrorMessage(children, property, `${tab}${TAB}`)}`;
    //             } else {
    //                 for (const key in constraints) {
    //                     msg += `\n${tab}${TAB}${constraints[key]}`;
    //                 }
    //             }
    //             return `${tab}${proprtyName}.${property}:${msg}`;
    //         })
    //         .join('\n\n');
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

    public async validate(groups: Array<string> = []) {
        // const stackTrace = await import('stack-trace');
        // const trace = stackTrace.get();
        // console.log(`validateSync Start...${JSON.stringify(trace, null, 4)}`);
        // console.log(trace[0].getTypeName(), trace[0].getFunctionName());
        // console.log(trace[0].getFileName(), trace[0].getLineNumber(), trace[0].getColumnNumber());

        // // console.log(trace[1].getFunctionName());
        // // console.log(trace[1].getTypeName());
        // console.log(trace[1].getFileName(), trace[1].getLineNumber(), trace[1].getColumnNumber());
        // // console.log(trace[1].getMethodName());
        // console.log('validateSync End...');

        const dtoError = await DtoBase.validateData(this, groups);

        // if (DtoBase.debug)
        // console.log(`validate:::${JSON.stringify(dtoError, null, 4)}`);
        if (dtoError.errorCode !== 0) throw new ValidationException(dtoError, 'Data validation errors');

        // throw new Error(JSON.stringify(dtoError, null, 4));
    }

    public validateSync(groups: Array<string> = [], parentProprtyName = 'data') {
        // public validateSync() {
        // const groups: Array<string> = [];
        // console.log(`validateSync Start...${(new Error()).stack}`)
        // console.log(`validateSync Start...${JSON.stringify(get(), null, 4)}`)
        const valError = groups.length > 0 ? ValidateSync(this, { groups: groups }) : ValidateSync(this);

        const dtoError = { errorCode: valError.length > 0 ? 500 : 0, errors: DtoBase.getErrorMessage(valError, parentProprtyName) };

        if (dtoError.errorCode !== 0) {
            throw new ValidationException(dtoError, 'Data validation errors');
            // console.log(err.showMessage())

            // throw new TypeError(err.getMessage());
        }

        // throw new Error(JSON.stringify(dtoError, null, 4));
        return true;
    }

    private static getFullPath(folderPath: string): string {
        // always assume root path as {projectRoot}
        // convert relative path to absolute path (at process level)

        // return folderPath.startsWith('/') ? folderPath : `${process.cwd()}/${folderPath}`;
        return folderPath.startsWith('/') ? folderPath : `${this.getModuleFullPath(__dirname, process.cwd())}/${folderPath.replace('./', '')}`;
    }

    private static getModuleFullPath(dirname: string, cwd: string) {
        const folderParts = dirname.replace(`${cwd}/`, '').split('/');

        // process path conatin node_modules folder, api-helper-v1 included as reference module
        if (folderParts[0] === 'node_modules') {
            return `${cwd}/node_modules/${folderParts[1]}`;
        } else {
            return cwd;
        }
    }

    public static async file2Instance<T extends typeof DtoBase>(this: T, fileName: string, validate: boolean = true): Promise<InstanceType<T>> {
    // protected static async file2Instance<T>(cls: ClassName<T>, fileName: string, validate: boolean): Promise<T> {
        const fsFileName = this.getFullPath(fileName);

        if (fs.existsSync(fsFileName)) {
            // const data = await import(fsFileName);
            const data = JSON.parse(fs.readFileSync(fsFileName, 'utf8'));

            // return await this.plain2Instance(cls, data, validate);
            return await this.plain2Instance(data, validate);
        } else {
            throw new Error(`File not found '${fsFileName}'\nCurrent Folder '${process.cwd()}'`);
        }
    }

    public static async file2Array<T extends typeof DtoBase>(this: T, fileName: string, validate: boolean = true): Promise<ArrayValidator<InstanceType<T>>> {
    // protected static async file2Array<T>(cls: ClassName<T>, fileName: string, validate: boolean): Promise<ArrayValidator<T>> {
        const fsFileName = this.getFullPath(fileName);

        if (fs.existsSync(fsFileName)) {
            // const data = await import(fsFileName);
            const data = JSON.parse(fs.readFileSync(fsFileName, 'utf8'));

            return await this.plain2Instances(data, validate);
        } else {
            throw new Error(`File not found '${fsFileName}'\nCurrent Folder '${process.cwd()}'`);
        }
    }

    // https://stackoverflow.com/questions/34098023/typescript-self-referencing-return-type-for-static-methods-in-inheriting-classe
    public static async plain2Instance<T extends typeof DtoBase>(this: T, dto: object, validate: boolean = true): Promise<InstanceType<T>> {
        // console.log(`plain2Instance:::dto:::\n${JSON.stringify(dto, null, 4)}`)
        const dtoObject = plainToInstance(this, dto, { excludeExtraneousValues: true }) as unknown as T;

        if (validate) {
            // const dtoError = await this.validateData(dtoObject as object, []);
            // if (dtoError.errorCode !== 0) throw new ValidationException(dtoError, 'Data validation errors');

            await (dtoObject as InstanceType<T>).validate();
        }

        return dtoObject as InstanceType<T>
    }

    protected static async plain2Instances<T extends typeof DtoBase>(this: T, dto: object, validate: boolean = true): Promise<ArrayValidator<InstanceType<T>>> {
        const dtoObject = plainToInstance(this, dto, { excludeExtraneousValues: true }) as unknown as ArrayValidator<T>;

        // convert arry of dto to ArrayValidator with generic type
        const dtoArray = new ArrayValidator(dtoObject);

        if (validate) {
            if (this.debug) console.log('dtoArray:::' + JSON.stringify(dtoArray, null, 4));

            const dtoError = await this.validateData(dtoArray as object, []);
            if (dtoError.errorCode !== 0) throw new ValidationException(dtoError, 'Data validation errors');
            // const dtoError = await this.validateData(dtoObject as object);
            // console.log(`array object validate:::${JSON.stringify(dtoError, null, 4)}`);

            if (this.debug) console.log(JSON.stringify(dtoError, null, 4));

            // throw new Error(JSON.stringify(dtoError, null, 4));
        }

        return dtoArray as ArrayValidator<InstanceType<T>>;
    }
}