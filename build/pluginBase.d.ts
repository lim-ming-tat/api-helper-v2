import { ClassConstructor } from 'class-transformer';
import { ValidationError } from 'class-validator';
import { ApiParameter, ApiParam, SessionDataBase } from './apiLibClass.js';
export interface IPlugin {
    readonly name: string;
    readonly match: string;
    execute(item: ApiParameter, dataSource: DataSource, parameter: string): string | boolean;
    isMatch(sourceString: string): boolean;
}
export interface DataSource {
    apiParam: ApiParam;
    sessionData: unknown | SessionDataBase;
}
export declare type ClassType<T> = {
    new (...args: unknown[]): T;
};
export declare abstract class PluginBase implements IPlugin {
    private _name;
    private _match;
    constructor(name: string, match: string);
    get name(): string;
    get match(): string;
    abstract execute(item: ApiParameter, dataSource: DataSource, parameter: string): string | boolean;
    isMatch(sourceString: string): boolean;
    protected addDebugData(dataSource: DataSource, data: Record<string, unknown>): void;
    protected static formatErrorMessage<T>(data: T, message: string, property?: string): string;
    protected static validateParam<T>(targetClass: ClassType<T>, item: ApiParameter, dataSource: DataSource): T;
    protected static validateData<T extends ClassConstructor<unknown>>(dto: T, obj: unknown): void;
    protected static getErrorMessage(errors: ValidationError[], proprtyName?: string, tab?: string): string;
    protected static getValue<T>(propertyName: string, dataSource: DataSource): T;
    protected static updatePropertyV2(sourcePropertyName: string, dataSource: DataSource): string;
}
//# sourceMappingURL=pluginBase.d.ts.map