import { plainToInstance, plainToClassFromExist, Type, Expose } from 'class-transformer';
import 'reflect-metadata';
import fs from 'fs';

import { DateTime } from 'luxon';
import request from 'superagent';

import { NexthopMap, SaveMap } from './mapsHelper';

import { Helper } from './helper';

export class ApiParam {
    id?: string;
    @Expose()
    description = '';

    @Expose()
    debug = false;
    @Expose()
    debugSession = false;

    @Expose()
    skipExecute?: boolean;
    @Expose()
    moduleName?: string;
    @Expose()
    // parameters?: object;
    parameters?: Record<string, unknown>;

    @Expose()
    @Type(() => ApiParameter)
    moduleParameters?: Array<ApiParameter>;
    @Expose()
    returnParameterName?: string;

    @Expose()
    @Type(() => ApiParameter)
    parametersMaps: Array<ApiParameter> = new Array<ApiParameter>();

    @Expose()
    url = '';
    @Expose()
    httpMethod = '';

    @Expose()
    httpHeaders?: Record<string, string>;

    @Expose()
    queryString?: Record<string, string | number | boolean | readonly string[] | readonly number[] | readonly boolean[] | null>;

    @Expose()
    jsonData?: Record<string, unknown>;

    @Expose()
    multiPartData?: {
        fields?: Record<string, string>;

        attachments?: Record<string, string>;
    };

    @Expose()
    textData?: {
        data: string;
        dataFileName: string;
        contentType: string;

        replaceMapper?: Record<string, string>;
    };

    @Expose()
    base64Data?: {
        dataFileName: string;
        fieldName: string;
    };

    @Expose()
    formData?: Record<string, unknown>;

    @Expose()
    nextHopOnly = false;
    @Expose()
    @Type(() => ApiParam)
    nextHopParams: Array<ApiParam> = new Array<ApiParam>();

    @Expose()
    @Type(() => NexthopMap)
    nextHopMaps: Array<NexthopMap> = new Array<NexthopMap>();
    @Expose()
    @Type(() => SaveMap)
    saveMaps: Array<SaveMap> = new Array<SaveMap>();

    @Expose()
    baseString?: Array<string>;

    @Expose()
    debugData?: Array<Record<string, unknown>> = [];

    // expected?: Record<string, unknown>;
    @Expose()
    expected?: {
        arrayLength: number;
        fields: Array<Record<string, unknown>>;
    };

    // [key: string]: any

    public static async getInstance(fileName: string): Promise<ApiParam> {
        const fsFileName = Helper.getFullPath(fileName);

        if (fs.existsSync(fsFileName)) {
            const data = await import(fsFileName);
            const object = plainToInstance(ApiParam, data.default, {
                excludeExtraneousValues: false,
            }) as unknown as ApiParam;

            return object;
        } else {
            throw new Error(`File not found '${fsFileName}'\nCurrent Folder '${process.cwd()}'`);
        }
    }

    public static async getInstanceFromJsObject(jsObject: Record<string, unknown>): Promise<ApiParam> {
        const defaultEmptyClass = new ApiParam();

        return plainToClassFromExist(defaultEmptyClass, jsObject);
    }
}

export class ApiTag {
    private _logLabel = '';
    private level = '';
    private count = 1;

    constructor(parentTag?: ApiTag) {
        if (parentTag !== undefined) {
            this.level = parentTag.tag();
            this._logLabel = parentTag.logLabel();
        } else {
            this._logLabel = Helper.randomString(6);
        }
    }

    public logLabel(): string {
        return this._logLabel;
    }

    public next() {
        this.count += 1;
    }

    public tag(): string {
        if (this.level === '') return this.count.toString();
        else return `${this.level}.${this.count.toString()}`;
    }
}

class AnyUnknown {
    [key: string]: unknown;
}

export class SessionDataBase extends AnyUnknown {
    showSessionData = false;
    showResults = false;
    showApiParam = false;

    debugList: Array<string> = [];
    skipList: Array<string> = [];

    debug? = false;
}

export class ResponseParam {
    apiTag: string;
    description: string;

