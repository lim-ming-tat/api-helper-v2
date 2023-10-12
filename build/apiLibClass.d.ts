import 'reflect-metadata';
import { DateTime, DurationObjectUnits } from 'luxon';
import request from 'superagent';
import { NexthopMap, SaveMap } from './mapsHelper.js';
import { DtoBase } from './dtoBase.js';
export declare class ApiParam extends DtoBase {
    id?: string;
    description: string;
    debug: boolean;
    debugSession: boolean;
    skipExecute?: boolean;
    moduleName?: string;
    parameters?: Record<string, unknown>;
    moduleParameters?: Array<ApiParameter>;
    returnParameterName?: string;
    parametersMaps: ParametersMaps;
    url: string;
    httpMethod: string;
    httpHeaders?: Record<string, string>;
    queryString?: Record<string, string | number | boolean | readonly string[] | readonly number[] | readonly boolean[] | null>;
    jsonData?: Record<string, unknown>;
    multiPartData?: {
        fields?: Record<string, string>;
        attachments?: Record<string, string>;
    };
    textData?: {
        data: string;
        dataFileName: string;
        contentType: string;
        replaceMapper?: Record<string, string>;
    };
    base64Data?: {
        dataFileName: string;
        fieldName: string;
    };
    formData?: Record<string, unknown>;
    nextHopOnly: boolean;
    nextHopParams: Array<ApiParam>;
    nextHopMaps: Array<NexthopMap>;
    saveMaps: Array<SaveMap>;
    baseString?: Array<string>;
    debugData?: Array<Record<string, unknown>>;
    expected?: {
        arrayLength: number;
        fields: Array<Record<string, unknown>>;
    };
}
export declare class ApiTag {
    private _logLabel;
    private level;
    private count;
    constructor(parentTag?: ApiTag);
    logLabel(): string;
    next(): void;
    tag(): string;
}
declare class AnyUnknown {
    [key: string]: unknown;
}
export declare class SessionDataBase extends AnyUnknown {
    showSessionData: boolean;
    showResults: boolean;
    showApiParam: boolean;
    debugList: Array<string>;
    skipList: Array<string>;
    debug?: boolean | undefined;
}
export declare class ResponseParam {
    apiTag: string;
    description: string;
    startTime?: DateTime;
    endTime?: DateTime;
    elapsed?: DurationObjectUnits;
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
    baseString?: Array<string>;
    constructor(apiTag: ApiTag, description: string, sessionData: SessionDataBase, saveMaps: Array<SaveMap>, apiParam: ApiParam);
}
export interface ApiResponse {
    sessionData: SessionDataBase;
    results: Array<ResponseParam>;
}
export declare class ApiCommand extends DtoBase {
    description: string;
    sessionData: SessionDataBase;
    apiParams: Array<ApiParam>;
    apiResults: Array<ResponseParam>;
}
export declare class ParametersMaps extends Array<ApiParameter> {
}
export declare class ApiParameter {
    description?: string | undefined;
    parameter: string;
    targetProperty: string | Array<string>;
    data?: string;
    debug?: boolean;
}
export declare class ApiParamBase {
    showSessionData: boolean;
    showResults: boolean;
    showApiParam: boolean;
    debugList: Array<string>;
    debug: boolean;
    constructor(params?: ApiParamBase);
    setParams(params: ApiParamBase): void;
}
export {};
//# sourceMappingURL=apiLibClass.d.ts.map