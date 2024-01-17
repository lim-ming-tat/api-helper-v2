'use strict';

var classTransformer = require('class-transformer');
require('reflect-metadata');
var _ = require('lodash');
var classValidator = require('class-validator');
var path = require('path');
var url = require('url');
var fs = require('fs');
var request = require('superagent');
var qs = require('querystring');
var luxon = require('luxon');

var _documentCurrentScript = typeof document !== 'undefined' ? document.currentScript : null;
function _interopNamespaceDefault(e) {
    var n = Object.create(null);
    if (e) {
        Object.keys(e).forEach(function (k) {
            if (k !== 'default') {
                var d = Object.getOwnPropertyDescriptor(e, k);
                Object.defineProperty(
                    n,
                    k,
                    d.get
                        ? d
                        : {
                              enumerable: true,
                              get: function () {
                                  return e[k];
                              },
                          }
                );
            }
        });
    }
    n.default = e;
    return Object.freeze(n);
}

var qs__namespace = /*#__PURE__*/ _interopNamespaceDefault(qs);

class ValidationException extends Error {
    constructor(details, message) {
        super(message); // 'Error' breaks prototype chain here
        Object.setPrototypeOf(this, new.target.prototype); // restore prototype chain
        this.details = details;
    }
    get errorCode() {
        return this.details.errorCode;
    }
    get errors() {
        return this.details.errors;
    }
}

