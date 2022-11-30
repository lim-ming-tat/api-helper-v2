// https://devdojo.com/discoverlance/snippet/form-validation-with-class-validator-1
// ref: https://bkerr.dev/blog/declarative-validation-for-express-apis-with-class-validator-and-class-transformer/

import fs from 'fs';

import path from 'path';
import { fileURLToPath } from 'url';
import { ArrayValidator } from './arrayValidator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import { validateSync as ValidateSync, validateOrReject as ValidateOrReject, ValidationError } from 'class-validator';
import { ValidateExceptionData, ValidationException } from './validationException.js';
import { plainToInstance } from 'class-transformer';

export class DtoBase {
    private static async validateData<T extends object>(input: T, groups: Array<string>) {
        try {
            groups.length > 0 ? await ValidateOrReject(input, { groups: groups }) : await ValidateOrReject(input);

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

    public async validate(groups: Array<string> = []) {
        const dtoError = await DtoBase.validateData(this, groups);

        // console.log(`validate:::\n${JSON.stringify(dtoError, null, 4)}`);
        if (dtoError.errorCode !== 0) throw new ValidationException(dtoError, 'Data validation errors');

        return true;
    }

    public validateSync(groups: Array<string> = [], parentProprtyName = 'data') {
        const valError = groups.length > 0 ? ValidateSync(this, { groups: groups }) : ValidateSync(this);

        const dtoError = { errorCode: valError.length > 0 ? 500 : 0, errors: DtoBase.getErrorMessage(valError, parentProprtyName) };

        // console.log(`validateSync:::\n${JSON.stringify(dtoError, null, 4)}`);
        if (dtoError.errorCode !== 0) throw new ValidationException(dtoError, 'Data validation errors');

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

    public static async file2Instance<T extends typeof DtoBase>(this: T, fileName: string, validate = true): Promise<InstanceType<T>> {
        const fsFileName = this.getFullPath(fileName);

        if (fs.existsSync(fsFileName)) {
            const data = JSON.parse(fs.readFileSync(fsFileName, 'utf8'));

            // return await this.plain2Instance(cls, data, validate);
            return await this.plain2Instance(data, validate);
        } else {
            throw new Error(`File not found '${fsFileName}'\nCurrent Folder '${process.cwd()}'`);
        }
    }

    public static file2InstanceSync<T extends typeof DtoBase>(this: T, fileName: string, validate = true, excludeExtraneousValues = true): InstanceType<T> {
        const fsFileName = this.getFullPath(fileName);

        if (fs.existsSync(fsFileName)) {
            const data = JSON.parse(fs.readFileSync(fsFileName, 'utf8'));

            // return await this.plain2Instance(cls, data, validate);
            return this.plain2InstanceSync(data, validate, excludeExtraneousValues);
        } else {
            throw new Error(`File not found '${fsFileName}'\nCurrent Folder '${process.cwd()}'`);
        }
    }

    public static async file2Array<T extends typeof DtoBase>(this: T, fileName: string, validate = true): Promise<ArrayValidator<InstanceType<T>>> {
        const fsFileName = this.getFullPath(fileName);

        if (fs.existsSync(fsFileName)) {
            const data = JSON.parse(fs.readFileSync(fsFileName, 'utf8'));

            return await this.plain2Instances(data, validate);
        } else {
            throw new Error(`File not found '${fsFileName}'\nCurrent Folder '${process.cwd()}'`);
        }
    }

    // https://stackoverflow.com/questions/34098023/typescript-self-referencing-return-type-for-static-methods-in-inheriting-classe
    public static async plain2Instance<T extends typeof DtoBase>(this: T, dto: object, validate = true): Promise<InstanceType<T>> {
        const dtoObject = plainToInstance(this, dto, { excludeExtraneousValues: true }) as unknown as T;

        if (validate) {
            // const dtoError = await this.validateData(dtoObject as object, []);
            // if (dtoError.errorCode !== 0) throw new ValidationException(dtoError, 'Data validation errors');

            await (dtoObject as InstanceType<T>).validate();
        }

        return dtoObject as InstanceType<T>;
    }

    public static plain2InstanceSync<T extends typeof DtoBase>(this: T, dto: object, validate = true, excludeExtraneousValues = true): InstanceType<T> {
        // set excludeExtraneousValues: false for test case only
        const dtoObject = plainToInstance(this, dto, { excludeExtraneousValues: excludeExtraneousValues }) as unknown as T;

        if (validate) {
            // const dtoError = await this.validateData(dtoObject as object, []);
            // if (dtoError.errorCode !== 0) throw new ValidationException(dtoError, 'Data validation errors');

            (dtoObject as InstanceType<T>).validateSync();
        }

        return dtoObject as InstanceType<T>;
    }

    protected static async plain2Instances<T extends typeof DtoBase>(this: T, dto: object, validate = true): Promise<ArrayValidator<InstanceType<T>>> {
        const dtoObject = plainToInstance(this, dto, { excludeExtraneousValues: true }) as unknown as ArrayValidator<T>;

        // convert arry of dto to ArrayValidator with generic type
        const dtoArray = new ArrayValidator(dtoObject);

        if (validate) {
            // const dtoError = await this.validateData(dtoArray as object, []);
            // if (dtoError.errorCode !== 0) throw new ValidationException(dtoError, 'Data validation errors');

            await (dtoArray as InstanceType<T>).validate();
        }

        return dtoArray as ArrayValidator<InstanceType<T>>;
    }
}
