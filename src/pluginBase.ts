import _ from 'lodash';

import 'reflect-metadata';
import { plainToInstance, ClassConstructor } from 'class-transformer';
import { validateSync, ValidationError } from 'class-validator';

import { ApiParameter, ApiParam, SessionDataBase } from './apiLibClass';

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

export declare type ClassType<T> = { new (...args: any[]): T };

export abstract class PluginBase implements IPlugin {
    private _name = '';
    private _match = '';

    constructor(name: string, match: string) {
        this._name = name;
        this._match = match;
    }

    get name(): string {
        return this._name;
    }
    get match(): string {
        return this._match;
    }

    abstract execute(item: ApiParameter, dataSource: DataSource, parameter: string): string | boolean;

    public isMatch(sourceString: string): boolean {
        return this.match === sourceString;
    }

    protected static addDebugData(dataSource: DataSource, data: Record<string, unknown>) {
        if (dataSource.apiParam.debugData === undefined) dataSource.apiParam.debugData = [];

        dataSource.apiParam.debugData.push({ pluginName: this.name, ...data });
    }

    protected static formatErrorMessage<T>(data: T, message: string, property?: string) {
        let formatedMsg = message;
        if (property !== undefined) {
            formatedMsg = `.${property}\n  ${message}`;
        }

        return `Source:\n${JSON.stringify(data, null, 4)}\n\nError Message:\n${formatedMsg}`;
    }

    // protected static validateParam<T>(item: ApiParameter, dataSource: DataSource) {
    protected static validateParam<T>(targetClass: ClassType<T>, item: ApiParameter, dataSource: DataSource) {
        // validation, must make sure that item.data is provided
        if (item.data === undefined) {
            throw new TypeError(PluginBase.formatErrorMessage(item, '[ApiParameter].data is missing/undefined', 'data'));
        }

        // validation, must make sure that item.data map to valid data source
        let authParam = _.get(dataSource, PluginBase.updatePropertyV2(item.data, dataSource)) as T;
        authParam = Object.setPrototypeOf(authParam, targetClass.prototype);

        if (authParam === undefined) {
            throw new TypeError(PluginBase.formatErrorMessage(item, `${item.data} is missing/undefined`, 'data'));
        }

        return authParam;
    }

    protected static validateData<T extends ClassConstructor<unknown>>(dto: T, obj: unknown) {
        // tranform the literal object to class object
        const objInstance = plainToInstance(dto, obj);

        // validating and check the errors, throw the errors if exist
        const errors = validateSync(objInstance as object);

        if (errors.length > 0) {
            throw new TypeError(PluginBase.formatErrorMessage(errors[0].target, PluginBase.getErrorMessage(errors)));
        }
    }

    protected static getErrorMessage(errors: ValidationError[], proprtyName = '', tab = '') {
        // const TAB = '\t'
        const TAB = '  ';
        return errors
            .map(({ property, constraints, children }) => {
                let msg = '';
                if (children != undefined && children.length > 0) {
                    msg += `\n${PluginBase.getErrorMessage(children, property, `${tab}${TAB}`)}`;
                } else {
                    for (const key in constraints) {
                        msg += `\n${tab}${TAB}${constraints[key]}`;
                    }
                }
                return `${tab}${proprtyName}.${property}:${msg}`;
            })
            .join('\n\n');
    }

    protected static updatePropertyV2(sourcePropertyName: string, dataSource: DataSource): string {
        let returnPropertyName = sourcePropertyName;

        // (?<={{) Matches everything followed by {{
        // ([^}]+) Matches any string not containing }
        // (?=}}) Matches everything before }}
        const match = sourcePropertyName.match(/(?<={{)([^}]+)(?=}})/g);
        if (match) {
            match.forEach((item) => {
                const dataValue = _.get(dataSource, item);
                returnPropertyName = returnPropertyName.replace(`{{${item}}}`, dataValue);
            });
        }

        // console.log(sourcePropertyName, '>>>', returnPropertyName);
        return returnPropertyName;
    }
}