var __decorate$2 =
    (undefined && undefined.__decorate) ||
    function (decorators, target, key, desc) {
        var c = arguments.length,
            r = c < 3 ? target : desc === null ? (desc = Object.getOwnPropertyDescriptor(target, key)) : desc,
            d;
        if (typeof Reflect === 'object' && typeof Reflect.decorate === 'function') r = Reflect.decorate(decorators, target, key, desc);
        else
            for (var i = decorators.length - 1; i >= 0; i--)
                if ((d = decorators[i])) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
var __metadata$2 =
    (undefined && undefined.__metadata) ||
    function (k, v) {
        if (typeof Reflect === 'object' && typeof Reflect.metadata === 'function') return Reflect.metadata(k, v);
    };
class ArrayValidator extends Array {
    constructor(inputArray) {
        super();
        inputArray.forEach((item) => this.push(item));
        this.array = this;
    }
    async validate() {
        const dtoError = await ArrayValidator.validateData(this);
        // for error message validation in test case
        // console.log(`array validate:::\n${JSON.stringify(dtoError, null, 4)}`);
        if (dtoError.errorCode !== 0) throw new ValidationException(dtoError, 'Data validation errors');
        return true;
    }
    validateSync() {
        const valError = classValidator.validateSync(this);
        const dtoError = { errorCode: valError.length > 0 ? 500 : 0, errors: ArrayValidator.getErrorMessage(valError) };
        if (dtoError.errorCode !== 0) {
            throw new ValidationException(dtoError, 'Data validation errors');
        }
        return true;
    }
    // groups validation not supported for array
    // private static async validateData<T extends object>(input: T, groups: Array<string>) {
    static async validateData(input) {
        try {
            await classValidator.validateOrReject(input);
            return { errorCode: 0, errors: [] };
        } catch (err) {
            const validationErrors = err;
            return { errorCode: 500, errors: this.getErrorMessage(validationErrors) };
        }
    }
    static getErrorMessage(errors, parentProprtyName = 'data') {
        return errors.map(({ property, constraints, children }) => {
            const validateExceptionData = [];
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
}
__decorate$2(
    [classValidator.IsArray(), classValidator.ValidateNested({ each: true }), __metadata$2('design:type', Array)],
    ArrayValidator.prototype,
    'array',
    void 0
);

const __filename$2 = url.fileURLToPath(
    typeof document === 'undefined'
        ? require('url').pathToFileURL(__filename).href
        : (_documentCurrentScript && _documentCurrentScript.src) || new URL('api-helper-v2-bundle.cjs', document.baseURI).href
);
const __dirname$1 = path.dirname(__filename$2);
class Helper {
    static getFullPath(folderPath) {
        // always assume root path as {projectRoot}
        // convert relative path to absolute path (at process level)
        // return folderPath.startsWith('/') ? folderPath : `${process.cwd()}/${folderPath}`;
        return folderPath.startsWith('/') ? folderPath : `${this.getModuleFullPath(__dirname$1, process.cwd())}/${folderPath}`;
    }
    static getModuleFullPath(dirname, cwd) {
        const folderParts = dirname.replace(`${cwd}/`, '').split('/');
        // process path conatin node_modules folder, api-helper-v1 included as reference module
        if (folderParts[0] === 'node_modules') {
            return `${cwd}/node_modules/${folderParts[1]}`;
        } else {
            return cwd;
        }
    }
    static getFullPathV2(folderPath) {
        // always assume root path as {projectRoot}
        // convert relative path to absolute path (at process level)
        return folderPath.startsWith('/') ? folderPath : `${process.cwd()}/${folderPath}`;
    }
    static randomString(length) {
        return [...Array(length)].map(() => Helper.charset[Math.floor(Math.random() * Helper.charset.length)]).join('');
    }
    static regexpEscape(s) {
        return s.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
    }
    static uniqByMap(array) {
        const map = new Map();
        for (const item of array) {
            map.set(item, item);
        }
        return Array.from(map.values());
    }
    static uniqForObject(array) {
        const result = [];
        for (const item of array) {
            // const found = result.some((value) => isEqual(value, item));
            const found = result.some((value) => JSON.stringify(value) === JSON.stringify(item));
            if (!found) {
                result.push(item);
            }
        }
        return result;
    }
}
// credit: https://stackoverflow.com/questions/1349404/generate-random-string-characters-in-javascript
Helper.charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

class PluginBase {
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
        if (dataSource.apiParam.debugData === undefined) dataSource.apiParam.debugData = [];
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
        const objInstance = classTransformer.plainToInstance(dto, obj);
        // validating and check the errors, throw the errors if exist
        const errors = classValidator.validateSync(objInstance);
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
                } else {
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

class IfExists extends PluginBase {
    constructor() {
        super('IfExists', 'ifExists');
    }
    execute(item, dataSource, parameter) {
        const paramData = parameter.split(':');
        const dataValue = _.get(dataSource, paramData[1]);
        const newValue =
            dataValue !== undefined
                ? paramData[2].toLocaleLowerCase() === 'true'
                    ? true
                    : false
                : paramData[2].toLocaleLowerCase() === 'true'
                ? false
                : true;
        if (item.debug) {
            this.addDebugData(dataSource, { parameter: parameter, result: newValue });
        }
        return newValue;
    }
}
class IfNotExists extends PluginBase {
    constructor() {
        super('IfNotExists', 'ifNotExists');
    }
    execute(item, dataSource, parameter) {
        const paramData = parameter.split(':');
        const dataValue = _.get(dataSource, paramData[1]);
        const newValue =
            dataValue === undefined
                ? paramData[2].toLocaleLowerCase() === 'true'
                    ? true
                    : false
                : paramData[2].toLocaleLowerCase() === 'true'
                ? false
                : true;
        if (item.debug) {
            this.addDebugData(dataSource, { parameter: parameter, result: newValue });
        }
        return newValue;
    }
}
class IfTrue extends PluginBase {
    constructor() {
        super('IfTrue', 'ifTrue');
    }
    execute(item, dataSource, parameter) {
        const paramData = parameter.split(':');
        const dataValue = _.get(dataSource, paramData[1]);
        // make sure that the input variable must be boolean
        if (typeof dataValue !== 'boolean') {
            throw new TypeError(IfTrue.formatErrorMessage(item, 'if operand must be a boolean value', 'parameter'));
        }
        const newValue =
            dataValue === true
                ? paramData[2].toLocaleLowerCase() === 'true'
                    ? true
                    : false
                : paramData[2].toLocaleLowerCase() === 'true'
                ? false
                : true;
        return newValue;
    }
}
class IfFalse extends PluginBase {
    constructor() {
        super('IfFalse', 'ifFalse');
    }
    execute(item, dataSource, parameter) {
        const paramData = parameter.split(':');
        const dataValue = _.get(dataSource, paramData[1]);
        // make sure that the input variable must be boolean
        if (typeof dataValue !== 'boolean') {
            throw new TypeError(IfFalse.formatErrorMessage(item, 'if operand must be a boolean value', 'parameter'));
        }
        const newValue =
            dataValue === false
                ? paramData[2].toLocaleLowerCase() === 'true'
                    ? true
                    : false
                : paramData[2].toLocaleLowerCase() === 'true'
                ? false
                : true;
        return newValue;
    }
}
class IfEmpty extends PluginBase {
    constructor() {
        super('IfEmpty', 'ifEmpty');
    }
    execute(item, dataSource, parameter) {
        const paramData = parameter.split(':');
        const dataValue = _.get(dataSource, paramData[1]);
        // make sure that the input variable must be string
        if (typeof dataValue !== 'string') {
            throw new TypeError(IfEmpty.formatErrorMessage(item, 'if operand must be a string', 'parameter'));
        }
        const newValue =
            dataValue === ''
                ? paramData[2].toLocaleLowerCase() === 'true'
                    ? true
                    : false
                : paramData[2].toLocaleLowerCase() === 'true'
                ? false
                : true;
        return newValue;
    }
}

var __decorate$1 =
    (undefined && undefined.__decorate) ||
    function (decorators, target, key, desc) {
        var c = arguments.length,
            r = c < 3 ? target : desc === null ? (desc = Object.getOwnPropertyDescriptor(target, key)) : desc,
            d;
        if (typeof Reflect === 'object' && typeof Reflect.decorate === 'function') r = Reflect.decorate(decorators, target, key, desc);
        else
            for (var i = decorators.length - 1; i >= 0; i--)
                if ((d = decorators[i])) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
var __metadata$1 =
    (undefined && undefined.__metadata) ||
    function (k, v) {
        if (typeof Reflect === 'object' && typeof Reflect.metadata === 'function') return Reflect.metadata(k, v);
    };
const { orderBy: sortData } = _;
class SaveMap {}
__decorate$1([classTransformer.Expose(), __metadata$1('design:type', String)], SaveMap.prototype, 'description', void 0);
__decorate$1([classTransformer.Expose(), __metadata$1('design:type', Boolean)], SaveMap.prototype, 'skip', void 0);
__decorate$1([classTransformer.Expose(), __metadata$1('design:type', String)], SaveMap.prototype, 'dataPath', void 0);
__decorate$1([classTransformer.Expose(), __metadata$1('design:type', String)], SaveMap.prototype, 'sessionName', void 0);
__decorate$1([classTransformer.Expose(), __metadata$1('design:type', Array)], SaveMap.prototype, 'properties', void 0);
__decorate$1([classTransformer.Expose(), __metadata$1('design:type', Boolean)], SaveMap.prototype, 'ignoreWhenNotExist', void 0);
__decorate$1([classTransformer.Expose(), __metadata$1('design:type', String)], SaveMap.prototype, 'match', void 0);
__decorate$1([classTransformer.Expose(), __metadata$1('design:type', String)], SaveMap.prototype, 'propertyName', void 0);
__decorate$1([classTransformer.Expose(), __metadata$1('design:type', String)], SaveMap.prototype, 'dataType', void 0);
__decorate$1([classTransformer.Expose(), __metadata$1('design:type', Object)], SaveMap.prototype, 'dataValue', void 0);
__decorate$1([classTransformer.Expose(), __metadata$1('design:type', String)], SaveMap.prototype, 'objectPropertyName', void 0);
__decorate$1([classTransformer.Expose(), __metadata$1('design:type', Object)], SaveMap.prototype, 'dataFilter', void 0);
class NexthopMap {
    constructor() {
        this.paramTemplateName = '';
        this.dataPath = '';
        this.parametersMaps = new ParametersMaps();
        // parametersMaps: Array<ApiParameter> = new Array<ApiParameter>();
    }
}
__decorate$1([classTransformer.Expose(), __metadata$1('design:type', String)], NexthopMap.prototype, 'description', void 0);
__decorate$1([classTransformer.Expose(), __metadata$1('design:type', Object)], NexthopMap.prototype, 'paramTemplateName', void 0);
__decorate$1([classTransformer.Expose(), __metadata$1('design:type', Object)], NexthopMap.prototype, 'dataPath', void 0);
__decorate$1([classTransformer.Expose(), __metadata$1('design:type', Object)], NexthopMap.prototype, 'dataFilter', void 0);
__decorate$1([classTransformer.Expose(), __metadata$1('design:type', Object)], NexthopMap.prototype, 'sortOrder', void 0);
__decorate$1(
    [classTransformer.Expose(), classTransformer.Type(() => ApiParameter), __metadata$1('design:type', Object)],
    NexthopMap.prototype,
    'parametersMaps',
    void 0
);
const CONDITION_AND = 'and';
const CONDITION_OR = 'or';
// set to true so that the expected error message will be shown on console
// useful during test case creation
// const IS_CREATE_TEST = true;
// const IS_CREATE_TEST = false;
class MapsHelper {
    static addPlugin(plugin) {
        // console.log(`addPlugin::: >>>>>>>> ${plugin.name} <<<<<<<<`)
        const pluginAny = MapsHelper.plugins.filter((item) => {
            return item.name === plugin.name;
        });
        // console.log(`addPlugin found::: >>>>>>>> ${pluginAny.length} <<<<<<<<`)
        if (pluginAny.length > 0) {
            throw new TypeError(`System Error. Plugin (${plugin.name}) already added.`);
        } else {
            MapsHelper.plugins.push(plugin);
        }
    }
    static filterDataV2(dataSource, dataFilter) {
        let leftOperand;
        let rightOperand = undefined;
        if (dataFilter.startsWith !== undefined || dataFilter.regex !== undefined) {
            if (dataFilter.propertyName === undefined) {
                // throw new PropertyUndefinedError('propertyName', dataSource, dataFilter);
                throw new TypeError(this.formatErrorMessage(dataFilter, '.propertyName is missing/undefined', 'propertyName'));
            } else {
                // console.log(JSON.stringify(dataFilter.propertyName, null, 4))
                // console.log(JSON.stringify(dataSource, null, 4))
                if (dataFilter.propertyName === '.') rightOperand = dataSource;
                else rightOperand = _.get(dataSource, dataFilter.propertyName);
                // missing the required property
                if (rightOperand === undefined) {
                    // throw new PropertyUndefinedError(dataFilter.propertyName, dataSource, dataFilter);
                    throw new TypeError(this.formatErrorMessage(dataFilter, '.propertyName is missing/undefined', 'propertyName'));
                }
            }
            let replace = '';
            if (dataFilter.startsWith !== undefined) {
                replace = '^' + Helper.regexpEscape(dataFilter.startsWith);
            } else {
                replace = dataFilter.regex !== undefined ? dataFilter.regex : '';
            }
            const regex = new RegExp(replace, 'gi');
            // console.log(replace + "===" + _.get(dataSource, dataFilter.propertyName).match(regex))
            // console.log(replace + "===" + _.get(dataSource, dataFilter.propertyName))
            // console.log('===' + replace + "===" + JSON.stringify(dataSource, null, 4))
            // if (_.get(dataSource, dataFilter.propertyName).match(regex) != null) {
            //     return true
            // }
            if (typeof rightOperand === 'string' && rightOperand.match(regex) != null) {
                return true;
            }
        }
        if (dataFilter.hasProperty !== undefined) {
            if (typeof dataFilter.hasProperty !== 'boolean') {
                // throw new Error('Invalid datatype for dataFilter.hasProperty, expecting boolean datatype.');
                throw new TypeError(this.formatErrorMessage(dataFilter, '.hasProperty must be a boolean', 'hasProperty'));
            }
            if (dataFilter.propertyName === undefined) {
                // throw new PropertyUndefinedError('propertyName', dataSource, dataFilter);
                throw new TypeError(this.formatErrorMessage(dataFilter, '.propertyName is missing/undefined', 'propertyName'));
            }
            rightOperand = _.get(dataSource, dataFilter.propertyName);
            if (dataFilter.hasProperty) {
                return rightOperand !== undefined ? true : false;
            } else {
                return rightOperand === undefined ? true : false;
            }
        }
        if (dataFilter.conditions !== undefined) {
            if (typeof dataFilter.conditions !== 'string') {
                // throw new Error('Invalid datatype for dataFilter.conditions, expecting string datatype.');
                throw new TypeError(this.formatErrorMessage(dataFilter, '.conditions must be a string', 'conditions'));
            }
            if (dataFilter.conditions.toLowerCase() !== CONDITION_AND && dataFilter.conditions.toLowerCase() !== CONDITION_OR) {
                // throw new Error('Invalid data value for dataFilter.conditions, expecting "and" or "or".');
                throw new TypeError(this.formatErrorMessage(dataFilter, '.conditions must be (and|or)', 'conditions'));
            }
            if (!(dataFilter.filters !== undefined && Array.isArray(dataFilter.filters))) {
                // throw new Error('Invalid datatype for dataFilter.filters, expecting array datatype.');
                throw new TypeError(this.formatErrorMessage(dataFilter, '.filters must be an array', 'filters'));
            }
            // set to true for and condition and set to false for or condition
            let result = dataFilter.conditions.toLowerCase() === CONDITION_AND;
            for (let i = 0; i < dataFilter.filters.length; i++) {
                if (dataFilter.conditions.toLowerCase() === CONDITION_AND) {
                    result = result && MapsHelper.filterDataV2(dataSource, dataFilter.filters[i]);
                    // short circuit return when hit first false
                    // console.log("and:::" + dataFilter.filters[i].propertyName)
                    if (!result) {
                        return result;
                    }
                } else {
                    result = result || MapsHelper.filterDataV2(dataSource, dataFilter.filters[i]);
                    // short circuit return when hit first true
                    // console.log(" or:::" + dataFilter.filters[i].propertyName)
                    if (result) {
                        return result;
                    }
                }
            }
            return result;
        }
        if (dataFilter.equal !== undefined) {
            // console.log('--------')
            // // console.log(JSON.stringify(_.get(item, "title"), null, 4))
            // console.log('dataSource', JSON.stringify(dataSource, null, 4))
            // console.log('dataFilter', JSON.stringify(dataFilter, null, 4))
            // console.log('--------')
            leftOperand = _.get(dataSource, dataFilter.propertyName);
            // target property not exists, return false to exclude record
            if (leftOperand === undefined && dataFilter.ignoreWhenNotExist) {
                return false;
            }
            // missing the required property
            if (leftOperand === undefined) {
                // throw new PropertyUndefinedError(dataFilter.propertyName, dataSource, dataSource);
                throw new TypeError(this.formatErrorMessage(dataFilter, '.propertyName is missing/undefined', 'propertyName'));
            }
            if (typeof dataFilter.equal === 'string') {
                rightOperand = dataFilter.equal;
            } else {
                if (dataFilter.equal.propertyName !== undefined) {
                    rightOperand = _.get(dataSource, dataFilter.equal.propertyName);
                    // missing the required property
                    if (rightOperand === undefined) {
                        // throw new PropertyUndefinedError(dataFilter.equal.propertyName, dataSource, dataFilter);
                        throw new TypeError(this.formatErrorMessage(dataFilter, '.equal.propertyName is missing/undefined', 'propertyName'));
                    }
                } else if (dataFilter.equal.dataValue !== undefined) {
                    rightOperand = dataFilter.equal.dataValue;
                } else if (rightOperand === undefined) {
                    // throw new PropertyUndefinedError(['dataFilter.equal.propertyName', 'dataFilter.equal.dataValue'].toString(), dataSource, dataFilter);
                    throw new TypeError(
                        this.formatErrorMessage(dataFilter, '.equal.propertyName and .equal.dataValue is missing/undefined', 'propertyName|dataValue')
                    );
                }
            }
            // console.log(`${leftOperand} == ${rightOperand} => ${leftOperand == rightOperand}`)
            return leftOperand === rightOperand;
        }
        if (dataFilter.notEqual !== undefined) {
            // console.log()
            // console.log(JSON.stringify(_.get(item, "title"), null, 4))
            // console.log(JSON.stringify(dataFilter, null, 4))
            leftOperand = _.get(dataSource, dataFilter.propertyName);
            // missing the required property
            if (leftOperand === undefined) {
                // throw new PropertyUndefinedError(dataFilter.propertyName, dataSource, dataFilter);
                throw new TypeError(this.formatErrorMessage(dataFilter, '.propertyName is missing/undefined', 'propertyName'));
            }
            if (typeof dataFilter.notEqual === 'string') {
                rightOperand = dataFilter.notEqual;
            } else {
                if (dataFilter.notEqual.propertyName !== undefined) {
                    rightOperand = _.get(dataSource, dataFilter.notEqual.propertyName);
                    // missing the required property
                    if (rightOperand === undefined) {
                        // throw new PropertyUndefinedError(dataFilter.notEqual.propertyName, dataSource, dataFilter);
                        throw new TypeError(this.formatErrorMessage(dataFilter, '.notEqual.propertyName is missing/undefined', 'propertyName'));
                    }
                } else if (dataFilter.notEqual.dataValue !== undefined) {
                    rightOperand = dataFilter.notEqual.dataValue;
                } else if (rightOperand === undefined) {
                    // throw new PropertyUndefinedError(['dataFilter.notEqual.propertyName', 'dataFilter.notEqual.dataValue'].toString(), dataSource, dataFilter);
                    throw new TypeError(
                        this.formatErrorMessage(
                            dataFilter,
                            '.notEqual.propertyName and .notEqual.dataValue is missing/undefined',
                            'propertyName|dataValue'
                        )
                    );
                }
            }
            // console.log(`${leftOperand} != ${rightOperand} => ${leftOperand != rightOperand}`)
            return leftOperand !== rightOperand;
        }
        if (dataFilter.greaterThan !== undefined) {
            // console.log()
            // console.log(JSON.stringify(_.get(item, "title"), null, 4))
            // console.log(JSON.stringify(dataFilter, null, 4))
            leftOperand = _.get(dataSource, dataFilter.propertyName);
            // missing the required property
            if (leftOperand === undefined) {
                // throw new PropertyUndefinedError(dataFilter.propertyName, dataSource, dataSource);
                throw new TypeError(this.formatErrorMessage(dataFilter, '.propertyName is missing/undefined', 'propertyName'));
            }
            if (typeof dataFilter.greaterThan === 'number') {
                // TODO: this is not required, can be enhance
                rightOperand = dataFilter.greaterThan;
            } else {
                if (dataFilter.greaterThan.propertyName !== undefined) {
                    rightOperand = _.get(dataSource, dataFilter.greaterThan.propertyName);
                    // missing the required property
                    if (rightOperand === undefined) {
                        // throw new PropertyUndefinedError(dataFilter.greaterThan.propertyName, dataSource, dataSource);
                        throw new TypeError(this.formatErrorMessage(dataFilter, '.greaterThan.propertyName is missing/undefined', 'propertyName'));
                    }
                } else if (dataFilter.greaterThan.dataValue !== undefined) {
                    rightOperand = dataFilter.greaterThan.dataValue;
                } else if (rightOperand === undefined) {
                    // throw new PropertyUndefinedError(['dataFilter.greaterThan.propertyName', 'dataFilter.greaterThan.dataValue'].toString(), dataSource, dataFilter);
                    throw new TypeError(
                        this.formatErrorMessage(
                            dataFilter,
                            '.greaterThan.propertyName and .greaterThan.dataValue is missing/undefined',
                            'propertyName|dataValue'
                        )
                    );
                }
            }
            return this.greaterThan(leftOperand, rightOperand);
        }
        return false;
    }
    static greaterThan(a, b) {
        return a > b;
    }
    static filterData(item, dataFilter) {
        if (dataFilter !== undefined) return MapsHelper.filterDataV2(item, dataFilter) ? item : null;
        else return true;
    }
    static applySaveMaps(param, sessionData, saveMaps) {
        // try {
        // console.log(`\n---saveMaps---\n${JSON.stringify(saveMaps, null, 4)}\n---saveMaps---\n`)
        if (saveMaps !== undefined && Array.isArray(saveMaps)) {
            saveMaps.forEach((saveMap) => {
                if (!(saveMap.skip !== undefined && saveMap.skip)) {
                    // console.log(JSON.stringify(saveMap, null, 4))
                    // process collection of records
                    if (saveMap.dataPath !== undefined) {
                        let sourceData = _.get(param.sessionData, saveMap.sessionName ? saveMap.sessionName : '');
                        if (sourceData === undefined) {
                            // param.sessionData[saveMap.sessionName] = []
                            _.set(sessionData, saveMap.sessionName ? saveMap.sessionName : '', []);
                            sourceData = _.get(param.sessionData, saveMap.sessionName ? saveMap.sessionName : '');
                        }
                        let dataRows = null;
                        if (saveMap.dataPath === '.') {
                            dataRows = param;
                        } else {
                            dataRows = _.get(param, saveMap.dataPath);
                        }
                        // source data not found, set to empty array
                        if (dataRows === undefined) {
                            dataRows = [];
                        }
                        if (!Array.isArray(dataRows)) {
                            dataRows = [dataRows];
                        }
                        let index = 0;
                        // console.log(JSON.stringify(dataRows, null, 4))
                        dataRows
                            .filter((item) => {
                                // console.log(JSON.stringify(item, null, 4))
                                return MapsHelper.filterData(item, saveMap.dataFilter);
                            })
                            .forEach((item) => {
                                let dataObject = {};
                                if (saveMap.properties !== undefined) {
                                    // filter by property
                                    saveMap.properties.forEach((propertyMap) => {
                                        if (propertyMap.propertyName !== undefined) {
                                            // source data from sessionData or apiParam
                                            if (
                                                propertyMap.propertyName.startsWith('sessionData.') ||
                                                propertyMap.propertyName.startsWith('apiParam.')
                                            ) {
                                                // assign each value in source array to each target array item, i.e. sourceItem 1 map to targetItem 1
                                                // source and target array must be same length, else it will set to empty
                                                let propertyName = propertyMap.propertyName;
                                                if (propertyMap.propertyName.includes('[x]')) {
                                                    propertyName = propertyMap.propertyName.replace('[x]', `[${index}]`);
                                                    // if the sourceItem array is less than targetItem, used the first item from sourceItem
                                                    if (_.get(param, propertyName) === undefined) {
                                                        propertyName = propertyMap.propertyName.replace('[x]', '[0]');
                                                    }
                                                }
                                                // console.log(`PropertyName:::${propertyName}`)
                                                dataObject[propertyMap.objectPropertyName] = _.get(param, propertyName);
                                            } else {
                                                // source data from current item
                                                dataObject[propertyMap.objectPropertyName] = _.get(item, propertyMap.propertyName);
                                            }
                                        } else {
                                            // console.log('item', item)
                                            // console.log('propertyMap.dataFilter', propertyMap.dataFilter)
                                            // console.log('_.get(item, item.dataPath)', _.get(item, propertyMap.dataPath))
                                            // get the source data
                                            const dataProp = _.get(item, propertyMap.dataPath);
                                            // filter the record and select only the first row return
                                            // when no record found, it will set to undefined
                                            const selectedData = dataProp.filter((xitem) => {
                                                // console.log(JSON.stringify(item, null, 4))
                                                return MapsHelper.filterData(xitem, propertyMap.dataFilter);
                                            })[0];
                                            // console.log('propertyMap.dataFilter', propertyMap.dataFilter)
                                            // console.log('propertyMap.objectPropertyName', propertyMap.objectPropertyName)
                                            // console.log('selectedData', selectedData)
                                            // if (propertyMap.dataFilter.objectPropertyName)
                                            //     console.log('value',  _.get(selectedData, propertyMap.dataFilter.objectPropertyName))
                                            if (propertyMap.dataFilter.objectPropertyName !== undefined) {
                                                dataObject[propertyMap.objectPropertyName] = _.get(
                                                    selectedData,
                                                    propertyMap.dataFilter.objectPropertyName
                                                );
                                            } else {
                                                dataObject[propertyMap.objectPropertyName] = selectedData;
                                            }
                                        }
                                    });
                                } else {
                                    dataObject = _.cloneDeep(item);
                                }
                                // console.log(dataObject)
                                index++;
                                sourceData.push(dataObject);
                            });
                    } else {
                        // get the sessionData variable
                        let sourceData = _.get(param.sessionData, saveMap.sessionName ? saveMap.sessionName : '');
                        // if (saveMap.sessionName === 'selectedTenant.Themes') {
                        //     console.log(`\n---saveMap.sessionName---\n${saveMap.sessionName}\n---saveMap.sessionName---\n`)
                        //     console.log(`\n---saveMap.propertyName---\n${saveMap.propertyName}\n---saveMap.propertyName---\n`)
                        //     // console.log(`\n---sessionData---\n${JSON.stringify(param, null, 4)}\n---sessionData---\n`)
                        // }
                        // console.log(`sourceData:::${sourceData}`)
                        // sessionData not declare or request for variable initialization
                        if (saveMap.propertyName === undefined || sourceData === undefined) {
                            // typeof values = "string" | "number" | "bigint" | "boolean" | "symbol" | "undefined" | "object" | "function"
                            if (saveMap.dataType !== undefined && saveMap.dataType === 'string') {
                                _.set(sessionData, saveMap.sessionName ? saveMap.sessionName : '', '');
                            } else if (saveMap.dataType !== undefined && saveMap.dataType === 'number') {
                                _.set(sessionData, saveMap.sessionName ? saveMap.sessionName : '', 0);
                            } else if (saveMap.dataType !== undefined && saveMap.dataType === 'bigint') {
                                _.set(sessionData, saveMap.sessionName ? saveMap.sessionName : '', BigInt(0));
                            } else if (saveMap.dataType !== undefined && saveMap.dataType === 'booleanTrue') {
                                _.set(sessionData, saveMap.sessionName ? saveMap.sessionName : '', true);
                            } else if (saveMap.dataType !== undefined && saveMap.dataType === 'booleanFalse') {
                                _.set(sessionData, saveMap.sessionName ? saveMap.sessionName : '', false);
                            } else if (saveMap.dataType !== undefined && saveMap.dataType === 'undefined') {
                                _.set(sessionData, saveMap.sessionName ? saveMap.sessionName : '', undefined);
                            } else if (saveMap.dataType !== undefined && saveMap.dataType === 'object') {
                                _.set(sessionData, saveMap.sessionName ? saveMap.sessionName : '', {});
                            } else if (saveMap.dataType !== undefined && saveMap.dataType === 'array') {
                                if (saveMap.dataValue !== undefined) {
                                    if (sourceData === undefined) _.set(sessionData, saveMap.sessionName ? saveMap.sessionName : '', []);
                                } else {
                                    _.set(sessionData, saveMap.sessionName ? saveMap.sessionName : '', []);
                                }
                            } else if (saveMap.dataType === undefined) {
                                // TODO: propertyName must be defined
                                // TODO: change the default value from '' to undefined,
                                // so that when the source(propertyName) is undefined, the sessionData is not created as rmpty string
                                _.set(sessionData, saveMap.sessionName ? saveMap.sessionName : '', undefined);
                            } else {
                                // _.set(sessionData, saveMap.sessionName ? saveMap.sessionName : '', '');
                                throw new TypeError(this.formatErrorMessage(saveMap, '.dataType not supported', 'saveMap'));
                            }
                            // get the initialize sessionData variable
                            sourceData = _.get(sessionData, saveMap.sessionName ? saveMap.sessionName : '');
                        }
                        // console.log(`sourceData:::${sourceData}`)
                        if (saveMap.propertyName !== undefined) {
                            if (saveMap.dataType !== undefined && saveMap.dataType === 'array') {
                                // console.log(`\n---saveMap.dataType---\n${saveMap.dataType}\n---saveMap.dataType---\n`)
                                // console.log(`\n---saveMap.dataType---\n${JSON.stringify(_.get(param, saveMap.propertyName), null, 4)}\n---saveMap.dataType---\n`)
                                sourceData.push(_.cloneDeep(_.get(param, saveMap.propertyName)));
                                // console.log(`\n---saveMap.dataType---\n${JSON.stringify(sessionData, null, 4)}\n---saveMap.dataType---\n`)
                            } else if (saveMap.dataType !== undefined && saveMap.dataType === 'object') {
                                if (saveMap.objectPropertyName === undefined) {
                                    // throw new PropertyUndefinedError('objectPropertyName', saveMap, saveMap);
                                    throw new TypeError(this.formatErrorMessage(saveMap, 'required .objectPropertyName is missing', 'saveMap'));
                                }
                                _.set(sourceData, saveMap.objectPropertyName, _.get(param, saveMap.propertyName));
                            } else {
                                // console.log(JSON.stringify(saveMap, null, 4))
                                // console.log(JSON.stringify(param.sessionData, null, 4))
                                // console.log(`setValue:::${saveMap.propertyName}`)
                                if (_.get(param, saveMap.propertyName) === undefined) {
                                    // console.log(`ignoreWhenNotExist:::${saveMap.ignoreWhenNotExist}--${JSON.stringify(saveMap, null, 4)}`)
                                    // ignoreWhenNotExist is to handle responseBody that is return as '[]' string
                                    // used in api-deletePolicies
                                    // if (!saveMap.ignoreWhenNotExist) throw new PropertyUndefinedError(saveMap.propertyName, param, saveMap);
                                    if (!saveMap.ignoreWhenNotExist)
                                        throw new TypeError(
                                            this.formatErrorMessage(saveMap, '.ignoreWhenNotExist set to false and property not found', 'saveMap')
                                        );
                                } else {
                                    let newValue = _.get(param, saveMap.propertyName);
                                    if (saveMap.match !== undefined) {
                                        newValue = newValue.toString().match(saveMap.match);
                                    }
                                    // _.set(param.sessionData, saveMap.sessionName ? saveMap.sessionName : '', _.get(param, saveMap.propertyName))
                                    _.set(sessionData, saveMap.sessionName ? saveMap.sessionName : '', newValue);
                                    // console.log(JSON.stringify(param.sessionData, null, 4))
                                }
                            }
                        } else if (saveMap.dataValue !== undefined) {
                            // sourceData = saveMap.dataValue
                            if (saveMap.dataType === 'array') {
                                // sourceData.push(saveMap.dataValue);
                                sourceData.push(saveMap.dataValue);
                            } else if (saveMap.dataType === 'object') {
                                if (saveMap.objectPropertyName === undefined) {
                                    // throw new PropertyUndefinedError('objectPropertyName', saveMap, saveMap);
                                    throw new TypeError(this.formatErrorMessage(saveMap, 'required .objectPropertyName is missing', 'saveMap'));
                                }
                                _.set(sourceData, saveMap.objectPropertyName, saveMap.dataValue);
                            } else {
                                _.set(sessionData, saveMap.sessionName ? saveMap.sessionName : '', saveMap.dataValue);
                            }
                            // console.log(_.get(param.sessionData, saveMap.sessionName))
                        }
                    }
                }
            });
        }
    }
    static applyParametersMaps(apiParam, sessionData, parametersMaps) {
        // public static applyParametersMaps(apiParam: ApiParam, sessionData: SessionDataBase | unknown, parametersMaps: Array<ApiParameter>): void {
        const dataSource = {
            apiParam: apiParam,
            sessionData: sessionData,
        };
        // validate the parametersMaps
        new ArrayValidator(parametersMaps).validateSync();
        // replace property value with value from sessionData
        parametersMaps.forEach((item) => {
            // propagate debug flag to ApiParameter from ApiParam
            item.debug = apiParam.debug;
            // make sure that is an array
            let targetList;
            if (Array.isArray(item.targetProperty)) targetList = item.targetProperty;
            else targetList = [item.targetProperty];
            // default parameter replace mapper
            let replace = '{{' + Helper.regexpEscape(item.parameter) + '}}';
            let newValue = '';
            // match string start with {{ and end with }} and does not contain }}.*{{ pattern
            const match = item.parameter.match(/^{{(((?!}}.*{{).)*)}}$/);
            if (match) {
                const parameter = match[1];
                const commandKeyword = parameter.split(':')[0];
                // search for plugin to handle the parameter command
                const plugins = MapsHelper.plugins.filter((item) => {
                    // return item.match === commandKeyword;
                    return item.isMatch(commandKeyword);
                });
                // expecting to find only 1 plugin per parameter command
                if (plugins.length === 1) {
                    if (dataSource.sessionData.debug || item.debug) console.log(`execute plugin::: >>>>>>>> ${commandKeyword} <<<<<<<<`);
                    replace = item.parameter;
                    newValue = plugins[0].execute(item, dataSource, parameter);
                    if (dataSource.sessionData.debug || item.debug) console.log(`>>>>>>>> ${parameter}\n${newValue}\n<<<<<<<<`);
                } else {
                    throw new TypeError(this.formatErrorMessage(item, 'command not supported', 'parameter'));
                }
                ////TODO: shlould throw error here...
                if (newValue === '') {
                    throw new TypeError(this.formatErrorMessage(item, 'parameter source is missing/undefined', 'parameter'));
                    // throw new TypeError(this.formatErrorMessage({ item: item, dataSource: dataSource }, 'parameter source is missing/undefined', 'parameter'));
                }
                // console.log(`commandKeyword replace:::${replace}`)
            } else {
                // replace paremeter variable name with *
                replace = '{{' + item.parameter.replace(/{{([^}]+)}}/g, '*') + '}}';
                newValue = _.get(dataSource, this.updatePropertyV2(item.parameter, apiParam, sessionData));
            }
            // console.log(`Replace...${replace}`)
            // console.log(`New Value...${item.parameter}=${newValue}`)
            // TODO: original design does not throw error when input parameter is missing
            if (newValue === undefined) {
                // console.log(`Parameter missing, input parameter '${item.parameter}' not found.`);
                // console.log(`\n------\n${ApiLibrary.displayResult([dataSource], '')}\n------\n`);
                // throw new Error(`Parameter missing, input parameter '${JSON.stringify(item)}' not found.`);
                if (item.ignoreWhenNotExist === false) {
                    throw new TypeError(this.formatErrorMessage(item, 'parameter source is missing/undefined', 'parameter'));
                    // throw new TypeError(this.formatErrorMessage({ item: item, dataSource: dataSource }, 'parameter source is missing/undefined', 'parameter'));
                }
            } else {
                targetList.forEach((listItem) => {
                    // resolved target propety name with support for variable injection
                    const targetProperty = this.updatePropertyV2(listItem, apiParam, sessionData);
                    if (typeof _.get(apiParam, targetProperty) === 'string') {
                        if (item.overwrite && item.overwrite === true) {
                            _.set(apiParam, targetProperty, newValue);
                        } else {
                            // replace = '{{' + item.parameter + '}}'
                            const regex = new RegExp(Helper.regexpEscape(replace), 'g');
                            // console.log('targetProperty', targetProperty)
                            // console.log('replace', replace)
                            // console.log('targetProperty Value >>', _.get(apiParam, targetProperty))
                            // console.log('targetProperty New   >>', _.get(apiParam, targetProperty).replace(regex, newValue))
                            // console.log('newValue', newValue)
                            // console.log(`\n---replace---\n${JSON.stringify(replace, null, 4)}\n---replace---\n`)
                            // console.log(`\n---targetProperty---\n${JSON.stringify(targetProperty, null, 4)}\n---targetProperty---\n`)
                            _.set(apiParam, targetProperty, _.get(apiParam, targetProperty).replace(regex, newValue));
                            // console.log(`\n---apiParam---\n${JSON.stringify(apiParam, null, 4)}\n---apiParam---\n`)
                        }
                    } else {
                        // TODO: currently, non-string target will be overwritten
                        // need to handle, object type target like a = { ...a, ...newValue } ???
                        _.set(apiParam, targetProperty, newValue);
                    }
                });
            }
        });
    }
    static formatErrorMessage(data, message, property) {
        let formatedMsg = message;
        if (property !== undefined) {
            formatedMsg = `.${property}\n  ${message}`;
        }
        // if (IS_CREATE_TEST) {
        //     // TODO: debugging codes, to be commented after test case creation
        //     let msg = `Source:\n${JSON.stringify(data, null, 4)}\n\nError Message:\n${formatedMsg}`;
        //     // msg = msg.replace(/\n/g, '\\n').replace(/\\"/g, '\\\\"');
        //     msg = msg.replace(/\n/g, '\\n').replace(/"/g, '\\"');
        //     console.log(msg, DateTime.local().toString(), helper.randomString(10));
        // }
        return `Source:\n${JSON.stringify(data, null, 4)}\n\nError Message:\n${formatedMsg}`;
    }
    static updatePropertyV2(
        sourcePropertyName,
        apiParam,
        // sessionData: SessionDataBase | object
        sessionData
    ) {
        const dataSource = {
            apiParam: apiParam,
            sessionData: sessionData,
        };
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
    static sortData(outputMap, dataRows) {
        if (outputMap.sortOrder !== undefined) {
            // default assending order
            let orderBy = 'asc';
            const sortBy = outputMap.sortOrder.sortBy;
            if (outputMap.sortOrder.orderBy === 'asc' || outputMap.sortOrder.orderBy === 'desc') orderBy = outputMap.sortOrder.orderBy;
            // dataRows = dataRows.sort(MapsHelper.compareValues(sortBy, orderBy));
            dataRows = sortData(dataRows, sortBy, orderBy === 'asc' ? 'asc' : 'desc');
        }
        return dataRows;
    }
    static applyNextHopMaps(param, sessionData) {
        const dataSource = {
            apiParam: param,
            sessionData: sessionData,
        };
        // try {
        // let index = 0;
        // const count = 0;
        //   var message = ''
        // process nextHopMaps
        // if (param.nextHopMaps != undefined && Array.isArray(param.nextHopMaps) && param.nextHopMaps.length > 0) {
        if (param.nextHopMaps !== undefined && Array.isArray(param.nextHopMaps)) {
            // message += "\n" + JSON.stringify(param.nextHopMaps, null, 4)
            param.nextHopMaps.forEach((nextHopMap) => {
                // reset counter
                // index = 0;
                // invalid paramTemplateName
                if (_.get(param, nextHopMap.paramTemplateName) === undefined) {
                    // throw new PropertyUndefinedError(nextHopMap.paramTemplateName, param, nextHopMap);
                    throw new TypeError(this.formatErrorMessage(nextHopMap, '.paramTemplateName is missing/undefined', 'paramTemplateName'));
                }
                // get the json param template for nextHop
                const templateSting = JSON.stringify(_.get(param, nextHopMap.paramTemplateName));
                let dataRows = null;
                if (nextHopMap.dataPath === '.') {
                    //TODO: required review, this condition most likely not required, no test case created
                    dataRows = param;
                } else {
                    dataRows = _.get(dataSource, nextHopMap.dataPath);
                }
                // console.log(`\n---nextHopMap.dataPath---\n${JSON.stringify(nextHopMap.dataPath, null, 4)}\n---nextHopMap.dataPath---\n`)
                // console.log(`\n---nextHopMap.dataSource---\n${JSON.stringify(dataSource, null, 4)}\n---nextHopMap.dataSource---\n`)
                // not required to support
                // "nextHopMaps": [
                //     {
                //         "paramTemplateName": "getListenerParam"
                //     }
                // ],
                // if (dataRows === undefined) {
                //     throw new TypeError(this.formatErrorMessage(nextHopMap, '.dataPath is missing/undefined', 'dataPath'));
                // }
                if (!Array.isArray(dataRows)) {
                    dataRows = [dataRows];
                }
                // console.log(`\n---dataRows---\n${JSON.stringify(dataRows, null, 4)}\n---dataRows---\n`)
                // message += "\n" + JSON.stringify(dataRows, null, 4)
                // not required, mean for no record return
                // if (dataRows == undefined) {
                //     throw new DataPathUndefinedError(nextHopMap.dataPath, param, nextHopMap)
                // }
                // if (dataRows == undefined) {
                //     dataRows = [ ]
                // } else if (!Array.isArray(dataRows)) {
                //     dataRows = [ dataRows ]
                // }
                // if (!Array.isArray(dataRows)) {
                //     dataRows = [dataRows]
                // }
                // default to empty array when nextHopParams is undefined
                if (param.nextHopParams === undefined) {
                    param.nextHopParams = [];
                }
                // if (nextHopMap.sortOrder != undefined) {
                //     var sortBy = nextHopMap.propertyName
                //     var orderBy = "asc"
                //     if (nextHopMap.sortOrder.sortBy != undefined) sortBy = nextHopMap.sortOrder.sortBy
                //     if ((nextHopMap.sortOrder.orderBy == "asc" || nextHopMap.sortOrder.orderBy == "desc")) orderBy = nextHopMap.sortOrder.orderBy
                //     dataRows = dataRows.sort(compareValues(sortBy, orderBy))
                // }
                dataRows = MapsHelper.sortData(nextHopMap, dataRows);
                dataRows
                    .filter((item) => {
                        return MapsHelper.filterData(item, nextHopMap.dataFilter);
                    })
                    .forEach((item) => {
                        // ++index;
                        // ++count;
                        // console.log(`\n---item---\n${JSON.stringify(item, null, 4)}\n---item---\n`)
                        // // create param from template
                        // return json2ClassFactory.getApiParamFromJsObject(JSON.parse(templateSting))
                        //     .then(template => {
                        //         // replace the template property with item property
                        //         MapsHelper.applyParametersMaps(template, item, nextHopMap.parametersMaps)
                        //         // add the parameters for subsequence execution...
                        //         param.nextHopParams.push(template)
                        //         // console.log(`\n---nextHopParams---\n${JSON.stringify(param.nextHopParams, null, 4)}\n---nextHopParams---\n`)
                        //     })
                        // nextHopParam can be an array of ApiParam
                        let templates;
                        if (templateSting.startsWith('[')) {
                            templates = JSON.parse(templateSting);
                        } else {
                            templates = JSON.parse(`[${templateSting}]`);
                        }
                        templates.forEach((template) => {
                            if (nextHopMap.parametersMaps !== undefined) {
                                // transfer parameters to next level automatically
                                if (dataSource.apiParam.parameters !== undefined) {
                                    template.parameters = _.cloneDeep(dataSource.apiParam.parameters);
                                }
                                // replace the template property with item property
                                // console.log(`\n---item---\n${JSON.stringify(item, null, 4)}\n---item---\n`)
                                // console.log(`\n---template---\n${JSON.stringify(template, null, 4)}\n---template---\n`)
                                MapsHelper.applyParametersMaps(template, item, nextHopMap.parametersMaps);
                                // console.log(`\n---nextHopMap.applyParametersMaps---\n${JSON.stringify(template, null, 4)}\n---nextHopMap.applyParametersMaps---\n`)
                            }
                            // add the parameters for subsequence execution...
                            param.nextHopParams.push(template);
                        });
                    });
                //   if (index === 0 && nextHopMap.notFoundMessage !== undefined) {
                //     message += nextHopMap.notFoundMessage
                //   }
            });
        }
    }
}
// private static plugins: Array<PluginBase> = new Array<PluginBase>();
// load system plugins
MapsHelper.plugins = [new IfExists(), new IfNotExists(), new IfTrue(), new IfFalse(), new IfEmpty()];

// https://devdojo.com/discoverlance/snippet/form-validation-with-class-validator-1
// ref: https://bkerr.dev/blog/declarative-validation-for-express-apis-with-class-validator-and-class-transformer/
const __filename$1 = url.fileURLToPath(
    typeof document === 'undefined'
        ? require('url').pathToFileURL(__filename).href
        : (_documentCurrentScript && _documentCurrentScript.src) || new URL('api-helper-v2-bundle.cjs', document.baseURI).href
);
path.dirname(__filename$1);
class DtoBase {
    static async validateData(input, groups) {
        try {
            groups.length > 0 ? await classValidator.validateOrReject(input, { groups: groups }) : await classValidator.validateOrReject(input);
            return { errorCode: 0, errors: [] };
        } catch (err) {
            const validationErrors = err;
            return { errorCode: 500, errors: this.getErrorMessage(validationErrors) };
        }
    }
    static getErrorMessage(errors, parentProprtyName = 'data') {
        return errors.map(({ property, constraints, children }) => {
            const validateExceptionData = [];
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
    async validate(groups = []) {
        const dtoError = await DtoBase.validateData(this, groups);
        // console.log(`validate:::\n${JSON.stringify(dtoError, null, 4)}`);
        if (dtoError.errorCode !== 0) throw new ValidationException(dtoError, 'Data validation errors');
        return true;
    }
    validateSync(groups = [], parentProprtyName = 'data') {
        const valError = groups.length > 0 ? classValidator.validateSync(this, { groups: groups }) : classValidator.validateSync(this);
        const dtoError = { errorCode: valError.length > 0 ? 500 : 0, errors: DtoBase.getErrorMessage(valError, parentProprtyName) };
        // console.log(`validateSync:::\n${JSON.stringify(dtoError, null, 4)}`);
        if (dtoError.errorCode !== 0) throw new ValidationException(dtoError, 'Data validation errors');
        return true;
    }
    static getFullPath(folderPath) {
        // always assume root path as {projectRoot}
        // convert relative path to absolute path (at process level)
        // for library install through npm/ssh/https
        return folderPath.startsWith('/') ? folderPath : `${process.cwd()}/${folderPath}`;
        // for library install as file link
        // return folderPath.startsWith('/') ? folderPath : `${this.getModuleFullPath(__dirname, process.cwd())}/${folderPath.replace('./', '')}`;
    }
    static getModuleFullPath(dirname, cwd) {
        const folderParts = dirname.replace(`${cwd}/`, '').split('/');
        // process path conatin node_modules folder, api-helper-v1 included as reference module
        if (folderParts[0] === 'node_modules') {
            return `${cwd}/node_modules/${folderParts[1]}`;
        } else {
            return cwd;
        }
    }
    static async file2Instance(fileName, validate = true, excludeExtraneousValues = true) {
        const fsFileName = this.getFullPath(fileName);
        if (fs.existsSync(fsFileName)) {
            const data = JSON.parse(fs.readFileSync(fsFileName, 'utf8'));
            // return await this.plain2Instance(cls, data, validate);
            return await this.plain2Instance(data, validate, excludeExtraneousValues);
        } else {
            throw new Error(`File not found '${fsFileName}'\nCurrent Folder '${process.cwd()}'`);
        }
    }
    static file2InstanceSync(fileName, validate = true, excludeExtraneousValues = true) {
        const fsFileName = this.getFullPath(fileName);
        if (fs.existsSync(fsFileName)) {
            const data = JSON.parse(fs.readFileSync(fsFileName, 'utf8'));
            // return await this.plain2Instance(cls, data, validate);
            return this.plain2InstanceSync(data, validate, excludeExtraneousValues);
        } else {
            throw new Error(`File not found '${fsFileName}'\nCurrent Folder '${process.cwd()}'`);
        }
    }
    static async file2Array(fileName, validate = true) {
        const fsFileName = this.getFullPath(fileName);
        if (fs.existsSync(fsFileName)) {
            const data = JSON.parse(fs.readFileSync(fsFileName, 'utf8'));
            return await this.plain2Instances(data, validate);
        } else {
            throw new Error(`File not found '${fsFileName}'\nCurrent Folder '${process.cwd()}'`);
        }
    }
    // https://stackoverflow.com/questions/34098023/typescript-self-referencing-return-type-for-static-methods-in-inheriting-classe
    static async plain2Instance(dto, validate = true, excludeExtraneousValues = true) {
        const dtoObject = classTransformer.plainToInstance(this, dto, { excludeExtraneousValues: excludeExtraneousValues });
        if (validate) {
            // const dtoError = await this.validateData(dtoObject as object, []);
            // if (dtoError.errorCode !== 0) throw new ValidationException(dtoError, 'Data validation errors');
            await dtoObject.validate();
        }
        return dtoObject;
    }
    static plain2InstanceSync(dto, validate = true, excludeExtraneousValues = true) {
        // set excludeExtraneousValues: false for test case only
        const dtoObject = classTransformer.plainToInstance(this, dto, { excludeExtraneousValues: excludeExtraneousValues });
        if (validate) {
            // const dtoError = await this.validateData(dtoObject as object, []);
            // if (dtoError.errorCode !== 0) throw new ValidationException(dtoError, 'Data validation errors');
            dtoObject.validateSync();
        }
        return dtoObject;
    }
    static async plain2Instances(dto, validate = true) {
        const dtoObject = classTransformer.plainToInstance(this, dto, { excludeExtraneousValues: true });
        // convert arry of dto to ArrayValidator with generic type
        const dtoArray = new ArrayValidator(dtoObject);
        if (validate) {
            // const dtoError = await this.validateData(dtoArray as object, []);
            // if (dtoError.errorCode !== 0) throw new ValidationException(dtoError, 'Data validation errors');
            await dtoArray.validate();
        }
        return dtoArray;
    }
}

var __decorate =
    (undefined && undefined.__decorate) ||
    function (decorators, target, key, desc) {
        var c = arguments.length,
            r = c < 3 ? target : desc === null ? (desc = Object.getOwnPropertyDescriptor(target, key)) : desc,
            d;
        if (typeof Reflect === 'object' && typeof Reflect.decorate === 'function') r = Reflect.decorate(decorators, target, key, desc);
        else
            for (var i = decorators.length - 1; i >= 0; i--)
                if ((d = decorators[i])) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
var __metadata =
    (undefined && undefined.__metadata) ||
    function (k, v) {
        if (typeof Reflect === 'object' && typeof Reflect.metadata === 'function') return Reflect.metadata(k, v);
    };
class ApiParam extends DtoBase {
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
__decorate([classTransformer.Expose(), __metadata('design:type', Object)], ApiParam.prototype, 'description', void 0);
__decorate([classTransformer.Expose(), __metadata('design:type', Object)], ApiParam.prototype, 'debug', void 0);
__decorate([classTransformer.Expose(), __metadata('design:type', Object)], ApiParam.prototype, 'debugSession', void 0);
__decorate([classTransformer.Expose(), __metadata('design:type', Boolean)], ApiParam.prototype, 'skipExecute', void 0);
__decorate([classTransformer.Expose(), __metadata('design:type', String)], ApiParam.prototype, 'moduleName', void 0);
__decorate(
    [
        classTransformer.Expose(),
        // parameters?: object;
        __metadata('design:type', Object),
    ],
    ApiParam.prototype,
    'parameters',
    void 0
);
__decorate(
    [classTransformer.Expose(), classTransformer.Type(() => ApiParameter), __metadata('design:type', Array)],
    ApiParam.prototype,
    'moduleParameters',
    void 0
);
__decorate([classTransformer.Expose(), __metadata('design:type', String)], ApiParam.prototype, 'returnParameterName', void 0);
__decorate([classTransformer.Expose(), __metadata('design:type', String)], ApiParam.prototype, 'defaultMaps', void 0);
__decorate(
    [classTransformer.Expose(), classTransformer.Type(() => ApiParameter), __metadata('design:type', Object)],
    ApiParam.prototype,
    'parametersMaps',
    void 0
);
__decorate([classTransformer.Expose(), __metadata('design:type', Object)], ApiParam.prototype, 'url', void 0);
__decorate([classTransformer.Expose(), __metadata('design:type', Object)], ApiParam.prototype, 'httpMethod', void 0);
__decorate([classTransformer.Expose(), __metadata('design:type', Object)], ApiParam.prototype, 'httpHeaders', void 0);
__decorate([classTransformer.Expose(), __metadata('design:type', Object)], ApiParam.prototype, 'queryString', void 0);
__decorate([classTransformer.Expose(), __metadata('design:type', Object)], ApiParam.prototype, 'jsonData', void 0);
__decorate([classTransformer.Expose(), __metadata('design:type', Object)], ApiParam.prototype, 'multiPartData', void 0);
__decorate([classTransformer.Expose(), __metadata('design:type', Object)], ApiParam.prototype, 'textData', void 0);
__decorate([classTransformer.Expose(), __metadata('design:type', Object)], ApiParam.prototype, 'base64Data', void 0);
__decorate([classTransformer.Expose(), __metadata('design:type', Object)], ApiParam.prototype, 'formData', void 0);
__decorate([classTransformer.Expose(), __metadata('design:type', Object)], ApiParam.prototype, 'nextHopOnly', void 0);
__decorate(
    [classTransformer.Expose(), classTransformer.Type(() => ApiParam), __metadata('design:type', Array)],
    ApiParam.prototype,
    'nextHopParams',
    void 0
);
__decorate(
    [classTransformer.Expose(), classTransformer.Type(() => NexthopMap), __metadata('design:type', Array)],
    ApiParam.prototype,
    'nextHopMaps',
    void 0
);
__decorate(
    [classTransformer.Expose(), classTransformer.Type(() => SaveMap), __metadata('design:type', Array)],
    ApiParam.prototype,
    'saveMaps',
    void 0
);
__decorate([classTransformer.Expose(), __metadata('design:type', Array)], ApiParam.prototype, 'baseString', void 0);
__decorate([classTransformer.Expose(), __metadata('design:type', Array)], ApiParam.prototype, 'debugData', void 0);
__decorate([classTransformer.Expose(), __metadata('design:type', Object)], ApiParam.prototype, 'expected', void 0);
class ApiTag {
    constructor(parentTag) {
        this._logLabel = '';
        this.level = '';
        this.count = 1;
        if (parentTag !== undefined) {
            this.level = parentTag.tag();
            this._logLabel = parentTag.logLabel();
        } else {
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
        if (this.level === '') return this.count.toString();
        else return `${this.level}.${this.count.toString()}`;
    }
}
class AnyUnknown {}
class SessionDataBase extends AnyUnknown {
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
class ResponseParam {
    constructor(apiTag, description, sessionData, saveMaps, apiParam) {
        this.apiTag = apiTag.tag();
        this.description = description;
        this.sessionData = sessionData;
        this.apiParam = apiParam;
        // this.saveMaps = saveMaps
        this.apiResults = new Array();
    }
}
class ApiCommand extends DtoBase {
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
__decorate([classTransformer.Expose(), __metadata('design:type', Object)], ApiCommand.prototype, 'description', void 0);
__decorate(
    [classTransformer.Expose(), classTransformer.Type(() => SessionDataBase), __metadata('design:type', SessionDataBase)],
    ApiCommand.prototype,
    'sessionData',
    void 0
);
__decorate(
    [classTransformer.Expose(), classTransformer.Type(() => ApiParam), __metadata('design:type', Array)],
    ApiCommand.prototype,
    'apiParams',
    void 0
);
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
class ParametersMaps extends Array {}
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
class ApiParameter {
    constructor() {
        // export class ApiParameter extends ValidateDataBase {
        this.description = '';
        this.parameter = '';
        this.targetProperty = '';
        this.overwrite = false;
        this.ignoreWhenNotExist = false;
        // public validate() {
        //     // validating and check the errors, throw the errors if exist
        //     const errors = validateSync(this as object);
        //     if (errors.length > 0) {
        //         throw new TypeError(ValidationBase.formatErrorMessage(errors[0].target, ValidationBase.getErrorMessage(errors)));
        //     }
        // }
    }
}
__decorate([classTransformer.Expose(), classValidator.IsString(), __metadata('design:type', Object)], ApiParameter.prototype, 'parameter', void 0);
__decorate([classTransformer.Expose(), __metadata('design:type', Object)], ApiParameter.prototype, 'targetProperty', void 0);
__decorate([classTransformer.Expose(), __metadata('design:type', Object)], ApiParameter.prototype, 'overwrite', void 0);
__decorate([classTransformer.Expose(), __metadata('design:type', Object)], ApiParameter.prototype, 'ignoreWhenNotExist', void 0);
__decorate(
    [classTransformer.Expose(), classValidator.IsOptional(), classValidator.IsString(), __metadata('design:type', String)],
    ApiParameter.prototype,
    'data',
    void 0
);
__decorate(
    [classTransformer.Expose(), classValidator.IsOptional(), classValidator.IsBoolean(), __metadata('design:type', Boolean)],
    ApiParameter.prototype,
    'debug',
    void 0
);
class ApiParamBase {
    constructor(params) {
        this.showSessionData = false;
        this.showResults = false;
        this.showApiParam = false;
        this.debugList = [];
        this.skipList = [];
        this.debug = false;
        if (params === undefined) return;
        this.setParams(params);
    }
    setParams(params) {
        this.showSessionData = params.showSessionData;
        this.showResults = params.showResults;
        this.showApiParam = params.showApiParam;
        this.debug = params.debug;
        this.debugList = params.debugList;
        this.skipList = params.skipList;
    }
}

class ApiLibBase {
    constructor(cluster) {
        this.logLabel = Helper.randomString(6);
        this.cluster = '';
        if (cluster) this.cluster = cluster;
    }
    static addPlugin(plugin) {
        MapsHelper.addPlugin(plugin);
    }
    static addPropertyMask(name) {
        ApiLibBase.maskList.push(name);
    }
    static regexpEscape(s) {
        return s.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
    }
    static displayFolders() {
        console.log('apiLibBase');
        console.log(`__filename::: ${__filename}`);
        console.log(` __dirname::: ${__dirname}`);
        console.log(`   process::: ${process.cwd()}`);
    }
    logMessage(message) {
        console.log(`[${luxon.DateTime.local().toString()}] ${this.logLabel} - ${message}`);
    }
    invokeRequest(apiParam, apiTag, sessionData) {
        // if (apiParam.description === 'Create New API with uploded file' || apiParam.description === 'Create Agency.') {
        //     console.log(`\n---b4-invokeRequest---\n${JSON.stringify(apiParam, null, 4)}\n---b4-invokeRequest---\n`)
        // }
        return new Promise((resolve, reject) => {
            const responseParam = new ResponseParam(apiTag, apiParam.description, sessionData, apiParam.saveMaps, apiParam);
            try {
                // // TODO: require further review on the skipExecute usage
                // if (responseParam.skipExecute === undefined && sessionData.skipList !== undefined && sessionData.skipList.length > 0) {
                //     responseParam.skipExecute = sessionData.skipList.includes(responseParam.apiTag) ? true : false;
                // }
                // handle skipExecute and nextHopOnly only...
                // TODO: bug ::: skipExecute targetProperty cause skipList not to work...
                if (apiParam.parametersMaps !== undefined) {
                    MapsHelper.applyParametersMaps(
                        apiParam,
                        sessionData,
                        apiParam.parametersMaps.filter((item) => {
                            return item.targetProperty === 'skipExecute' || item.targetProperty === 'nextHopOnly' ? item : undefined;
                        })
                    );
                }
                // if (apiParam.description === 'Upload X.509 Certificate to API Service') {
                //     console.log(`\n---b4-applyParametersMaps---\n${JSON.stringify(apiParam, null, 4)}\n---b4-applyParametersMaps---\n`)
                // }
                // apiParm.skipExecute setting take precedent...
                if (apiParam.skipExecute !== undefined) {
                    responseParam.skipExecute = apiParam.skipExecute;
                }
                // command line skipList take precednet for skipExecute, elase based on json setting
                if (sessionData.skipList !== undefined && sessionData.skipList.length > 0) {
                    responseParam.skipExecute = sessionData.skipList.includes(responseParam.apiTag) ? true : responseParam.skipExecute;
                }
                if (apiParam.nextHopOnly !== undefined) {
                    responseParam.nextHopOnly = apiParam.nextHopOnly;
                }
                if (responseParam.skipExecute) {
                    this.logMessage(`Skip Execute API...${responseParam.apiTag} - ${responseParam.description}`);
                    // console.log(`\n---b4-applyParametersMaps---\n${JSON.stringify(apiParam, null, 4)}\n---b4-applyParametersMaps---\n`)
                    resolve(responseParam);
                } else {
                    if (apiParam.nextHopOnly) {
                        responseParam.skipExecute = true;
                        responseParam.nextHopOnly = true;
                        resolve(responseParam);
                    } else {
                        // propagate debug flag
                        if (sessionData.debug == true) responseParam.debug = true;
                        else if (sessionData.debugList !== undefined)
                            responseParam.debug = sessionData.debugList.includes(responseParam.apiTag) ? true : false;
                        else responseParam.debug = false;
                        // overwrite debug flag based on caller debugList
                        if (responseParam.debug) {
                            this.logMessage(` >>> API Debug Start ...${responseParam.apiTag} <<<`);
                            apiParam.debug = true;
                        }
                        MapsHelper.applyParametersMaps(apiParam, sessionData, apiParam.parametersMaps);
                        // update dscription after applyParametersMaps
                        responseParam.description = apiParam.description;
                        const targetURL = new URL(apiParam.url);
                        // construct query string
                        if (apiParam.queryString != undefined) {
                            targetURL.search =
                                qs__namespace.stringify(apiParam.queryString, undefined, undefined, {
                                    encodeURIComponent: encodeURIComponent,
                                }) + targetURL.search.replace('?', '&');
                        }
                        let req = request(apiParam.httpMethod, targetURL.href);
                        req.buffer(true);
                        if (apiParam.httpHeaders !== undefined) {
                            // iterate through properties of headers
                            for (const key in apiParam.httpHeaders) {
                                req = req.set(key, apiParam.httpHeaders[key]);
                            }
                        }
                        if (apiParam.httpMethod === 'POST' || apiParam.httpMethod === 'PUT') {
                            if (apiParam.jsonData !== undefined) {
                                if (apiParam.base64Data !== undefined) {
                                    const buff = fs.readFileSync(Helper.getFullPath(apiParam.base64Data.dataFileName));
                                    const base64data = buff.toString('base64');
                                    apiParam.jsonData[apiParam.base64Data.fieldName] = base64data;
                                }
                                const postData = JSON.stringify(apiParam.jsonData);
                                req = req.type('application/json').send(postData);
                            }
                            // handle multiPartData POST request
                            if (apiParam.multiPartData != undefined) {
                                if (apiParam.multiPartData.fields != undefined) {
                                    for (const key in apiParam.multiPartData.fields) {
                                        req = req.field(key, apiParam.multiPartData.fields[key]);
                                    }
                                }
                                if (apiParam.multiPartData.attachments != undefined) {
                                    // console.log(`multiPartData ${JSON.stringify(apiParam.multiPartData.attachments, null, 4)}`)
                                    for (const key in apiParam.multiPartData.attachments) {
                                        if (Array.isArray(apiParam.multiPartData.attachments[key])) {
                                            _.forEach(apiParam.multiPartData.attachments[key], function (paramValue) {
                                                // trigger error if file not found...
                                                // req.attach does not propagate error
                                                fs.readFileSync(Helper.getFullPath(paramValue));
                                                req = req.attach('files', Helper.getFullPath(paramValue));
                                            });
                                        } else {
                                            // trigger error if file not found...
                                            // req.attach does not propagate error
                                            fs.readFileSync(Helper.getFullPath(apiParam.multiPartData.attachments[key]));
                                            req = req.attach(key, Helper.getFullPath(apiParam.multiPartData.attachments[key]));
                                        }
                                    }
                                }
                                req = req.type('multipart/form-data');
                            }
                            if (apiParam.formData != undefined) {
                                const postData = qs__namespace.stringify(apiParam.formData, undefined, undefined, {
                                    encodeURIComponent: encodeURIComponent,
                                });
                                req = req
                                    .type('application/x-www-form-urlencoded')
                                    .set({ field: 'Content-Length', val: Buffer.byteLength(postData) })
                                    .send(postData);
                            }
                            if (apiParam.textData != undefined) {
                                let postData = apiParam.textData.data;
                                if (apiParam.textData.dataFileName != undefined) {
                                    postData = fs.readFileSync(Helper.getFullPath(apiParam.textData.dataFileName), 'utf8');
                                    // data mapping for dataFile
                                    // console.log(JSON.stringify(sessionData, null, 4));
                                    if (apiParam.textData.replaceMapper != undefined) {
                                        let jsonData = JSON.stringify(postData);
                                        for (const key in apiParam.textData.replaceMapper) {
                                            const replace = '{{' + ApiLibBase.regexpEscape(key) + '}}';
                                            const regex = new RegExp(replace, 'g');
                                            jsonData = jsonData.replace(
                                                regex,
                                                _.get({ apiParam: apiParam, sessionData: sessionData }, _.get(apiParam.textData.replaceMapper, key))
                                            );
                                        }
                                        postData = JSON.parse(jsonData);
                                    }
                                }
                                req = req.type(apiParam.textData.contentType).send(postData);
                            }
                        }
                        this.logMessage(`Invoke API...${responseParam.apiTag} - ${responseParam.description}`);
                        responseParam.startTime = luxon.DateTime.local();
                        if (responseParam.debug === true || apiParam.debug === true || sessionData.debug === true) {
                            ApiLibBase.displayResult(req, 'request');
                            if (sessionData.showApiParam) {
                                ApiLibBase.displayResult(apiParam, 'apiParam');
                            }
                            if (sessionData.showSessionData) {
                                ApiLibBase.displayResult(sessionData, 'pre api call sessionData');
                            }
                        }
                        // console.log(responseParam);
                        // do not redirect, not required for API interface
                        req.redirects(0)
                            .ok((res) => {
                                if (res.status < 400) {
                                    this.logMessage(`Successful...${responseParam.apiTag}`);
                                    responseParam.endTime = luxon.DateTime.local();
                                    if (responseParam.startTime)
                                        responseParam.elapsed = responseParam.endTime
                                            .diff(responseParam.startTime, ['minutes', 'seconds', 'milliseconds'])
                                            .toObject();
                                    responseParam.sessionData = sessionData;
                                    responseParam.httpStatus = res.status;
                                    // responseParam.response = res
                                    if (apiParam.parameters !== undefined) responseParam.parameters = apiParam.parameters;
                                    if (apiParam.baseString !== undefined) responseParam.baseString = apiParam.baseString;
                                    responseParam.responseHeaders = res.headers;
                                    if (!_.isEmpty(res.body)) {
                                        responseParam.responseBody = res.body;
                                    } else {
                                        responseParam.responseText = res.text;
                                    }
                                    if (responseParam.debug === true || apiParam.debug === true || sessionData.debug === true) {
                                        ApiLibBase.displayResult(res, 'response', ['text', 'req']);
                                        // ApiLibBase.displayResult(responseParam, 'responseParam');
                                    }
                                    resolve(responseParam);
                                    return true;
                                } else {
                                    return false;
                                }
                            })
                            .catch((err) => {
                                responseParam.endTime = luxon.DateTime.local();
                                this.logMessage(`API Failed...${responseParam.apiTag}`);
                                this.logMessage(`>>>>>> ${err.message} <<<<<<`);
                                ApiLibBase.displayResult(err, 'error object');
                                ApiLibBase.displayResult(apiParam, 'apiParam');
                                if (!_.isEmpty(err.response) && !_.isEmpty(err.response.body)) {
                                    console.log(err.response.body);
                                } else if (!_.isEmpty(err.response) && !_.isEmpty(err.response.text)) {
                                    console.log(err.response.text);
                                }
                                responseParam.httpStatus = err.status;
                                responseParam.error = err;
                                reject(responseParam);
                            })
                            .finally(() => {
                                if (responseParam.debug === true || sessionData.debug === true) {
                                    this.logMessage(` >>> API Debug End ...${responseParam.apiTag} <<<`);
                                }
                            });
                    }
                }
            } catch (err) {
                const error = err;
                responseParam.endTime = luxon.DateTime.local();
                this.logMessage(`API Failed...${responseParam.apiTag} - ${apiParam.description}`);
                this.logMessage(`\n---error object---\n${error}\n---error object---`);
                if (error.message === 'Data validation errors') {
                    const valError = error;
                    // valError.showMessage();
                    console.log(`---ValidationException---\n${JSON.stringify(valError.details, null, 4)}\n---ValidationException---`);
                }
                console.log();
                ApiLibBase.displayResult(apiParam, 'apiParam');
                responseParam.error = { name: 'Pre Execution Error', message: error.message };
                reject(responseParam);
            }
        });
    }
    async executeApiInternal(apiParams, apiResults, apiTag, sessionData) {
        let currentParam;
        // let nextParams: Array<ApiParam>;
        if (apiParams[0].moduleName !== undefined) {
            // load module
            currentParam = await ApiParam.file2Instance(apiParams[0].moduleName, true, false);
            // transfer module description to currentParam
            // console.log(`\n---module.description---\n${JSON.stringify(apiParams[0].description, null, 4)}\n---apiParams[0]---\n`)
            // console.log(`\n---currentParam.description---\n${JSON.stringify(currentParam.description, null, 4)}\n---apiParams[0]---\n`)
            if (apiParams[0].description !== undefined) {
                currentParam.description = apiParams[0].description;
            }
            // transfer module skipExecute to currentParam
            if (apiParams[0].skipExecute !== undefined) {
                currentParam.skipExecute = apiParams[0].skipExecute;
            }
            // transfer module nextHopParams to currentParam
            if (apiParams[0].nextHopMaps !== undefined) {
                if (currentParam.nextHopMaps !== undefined && currentParam.nextHopMaps.length > 0) {
                    // merge 2 array
                    currentParam.nextHopMaps = [...currentParam.nextHopMaps, ...apiParams[0].nextHopMaps];
                } else {
                    currentParam.nextHopMaps = apiParams[0].nextHopMaps;
                }
                // bring in the nextHopParam
                apiParams[0].nextHopMaps.forEach((item) => {
                    // currentParam[item.paramTemplateName] = apiParams[0][item.paramTemplateName]
                    // https://stackoverflow.com/questions/12710905/how-do-i-dynamically-assign-properties-to-an-object-in-typescript
                    // (currentParam as any)[item.paramTemplateName] = (apiParams[0] as any)[item.paramTemplateName];
                    _.set(currentParam, item.paramTemplateName, _.get(apiParams[0], item.paramTemplateName));
                });
                // console.log(`\n---currentParam---\n${JSON.stringify(currentParam, null, 4)}\n---currentParam---\n`)
            }
            if (apiParams[0].parameters !== undefined) {
                currentParam.parameters = apiParams[0].parameters;
            }
            if (apiParams[0].moduleParameters !== undefined) {
                // console.log(`\n---moduleParameters.sessionData---\n${JSON.stringify(sessionData, null, 4)}\n---sessionData---\n`)
                apiParams[0].moduleParameters.forEach((item) => {
                    // _.set(currentParam, item.targetProperty, _.get({ sessionData: sessionData, apiParam: currentParam }, item.parameter));
                    const targetProp = _.get(currentParam, item.targetProperty);
                    // match string with {{ and end with }}
                    if (typeof targetProp === 'string' && targetProp.match(/{{([^}]+)}}/)) {
                        const replacePattern = '{{' + item.parameter + '}}';
                        _.set(
                            currentParam,
                            item.targetProperty,
                            targetProp.replace(replacePattern, _.get({ sessionData: sessionData, apiParam: currentParam }, item.parameter))
                        );
                    } else {
                        _.set(currentParam, item.targetProperty, _.get({ sessionData: sessionData, apiParam: currentParam }, item.parameter));
                    }
                });
            }
            if (apiParams[0].returnParameterName !== undefined) {
                currentParam.returnParameterName = apiParams[0].returnParameterName;
            } else {
                currentParam.returnParameterName = 'returnParameter';
            }
            // console.log(`\n---currentParam---\n${JSON.stringify(currentParam, null, 4)}\n---currentParam---\n`)
        } else {
            // clone the apiParam for update
            currentParam = await ApiParam.plain2Instance(JSON.parse(JSON.stringify(apiParams[0])), true, false);
        }
        // transfer module parameter to currentParam
        if (apiParams[0].parameters !== undefined) {
            currentParam.parameters = apiParams[0].parameters;
        }
        const nextParams = apiParams.splice(1);
        // inject defaultMaps into parametersMaps
        if (currentParam.defaultMaps) {
            const defaultMaps = await ApiParam.file2Instance(currentParam.defaultMaps, true, false);
            currentParam.parametersMaps.push(...defaultMaps.parametersMaps);
        }
        // applyParametersMaps(currentParam, sessionData, currentParam.parametersMaps)
        // console.log(JSON.stringify(currentParam, null, 4))
        // console.log(`\n---currentParam---\n${JSON.stringify(currentParam, null, 4)}\n---currentParam---\n`)
        return this.invokeRequest(currentParam, apiTag, sessionData)
            .then((result) => {
                // console.log(`\n---invokeRequest-result---\n${JSON.stringify(result, null, 4)}\n---result---\n`)
                apiResults.push(result);
                if (!result.skipExecute) {
                    MapsHelper.applySaveMaps(result, sessionData, currentParam.saveMaps);
                    // clear sessionData to save memory
                    delete result.sessionData;
                    delete result.apiParam;
                    if (result.debug === true || currentParam.debug === true || sessionData.debug === true) {
                        if (sessionData.showResults) {
                            ApiLibBase.displayResult(result, 'responseParam');
                        }
                        if (sessionData.showSessionData === true) {
                            ApiLibBase.displayResult(sessionData, 'post api call sessionData');
                        }
                    }
                    MapsHelper.applyNextHopMaps(currentParam, sessionData);
                    // console.log(`\n---currentParam---\n${JSON.stringify(currentParam, null, 4)}\n---currentParam---\n`)
                    if (currentParam.nextHopParams !== undefined && currentParam.nextHopParams.length > 0) {
                        const nextApiTag = new ApiTag(apiTag);
                        result.apiResults = [];
                        return this.executeApiInternal(currentParam.nextHopParams, result.apiResults, nextApiTag, sessionData);
                    }
                } else if (result.skipExecute && result.nextHopOnly) {
                    // clear sessionData to save memory
                    delete result.sessionData;
                    delete result.apiParam;
                    MapsHelper.applyNextHopMaps(currentParam, sessionData);
                    // console.log(`\n---applyNextHopMaps---\n${JSON.stringify(currentParam, null, 4)}\n---applyNextHopMaps---\n`)
                    if (currentParam.nextHopParams !== undefined && currentParam.nextHopParams.length > 0) {
                        // console.log(`\n---nextHopParams---\n${JSON.stringify(currentParam.nextHopParams, null, 4)}\n---nextHopParams---\n`)
                        const nextApiTag = new ApiTag(apiTag);
                        result.apiResults = [];
                        return this.executeApiInternal(currentParam.nextHopParams, result.apiResults, nextApiTag, sessionData);
                    }
                }
                // clear sessionData to save memory
                delete result.sessionData;
                delete result.apiParam;
                return result;
            })
            .catch((result) => {
                this.logMessage('Failed...');
                if (result.httpStatus === undefined) {
                    result.httpStatus = 601;
                    // result.errorMessage = result.message || result.error;
                    // result.errorStack = result.stack
                    if (result.stack) console.log(result.stack);
                }
                // console.log(JSON.stringify(result, null, 4))
                apiResults.push(result);
                return result;
            })
            .finally(() => {
                // this.logMessage("Finally...");
                if (nextParams.length > 0) {
                    // console.log(nextParams)
                    apiTag.next();
                    return this.executeApiInternal(nextParams, apiResults, apiTag, sessionData);
                }
            });
    }
    async executeApi(apiCommand) {
        const apiTag = new ApiTag();
        this.logMessage(`Start Execute Apis - (${apiCommand.description})`);
        await this.executeApiInternal(apiCommand.apiParams, apiCommand.apiResults, apiTag, apiCommand.sessionData);
        this.logMessage(`Execute Apis Completed... - (${apiCommand.description})\n\n`);
        return apiCommand.apiResults;
    }
    // public static displayResult<T>(apiResults: Array<T>, tag: string) {
    static displayResult(apiResults, tag, props = []) {
        let dataArray = apiResults;
        if (!Array.isArray(dataArray)) {
            dataArray = [dataArray];
        }
        const propsList = [...ApiLibBase.maskList, ...props];
        console.log(`----${tag}----Start----`);
        dataArray.forEach((item) => {
            console.log(
                JSON.stringify(
                    item,
                    function (key, value) {
                        // if (RES.CONFIG.PROPERTY_EXCLUDED.includes(key)) return '***';
                        if (propsList.includes(key)) return '***';
                        else return value;
                    },
                    4
                )
            );
        });
        console.log(`----${tag}------End----`);
    }
    // protected async executeCommandV3(
    //     apiCommandFileName: string,
    //     callBackSessionData: (sessionData: SessionDataBase) => void
    // ): Promise<Array<ApiResponse>> {
    //     // load the apis commands file
    //     this.logMessage(`Load api command file: '${apiCommandFileName}'`);
    //     const apiCommand = await ApiCommand.getInstance(apiCommandFileName);
    //     if (this.configureSystemConfig) await this.configureSystemConfig(apiCommand.sessionData);
    //     // allow caller to update the sessionData before proceed...
    //     callBackSessionData(apiCommand.sessionData);
    //     // console.log(JSON.stringify(apiCommand, null, 4))
    //     // apiCommand.sessionData.skipList.push( "5" )
    //     const results = await this.executeApi(apiCommand);
    //     if (apiCommand.sessionData.showResults) {
    //         ApiLibBase.displayResult(apiCommand.apiResults, 'Results');
    //     }
    //     if (apiCommand.sessionData.showSessionData) {
    //         ApiLibBase.displayResult([apiCommand.sessionData], 'sessionData');
    //     }
    //     const apiResponses: Array<ApiResponse> = [{ sessionData: apiCommand.sessionData, results: results }];
    //     return apiResponses;
    // }
    async executeCommand(apiCommandFileName, inputParam, callBackSessionData) {
        // load the apis commands file
        this.logMessage(`Load api command file: '${apiCommandFileName}'`);
        const apiCommand = await ApiCommand.file2Instance(apiCommandFileName, true, false);
        if (this.configureSystemConfig) await this.configureSystemConfig(apiCommand.sessionData);
        // transfer the default flags from inputParam to sessionData
        apiCommand.sessionData.showSessionData = inputParam.showSessionData;
        apiCommand.sessionData.showResults = inputParam.showResults;
        apiCommand.sessionData.showApiParam = inputParam.showApiParam;
        apiCommand.sessionData.debug = inputParam.debug;
        apiCommand.sessionData.debugList = inputParam.debugList;
        apiCommand.sessionData.skipList = inputParam.skipList;
        // allow caller to update the sessionData before proceed...
        callBackSessionData(apiCommand.sessionData);
        const results = await this.executeApi(apiCommand);
        // if (apiCommand.sessionData.showResults) {
        //     ApiLibBase.displayResult(apiCommand.apiResults, 'Results');
        // }
        // if (apiCommand.sessionData.showSessionData) {
        //     ApiLibBase.displayResult([apiCommand.sessionData], 'sessionData');
        // }
        const apiResponses = [{ sessionData: apiCommand.sessionData, results: results }];
        return apiResponses;
    }
}
ApiLibBase.maskList = [];

exports.ApiLibBase = ApiLibBase;
exports.ApiParam = ApiParam;
exports.ApiParamBase = ApiParamBase;
exports.ApiParameter = ApiParameter;
exports.ArrayValidator = ArrayValidator;
exports.DtoBase = DtoBase;
exports.Helper = Helper;
exports.PluginBase = PluginBase;
exports.SessionDataBase = SessionDataBase;
exports.ValidationException = ValidationException;
