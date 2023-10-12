var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Type, Expose } from 'class-transformer';
import 'reflect-metadata';
import { NexthopMap, SaveMap } from './mapsHelper.js';
import { Helper } from './helper.js';
import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { DtoBase } from './dtoBase.js';
export class ApiParam extends DtoBase {
    constructor() {
        super(...arguments);
        this.description = '';
        this.debug = false;
        this.debugSession = false;
        this.parametersMaps = new ParametersMaps();
        // parametersMaps: Array<ApiParameter> = new Array<ApiParameter>();
        this.url = '';
        this.httpMethod = '';
        this.nextHopOnly = false;
        this.nextHopParams = new Array();
        this.nextHopMaps = new Array();
        this.saveMaps = new Array();
        this.debugData = [];
        // [key: string]: any
        // public static async getInstance(fileName: string): Promise<ApiParam> {
        //     const fsFileName = Helper.getFullPath(fileName);
        //     if (fs.existsSync(fsFileName)) {
        //         // const data = await import(fsFileName);
        //         const data = JSON.parse(fs.readFileSync(fsFileName, 'utf8'));
        //         const object = plainToInstance(ApiParam, data, {
        //             excludeExtraneousValues: false,
        //         }) as unknown as ApiParam;
        //         return object;
        //     } else {
        //         throw new Error(`File not found '${fsFileName}'\nCurrent Folder '${process.cwd()}'`);
        //     }
        // }
        // public static async getInstanceFromJsObject(jsObject: Record<string, unknown>): Promise<ApiParam> {
        //     const defaultEmptyClass = new ApiParam();
        //     return plainToClassFromExist(defaultEmptyClass, jsObject);
        // }
    }
}
__decorate([
    Expose(),
    __metadata("design:type", Object)
], ApiParam.prototype, "description", void 0);
__decorate([
    Expose(),
    __metadata("design:type", Object)
], ApiParam.prototype, "debug", void 0);
__decorate([
    Expose(),
    __metadata("design:type", Object)
], ApiParam.prototype, "debugSession", void 0);
__decorate([
    Expose(),
    __metadata("design:type", Boolean)
], ApiParam.prototype, "skipExecute", void 0);
__decorate([
    Expose(),
    __metadata("design:type", String)
], ApiParam.prototype, "moduleName", void 0);
__decorate([
    Expose()
    // parameters?: object;
    ,
    __metadata("design:type", Object)
], ApiParam.prototype, "parameters", void 0);
__decorate([
    Expose(),
    Type(() => ApiParameter),
    __metadata("design:type", Array)
], ApiParam.prototype, "moduleParameters", void 0);
__decorate([
    Expose(),
    __metadata("design:type", String)
], ApiParam.prototype, "returnParameterName", void 0);
__decorate([
    Expose(),
    Type(() => ApiParameter),
    __metadata("design:type", Object)
], ApiParam.prototype, "parametersMaps", void 0);
__decorate([
    Expose(),
    __metadata("design:type", Object)
], ApiParam.prototype, "url", void 0);
__decorate([
    Expose(),
    __metadata("design:type", Object)
], ApiParam.prototype, "httpMethod", void 0);
__decorate([
    Expose(),
    __metadata("design:type", Object)
], ApiParam.prototype, "httpHeaders", void 0);
__decorate([
    Expose(),
    __metadata("design:type", Object)
], ApiParam.prototype, "queryString", void 0);
__decorate([
    Expose(),
    __metadata("design:type", Object)
], ApiParam.prototype, "jsonData", void 0);
__decorate([
    Expose(),
    __metadata("design:type", Object)
], ApiParam.prototype, "multiPartData", void 0);
__decorate([
    Expose(),
    __metadata("design:type", Object)
], ApiParam.prototype, "textData", void 0);
__decorate([
    Expose(),
    __metadata("design:type", Object)
], ApiParam.prototype, "base64Data", void 0);
__decorate([
    Expose(),
    __metadata("design:type", Object)
], ApiParam.prototype, "formData", void 0);
__decorate([
    Expose(),
    __metadata("design:type", Object)
], ApiParam.prototype, "nextHopOnly", void 0);
__decorate([
    Expose(),
    Type(() => ApiParam),
    __metadata("design:type", Array)
], ApiParam.prototype, "nextHopParams", void 0);
__decorate([
    Expose(),
    Type(() => NexthopMap),
    __metadata("design:type", Array)
], ApiParam.prototype, "nextHopMaps", void 0);
__decorate([
    Expose(),
    Type(() => SaveMap),
    __metadata("design:type", Array)
], ApiParam.prototype, "saveMaps", void 0);
__decorate([
    Expose(),
    __metadata("design:type", Array)
], ApiParam.prototype, "baseString", void 0);
__decorate([
    Expose(),
    __metadata("design:type", Array)
], ApiParam.prototype, "debugData", void 0);
__decorate([
    Expose(),
    __metadata("design:type", Object)
], ApiParam.prototype, "expected", void 0);
export class ApiTag {
    constructor(parentTag) {
        this._logLabel = '';
        this.level = '';
        this.count = 1;
        if (parentTag !== undefined) {
            this.level = parentTag.tag();
            this._logLabel = parentTag.logLabel();
        }
        else {
            this._logLabel = Helper.randomString(6);
        }
    }
    logLabel() {
        return this._logLabel;
    }
    next() {
        this.count += 1;
    }
    tag() {
        if (this.level === '')
            return this.count.toString();
        else
            return `${this.level}.${this.count.toString()}`;
    }
}
class AnyUnknown {
}
export class SessionDataBase extends AnyUnknown {
    constructor() {
        super(...arguments);
        this.showSessionData = false;
        this.showResults = false;
        this.showApiParam = false;
        this.debugList = [];
        this.skipList = [];
        this.debug = false;
    }
}
export class ResponseParam {
    constructor(apiTag, description, sessionData, saveMaps, apiParam) {
        this.apiTag = apiTag.tag();
        this.description = description;
        this.sessionData = sessionData;
        this.apiParam = apiParam;
        // this.saveMaps = saveMaps
        this.apiResults = new Array();
    }
}
export class ApiCommand extends DtoBase {
    constructor() {
        super(...arguments);
        this.description = '';
        this.sessionData = new SessionDataBase();
        this.apiParams = new Array();
        // @Expose()
        // @Type(() => ResponseParam)
        this.apiResults = new Array();
        // public static async getInstance(fileName: string): Promise<ApiCommand> {
        //     const fsFileName = Helper.getFullPath(fileName);
        //     if (fs.existsSync(fsFileName)) {
        //         // const data = await import(fsFileName);
        //         const data = JSON.parse(fs.readFileSync(fsFileName, 'utf8'));
        //         const object = plainToInstance(ApiCommand, data, {
        //             excludeExtraneousValues: false,
        //         }) as unknown as ApiCommand;
        //         return object;
        //     } else {
        //         throw new Error(`File not found '${fsFileName}'\nCurrent Folder '${process.cwd()}'`);
        //     }
        // }
        // created for jest test case, do not used in production code
        // public static getInstanceSync(fileName: string): ApiCommand {
        //     const fsFileName = Helper.getFullPathV2(fileName);
        //     if (fs.existsSync(fsFileName)) {
        //         const data = JSON.parse(fs.readFileSync(fsFileName, 'utf8'));
        //         // console.log('data', data)
        //         const object = plainToInstance(ApiCommand, data, {
        //             excludeExtraneousValues: false,
        //         }) as unknown as ApiCommand;
        //         // console.log('object', object)
        //         return object;
        //     } else {
        //         throw new Error(`File not found '${fsFileName}'\nCurrent Folder '${process.cwd()}'`);
        //     }
        // }
    }
}
__decorate([
    Expose(),
    __metadata("design:type", Object)
], ApiCommand.prototype, "description", void 0);
__decorate([
    Expose(),
    Type(() => SessionDataBase),
    __metadata("design:type", SessionDataBase)
], ApiCommand.prototype, "sessionData", void 0);
__decorate([
    Expose(),
    Type(() => ApiParam),
    __metadata("design:type", Array)
], ApiCommand.prototype, "apiParams", void 0);
// class ValidationBase<T> {
//     protected validateData(dto: T, obj: unknown) {
//         // tranform the literal object to class object
//         // const objInstance = plainToInstance(dto, obj);
//         // validating and check the errors, throw the errors if exist
//         const errors = validateSync(this as object);
//         if (errors.length > 0) {
//             throw new TypeError(ValidationBase.formatErrorMessage(errors[0].target, ValidationBase.getErrorMessage(errors)));
//         }
//     }
//     protected static formatErrorMessage<T>(data: T, message: string, property?: string) {
//         let formatedMsg = message;
//         if (property !== undefined) {
//             formatedMsg = `.${property}\n  ${message}`;
//         }
//         return `Source:\n${JSON.stringify(data, null, 4)}\n\nError Message:\n${formatedMsg}`;
//     }
//     protected static getErrorMessage(errors: ValidationError[], proprtyName = '', tab = '') {
//         const TAB = '  ';
//         return errors
//             .map(({ property, constraints, children }) => {
//                 let msg = '';
//                 if (children != undefined && children.length > 0) {
//                     msg += `\n${ValidationBase.getErrorMessage(children, property, `${tab}${TAB}`)}`;
//                 } else {
//                     for (const key in constraints) {
//                         msg += `\n${tab}${TAB}${constraints[key]}`;
//                     }
//                 }
//                 return `${tab}${proprtyName}.${property}:${msg}`;
//             })
//             .join('\n\n');
//     }
// }
// class ValidateDataBase {
//     public validateData() {
//         // validating and check the errors, throw the errors if exist
//         const errors = validateSync(this as object);
//         if (errors.length > 0) {
//             throw new TypeError(ValidateDataBase.formatErrorMessage(errors[0].target, ValidateDataBase.getErrorMessage(errors)));
//         }
//     }
//     protected static formatErrorMessage<T>(data: T, message: string, property?: string) {
//         let formatedMsg = message;
//         if (property !== undefined) {
//             formatedMsg = `.${property}\n  ${message}`;
//         }
//         return `Source:\n${JSON.stringify(data, null, 4)}\n\nError Message:\n${formatedMsg}`;
//     }
//     protected static getErrorMessage(errors: ValidationError[], proprtyName = '', tab = '') {
//         const TAB = '  ';
//         return errors
//             .map(({ property, constraints, children }) => {
//                 let msg = '';
//                 if (children != undefined && children.length > 0) {
//                     msg += `\n${ValidateDataBase.getErrorMessage(children, property, `${tab}${TAB}`)}`;
//                 } else {
//                     for (const key in constraints) {
//                         msg += `\n${tab}${TAB}${constraints[key]}`;
//                     }
//                 }
//                 return `${tab}${proprtyName}.${property}:${msg}`;
//             })
//             .join('\n\n');
//     }
// }
export class ParametersMaps extends Array {
}
// export class ParametersMapsValidate extends Array<ApiParameter> {
//     @IsArray()
//     @ValidateNested({ each: true })
//     @Type(() => ApiParameter)
//     parametersMaps: ParametersMaps;
//     // parametersMaps: ParametersMaps = new ParametersMaps();
//     constructor(parametersMaps: ParametersMaps) {
//         super()
//         this.parametersMaps = parametersMaps;
//     }
//     public validateData() {
//         // validating and check the errors, throw the errors if exist
//         const errors = validateSync(this as object);
//         if (errors.length > 0) {
//             throw new TypeError(ParametersMapsValidate.formatErrorMessage(errors[0].target, ParametersMapsValidate.getErrorMessage(errors)));
//         }
//     }
//     protected static formatErrorMessage<T>(data: T, message: string, property?: string) {
//         let formatedMsg = message;
//         if (property !== undefined) {
//             formatedMsg = `.${property}\n  ${message}`;
//         }
//         return `Source:\n${JSON.stringify(data, null, 4)}\n\nError Message:\n${formatedMsg}`;
//     }
//     protected static getErrorMessage(errors: ValidationError[], proprtyName = '', tab = '') {
//         const TAB = '  ';
//         return errors
//             .map(({ property, constraints, children }) => {
//                 let msg = '';
//                 if (children != undefined && children.length > 0) {
//                     msg += `\n${ParametersMapsValidate.getErrorMessage(children, property, `${tab}${TAB}`)}`;
//                 } else {
//                     for (const key in constraints) {
//                         msg += `\n${tab}${TAB}${constraints[key]}`;
//                     }
//                 }
//                 return `${tab}${proprtyName}.${property}:${msg}`;
//             })
//             .join('\n\n');
//     }
// }
// export class ArrayValidator<T> extends Array<T> {
//     @IsArray()
//     @ValidateNested({ each: true })
//     array: Array<T>;
//     constructor(inputArray: Array<T>) {
//         super()
//         this.array = inputArray;
//     }
//     public validateData() {
//         // validating and check the errors, throw the errors if exist
//         const errors = validateSync(this as object);
//         if (errors.length > 0) {
//             throw new TypeError(ArrayValidator.formatErrorMessage(errors[0].target, ArrayValidator.getErrorMessage(errors)));
//         }
//     }
//     protected static formatErrorMessage<T>(data: T, message: string, property?: string) {
//         let formatedMsg = message;
//         if (property !== undefined) {
//             formatedMsg = `.${property}\n  ${message}`;
//         }
//         return `Source:\n${JSON.stringify(data, null, 4)}\n\nError Message:\n${formatedMsg}`;
//     }
//     protected static getErrorMessage(errors: ValidationError[], proprtyName = '', tab = '') {
//         const TAB = '  ';
//         return errors
//             .map(({ property, constraints, children }) => {
//                 let msg = '';
//                 if (children != undefined && children.length > 0) {
//                     msg += `\n${ArrayValidator.getErrorMessage(children, property, `${tab}${TAB}`)}`;
//                 } else {
//                     for (const key in constraints) {
//                         msg += `\n${tab}${TAB}${constraints[key]}`;
//                     }
//                 }
//                 return `${tab}${proprtyName}.${property}:${msg}`;
//             })
//             .join('\n\n');
//     }
// }
export class ApiParameter {
    constructor() {
        // export class ApiParameter extends ValidateDataBase {
        this.description = '';
        this.parameter = '';
        this.targetProperty = '';
        // public validate() {
        //     // validating and check the errors, throw the errors if exist
        //     const errors = validateSync(this as object);
        //     if (errors.length > 0) {
        //         throw new TypeError(ValidationBase.formatErrorMessage(errors[0].target, ValidationBase.getErrorMessage(errors)));
        //     }
        // }
    }
}
__decorate([
    Expose(),
    IsString(),
    __metadata("design:type", Object)
], ApiParameter.prototype, "parameter", void 0);
__decorate([
    Expose(),
    __metadata("design:type", Object)
], ApiParameter.prototype, "targetProperty", void 0);
__decorate([
    Expose(),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], ApiParameter.prototype, "data", void 0);
__decorate([
    Expose(),
    IsOptional(),
    IsBoolean(),
    __metadata("design:type", Boolean)
], ApiParameter.prototype, "debug", void 0);
export class ApiParamBase {
    constructor(params) {
        this.showSessionData = false;
        this.showResults = false;
        this.showApiParam = false;
        this.debugList = [];
        this.debug = false;
        if (params === undefined)
            return;
        this.setParams(params);
    }
    setParams(params) {
        this.showSessionData = params.showSessionData;
        this.showResults = params.showResults;
        this.showApiParam = params.showApiParam;
        this.debug = params.debug;
        this.debugList = params.debugList;
    }
}
//# sourceMappingURL=apiLibClass.js.map