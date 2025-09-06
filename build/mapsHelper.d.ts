import 'reflect-metadata';
import { ResponseParam, SessionDataBase, ApiParam, ParametersMaps } from './apiLibClass.js';
import { PluginBase } from './pluginBase.js';
interface DataFilter {
    propertyName: string;
    conditions?: string;
    filters?: Array<DataFilter>;
    startsWith?: string;
    regex?: string;
    hasProperty?: boolean;
    objectPropertyName?: string;
    ignoreWhenNotExist?: boolean;
    equal?: string | {
        propertyName: string;
        dataValue?: string;
    };
    notEqual?: string | {
        propertyName: string;
        dataValue?: string;
    };
    greaterThan?: number | {
        propertyName: string;
        dataValue?: number;
    };
}
interface PropertyMap {
    objectPropertyName: string;
    propertyName: string;
    dataPath: string;
    dataFilter: DataFilter;
}
export declare class SaveMap {
    description?: string;
    skip?: boolean;
    dataPath?: string;
    sessionName?: string;
    properties?: Array<PropertyMap>;
    ignoreWhenNotExist?: boolean;
    match?: string;
    propertyName?: string;
    dataType?: string;
    dataValue?: unknown;
    objectPropertyName?: string;
    dataFilter?: DataFilter;
}
export declare class NexthopMap {
    description?: string;
    paramTemplateName: string;
    dataPath: string;
    dataFilter?: DataFilter;
    sortOrder?: SortOrder;
    parametersMaps: ParametersMaps;
}
export interface SortOrder {
    sortBy: string;
    orderBy: string;
}
export declare class MapsHelper {
    private static plugins;
    static addPlugin(plugin: PluginBase): void;
    static filterDataV2(dataSource: Record<string, unknown>, dataFilter: DataFilter): boolean;
    private static greaterThan;
    static filterData(item: Record<string, unknown>, dataFilter: DataFilter | undefined): true | Record<string, unknown> | null;
    static applySaveMaps(param: ResponseParam, sessionData: SessionDataBase, saveMaps: Array<SaveMap>): void;
    static applyParametersMaps(apiParam: ApiParam, sessionData: SessionDataBase | unknown, parametersMaps: ParametersMaps): void;
    private static formatErrorMessage;
    static updatePropertyV2(sourcePropertyName: string, apiParam: ApiParam, sessionData: SessionDataBase | unknown): string;
    private static sortData;
    static applyNextHopMaps(param: ApiParam, sessionData: SessionDataBase): void;
}
export {};
//# sourceMappingURL=mapsHelper.d.ts.map