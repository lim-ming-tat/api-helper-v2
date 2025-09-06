import _ from 'lodash';
// import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
export class PluginBase {
    constructor(name, match) {
        this._name = '';
        this._match = '';
        this._name = name;
        this._match = match;
    }
    get name() {
        return this._name;
    }
    get match() {
        return this._match;
    }
    isMatch(sourceString) {
        return this.match === sourceString;
    }
    addDebugData(dataSource, data) {
        if (dataSource.apiParam.debugData === undefined)
            dataSource.apiParam.debugData = [];
        dataSource.apiParam.debugData.push({ pluginName: this.name, ...data });
    }
    static formatErrorMessage(data, message, property) {
        let formatedMsg = message;
        if (property !== undefined) {
            formatedMsg = `.${property}\n  ${message}`;
        }
        return `Source:\n${JSON.stringify(data, null, 4)}\n\nError Message:\n${formatedMsg}`;
    }
    // public static validateParamX<T extends typeof DtoBase>(this: T, item: ApiParameter, dataSource: DataSource): InstanceType<T> {
    //     // validation, must make sure that item.data is provided
    //     if (item.data === undefined) {
    //         throw new SyntaxError(PluginBase.formatErrorMessage(item, '[ApiParameter].data is missing/undefined', 'data'));
    //     }
    //     // validation, must make sure that item.data map to valid data source
    //     const authParam = this.plain2InstanceSync(_.get(dataSource, PluginBase.updatePropertyV2(item.data, dataSource)));
    //     if (authParam === undefined) {
    //         throw new TypeError(PluginBase.formatErrorMessage(item, `${item.data} is missing/undefined`, 'data'));
    //     }
    //     // authParam = Object.setPrototypeOf(authParam, targetClass.prototype);
    //     return authParam;
    // }
    // protected static validateParam<T>(item: ApiParameter, dataSource: DataSource) {
    static validateParam(targetClass, item, dataSource) {
        // validation, must make sure that item.data is provided
        if (item.data === undefined) {
            throw new SyntaxError(PluginBase.formatErrorMessage(item, '[ApiParameter].data is missing/undefined', 'data'));
        }
        // validation, must make sure that item.data map to valid data source
        let authParam = _.get(dataSource, PluginBase.updatePropertyV2(item.data, dataSource));
        if (authParam === undefined) {
            throw new TypeError(PluginBase.formatErrorMessage(item, `${item.data} is missing/undefined`, 'data'));
        }
        authParam = Object.setPrototypeOf(authParam, targetClass.prototype);
        return authParam;
    }
    static validateData(dto, obj) {
        // tranform the literal object to class object
        const objInstance = plainToInstance(dto, obj);
        // validating and check the errors, throw the errors if exist
        const errors = validateSync(objInstance);
        if (errors.length > 0) {
            throw new SyntaxError(PluginBase.formatErrorMessage(errors[0].target, PluginBase.getErrorMessage(errors)));
        }
    }
    static getErrorMessage(errors, proprtyName = '', tab = '') {
        // const TAB = '\t'
        const TAB = '  ';
        return errors
            .map(({ property, constraints, children }) => {
            let msg = '';
            if (children != undefined && children.length > 0) {
                msg += `\n${PluginBase.getErrorMessage(children, property, `${tab}${TAB}`)}`;
            }
            else {
                for (const key in constraints) {
                    msg += `\n${tab}${TAB}${constraints[key]}`;
                }
            }
            return `${tab}${proprtyName}.${property}:${msg}`;
        })
            .join('\n\n');
    }
    static getValue(propertyName, dataSource) {
        const dataValue = _.get(dataSource, propertyName);
        return dataValue;
    }
    static updatePropertyV2(sourcePropertyName, dataSource) {
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
//# sourceMappingURL=pluginBase.js.map