    startTime?: DateTime;
    endTime?: DateTime;

    httpStatus?: number;

    parameters?: unknown;

    responseHeaders?: unknown;
    responseBody?: unknown;
    responseText?: string;

    response?: request.Response;
    error?: Error;

    skipExecute?: boolean;
    nextHopOnly?: boolean;

    debug?: boolean;

    apiResults: Array<ResponseParam>;

    apiParam?: ApiParam;
    sessionData?: SessionDataBase;
    // saveMaps: Array<SaveMap>

    baseString?: Array<string>;

    constructor(apiTag: ApiTag, description: string, sessionData: SessionDataBase, saveMaps: Array<SaveMap>, apiParam: ApiParam) {
        this.apiTag = apiTag.tag();
        this.description = description;

        this.sessionData = sessionData;
        this.apiParam = apiParam;

        // this.saveMaps = saveMaps
        this.apiResults = new Array<ResponseParam>();
    }
}

export interface ApiResponse {
    sessionData: SessionDataBase;
    results: Array<ResponseParam>;
}

export class ApiCommand {
    @Expose()
    description = '';

    @Expose()
    @Type(() => SessionDataBase)
    sessionData: SessionDataBase = new SessionDataBase();

    @Expose()
    @Type(() => ApiParam)
    apiParams: Array<ApiParam> = new Array<ApiParam>();

    // @Expose()
    // @Type(() => ResponseParam)
    apiResults: Array<ResponseParam> = new Array<ResponseParam>();

    public static async getInstance(fileName: string): Promise<ApiCommand> {
        const fsFileName = Helper.getFullPath(fileName);

        if (fs.existsSync(fsFileName)) {
            const data = await import(fsFileName);
            const object = plainToInstance(ApiCommand, data.default, {
                excludeExtraneousValues: false,
            }) as unknown as ApiCommand;

            return object;
        } else {
            throw new Error(`File not found '${fsFileName}'\nCurrent Folder '${process.cwd()}'`);
        }
    }

    // created for jest test case, do not used in production code
    public static getInstanceSync(fileName: string): ApiCommand {
        const fsFileName = Helper.getFullPathV2(fileName);

        if (fs.existsSync(fsFileName)) {
            const data = JSON.parse(fs.readFileSync(fsFileName, 'utf8'));
            // console.log('data', data)
            const object = plainToInstance(ApiCommand, data, {
                excludeExtraneousValues: false,
            }) as unknown as ApiCommand;
            // console.log('object', object)

            return object;
        } else {
            throw new Error(`File not found '${fsFileName}'\nCurrent Folder '${process.cwd()}'`);
        }
    }
}

export class ApiParameter {
    description? = '';

    @Expose()
    parameter = '';
    @Expose()
    targetProperty: string | Array<string> = '';

    // @Expose()
    //     length?: number;

    // @Expose()
    //     userId?: string;
    // @Expose()
    //     password?: string;

    @Expose()
    data?: string;

    @Expose()
    debug?: boolean;
}

// export interface InputParam {
//     showSessionData: boolean;
//     showResults: boolean;
//     showApiParam: boolean;

//     debugList: Array<string>;

//     debug?: boolean;
// }

// export class ApixParam implements InputParam {
//     showSessionData = false;
//     showResults = false;
//     showApiParam = false;

//     debugList: Array<string> = [];

//     debug? = false;
// }

// export interface IApiParam {
//     showSessionData: boolean;
//     showResults: boolean;
//     showApiParam: boolean;

//     debugList: Array<string>;

//     debug: boolean;
// }

export class ApiParamBase {
    showSessionData = false;
    showResults = false;
    showApiParam = false;

    debugList: Array<string> = [];

    debug = false;

    constructor(params?: ApiParamBase) {
        if (params === undefined) return;

        this.setParams(params);
    }

    public setParams(params: ApiParamBase) {
        this.showSessionData = params.showSessionData;
        this.showResults = params.showResults;
        this.showApiParam = params.showApiParam;

        this.debug = params.debug;
        this.debugList = params.debugList;
    }
}
