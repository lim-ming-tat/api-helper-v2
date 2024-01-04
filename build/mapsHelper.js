var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import _ from 'lodash';
// import { orderBy as sortData } from 'lodash';
import pkg from 'lodash';
const { orderBy: sortData } = pkg;
import { Type, Expose } from 'class-transformer';
import 'reflect-metadata';
import { ApiParameter, ParametersMaps } from './apiLibClass.js';
import { ArrayValidator } from './arrayValidator.js';
import { Helper as helper } from './helper.js';
import { IfExists, IfNotExists, IfTrue, IfFalse, IfEmpty } from './plugins.js';
export class SaveMap {
}
__decorate([
    Expose(),
    __metadata("design:type", String)
], SaveMap.prototype, "description", void 0);
__decorate([
    Expose(),
    __metadata("design:type", Boolean)
], SaveMap.prototype, "skip", void 0);
__decorate([
    Expose(),
    __metadata("design:type", String)
], SaveMap.prototype, "dataPath", void 0);
__decorate([
    Expose(),
    __metadata("design:type", String)
], SaveMap.prototype, "sessionName", void 0);
__decorate([
    Expose(),
    __metadata("design:type", Array)
], SaveMap.prototype, "properties", void 0);
__decorate([
    Expose(),
    __metadata("design:type", Boolean)
], SaveMap.prototype, "ignoreWhenNotExist", void 0);
__decorate([
    Expose(),
    __metadata("design:type", String)
], SaveMap.prototype, "match", void 0);
__decorate([
    Expose(),
    __metadata("design:type", String)
], SaveMap.prototype, "propertyName", void 0);
__decorate([
    Expose(),
    __metadata("design:type", String)
], SaveMap.prototype, "dataType", void 0);
__decorate([
    Expose(),
    __metadata("design:type", Object)
], SaveMap.prototype, "dataValue", void 0);
__decorate([
    Expose(),
    __metadata("design:type", String)
], SaveMap.prototype, "objectPropertyName", void 0);
__decorate([
    Expose(),
    __metadata("design:type", Object)
], SaveMap.prototype, "dataFilter", void 0);
export class NexthopMap {
    constructor() {
        this.paramTemplateName = '';
        this.dataPath = '';
        this.parametersMaps = new ParametersMaps();
        // parametersMaps: Array<ApiParameter> = new Array<ApiParameter>();
    }
}
__decorate([
    Expose(),
    __metadata("design:type", String)
], NexthopMap.prototype, "description", void 0);
__decorate([
    Expose(),
    __metadata("design:type", Object)
], NexthopMap.prototype, "paramTemplateName", void 0);
__decorate([
    Expose(),
    __metadata("design:type", Object)
], NexthopMap.prototype, "dataPath", void 0);
__decorate([
    Expose(),
    __metadata("design:type", Object)
], NexthopMap.prototype, "dataFilter", void 0);
__decorate([
    Expose(),
    __metadata("design:type", Object)
], NexthopMap.prototype, "sortOrder", void 0);
__decorate([
    Expose(),
    Type(() => ApiParameter),
    __metadata("design:type", Object)
], NexthopMap.prototype, "parametersMaps", void 0);
const CONDITION_AND = 'and';
const CONDITION_OR = 'or';
// set to true so that the expected error message will be shown on console
// useful during test case creation
// const IS_CREATE_TEST = true;
// const IS_CREATE_TEST = false;
export class MapsHelper {
    static addPlugin(plugin) {
        // console.log(`addPlugin::: >>>>>>>> ${plugin.name} <<<<<<<<`)
        const pluginAny = MapsHelper.plugins.filter((item) => {
            return item.name === plugin.name;
        });
        // console.log(`addPlugin found::: >>>>>>>> ${pluginAny.length} <<<<<<<<`)
        if (pluginAny.length > 0) {
            throw new TypeError(`System Error. Plugin (${plugin.name}) already added.`);
        }
        else {
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
            }
            else {
                // console.log(JSON.stringify(dataFilter.propertyName, null, 4))
                // console.log(JSON.stringify(dataSource, null, 4))
                if (dataFilter.propertyName === '.')
                    rightOperand = dataSource;
                else
                    rightOperand = _.get(dataSource, dataFilter.propertyName);
                // missing the required property
                if (rightOperand === undefined) {
                    // throw new PropertyUndefinedError(dataFilter.propertyName, dataSource, dataFilter);
                    throw new TypeError(this.formatErrorMessage(dataFilter, '.propertyName is missing/undefined', 'propertyName'));
                }
            }
            let replace = '';
            if (dataFilter.startsWith !== undefined) {
                replace = '^' + helper.regexpEscape(dataFilter.startsWith);
            }
            else {
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
            }
            else {
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
                }
                else {
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
            }
            else {
                if (dataFilter.equal.propertyName !== undefined) {
                    rightOperand = _.get(dataSource, dataFilter.equal.propertyName);
                    // missing the required property
                    if (rightOperand === undefined) {
                        // throw new PropertyUndefinedError(dataFilter.equal.propertyName, dataSource, dataFilter);
                        throw new TypeError(this.formatErrorMessage(dataFilter, '.equal.propertyName is missing/undefined', 'propertyName'));
                    }
                }
                else if (dataFilter.equal.dataValue !== undefined) {
                    rightOperand = dataFilter.equal.dataValue;
                }
                else if (rightOperand === undefined) {
                    // throw new PropertyUndefinedError(['dataFilter.equal.propertyName', 'dataFilter.equal.dataValue'].toString(), dataSource, dataFilter);
                    throw new TypeError(this.formatErrorMessage(dataFilter, '.equal.propertyName and .equal.dataValue is missing/undefined', 'propertyName|dataValue'));
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
            }
            else {
                if (dataFilter.notEqual.propertyName !== undefined) {
                    rightOperand = _.get(dataSource, dataFilter.notEqual.propertyName);
                    // missing the required property
                    if (rightOperand === undefined) {
                        // throw new PropertyUndefinedError(dataFilter.notEqual.propertyName, dataSource, dataFilter);
                        throw new TypeError(this.formatErrorMessage(dataFilter, '.notEqual.propertyName is missing/undefined', 'propertyName'));
                    }
                }
                else if (dataFilter.notEqual.dataValue !== undefined) {
                    rightOperand = dataFilter.notEqual.dataValue;
                }
                else if (rightOperand === undefined) {
                    // throw new PropertyUndefinedError(['dataFilter.notEqual.propertyName', 'dataFilter.notEqual.dataValue'].toString(), dataSource, dataFilter);
                    throw new TypeError(this.formatErrorMessage(dataFilter, '.notEqual.propertyName and .notEqual.dataValue is missing/undefined', 'propertyName|dataValue'));
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
            }
            else {
                if (dataFilter.greaterThan.propertyName !== undefined) {
                    rightOperand = _.get(dataSource, dataFilter.greaterThan.propertyName);
                    // missing the required property
                    if (rightOperand === undefined) {
                        // throw new PropertyUndefinedError(dataFilter.greaterThan.propertyName, dataSource, dataSource);
                        throw new TypeError(this.formatErrorMessage(dataFilter, '.greaterThan.propertyName is missing/undefined', 'propertyName'));
                    }
                }
                else if (dataFilter.greaterThan.dataValue !== undefined) {
                    rightOperand = dataFilter.greaterThan.dataValue;
                }
                else if (rightOperand === undefined) {
                    // throw new PropertyUndefinedError(['dataFilter.greaterThan.propertyName', 'dataFilter.greaterThan.dataValue'].toString(), dataSource, dataFilter);
                    throw new TypeError(this.formatErrorMessage(dataFilter, '.greaterThan.propertyName and .greaterThan.dataValue is missing/undefined', 'propertyName|dataValue'));
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
        if (dataFilter !== undefined)
            return MapsHelper.filterDataV2(item, dataFilter) ? item : null;
        else
            return true;
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
                        }
                        else {
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
                                        if (propertyMap.propertyName.startsWith('sessionData.') ||
                                            propertyMap.propertyName.startsWith('apiParam.')) {
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
                                        }
                                        else {
                                            // source data from current item
                                            dataObject[propertyMap.objectPropertyName] = _.get(item, propertyMap.propertyName);
                                        }
                                    }
                                    else {
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
                                            dataObject[propertyMap.objectPropertyName] = _.get(selectedData, propertyMap.dataFilter.objectPropertyName);
                                        }
                                        else {
                                            dataObject[propertyMap.objectPropertyName] = selectedData;
                                        }
                                    }
                                });
                            }
                            else {
                                dataObject = _.cloneDeep(item);
                            }
                            // console.log(dataObject)
                            index++;
                            sourceData.push(dataObject);
                        });
                    }
                    else {
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
                            }
                            else if (saveMap.dataType !== undefined && saveMap.dataType === 'number') {
                                _.set(sessionData, saveMap.sessionName ? saveMap.sessionName : '', 0);
                            }
                            else if (saveMap.dataType !== undefined && saveMap.dataType === 'bigint') {
                                _.set(sessionData, saveMap.sessionName ? saveMap.sessionName : '', BigInt(0));
                            }
                            else if (saveMap.dataType !== undefined && saveMap.dataType === 'booleanTrue') {
                                _.set(sessionData, saveMap.sessionName ? saveMap.sessionName : '', true);
                            }
                            else if (saveMap.dataType !== undefined && saveMap.dataType === 'booleanFalse') {
                                _.set(sessionData, saveMap.sessionName ? saveMap.sessionName : '', false);
                            }
                            else if (saveMap.dataType !== undefined && saveMap.dataType === 'undefined') {
                                _.set(sessionData, saveMap.sessionName ? saveMap.sessionName : '', undefined);
                            }
                            else if (saveMap.dataType !== undefined && saveMap.dataType === 'object') {
                                _.set(sessionData, saveMap.sessionName ? saveMap.sessionName : '', {});
                            }
                            else if (saveMap.dataType !== undefined && saveMap.dataType === 'array') {
                                _.set(sessionData, saveMap.sessionName ? saveMap.sessionName : '', []);
                            }
                            else if (saveMap.dataType === undefined) {
                                // TODO: propertyName must be defined
                                _.set(sessionData, saveMap.sessionName ? saveMap.sessionName : '', '');
                            }
                            else {
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
                            }
                            else if (saveMap.dataType !== undefined && saveMap.dataType === 'object') {
                                if (saveMap.objectPropertyName === undefined) {
                                    // throw new PropertyUndefinedError('objectPropertyName', saveMap, saveMap);
                                    throw new TypeError(this.formatErrorMessage(saveMap, 'required .objectPropertyName is missing', 'saveMap'));
                                }
                                _.set(sourceData, saveMap.objectPropertyName, _.get(param, saveMap.propertyName));
                            }
                            else {
                                // console.log(JSON.stringify(saveMap, null, 4))
                                // console.log(JSON.stringify(param.sessionData, null, 4))
                                // console.log(`setValue:::${saveMap.propertyName}`)
                                if (_.get(param, saveMap.propertyName) === undefined) {
                                    // console.log(`ignoreWhenNotExist:::${saveMap.ignoreWhenNotExist}--${JSON.stringify(saveMap, null, 4)}`)
                                    // ignoreWhenNotExist is to handle responseBody that is return as '[]' string
                                    // used in api-deletePolicies
                                    // if (!saveMap.ignoreWhenNotExist) throw new PropertyUndefinedError(saveMap.propertyName, param, saveMap);
                                    if (!saveMap.ignoreWhenNotExist)
                                        throw new TypeError(this.formatErrorMessage(saveMap, '.ignoreWhenNotExist set to false and property not found', 'saveMap'));
                                }
                                else {
                                    let newValue = _.get(param, saveMap.propertyName);
                                    if (saveMap.match !== undefined) {
                                        newValue = newValue.toString().match(saveMap.match);
                                    }
                                    // _.set(param.sessionData, saveMap.sessionName ? saveMap.sessionName : '', _.get(param, saveMap.propertyName))
                                    _.set(sessionData, saveMap.sessionName ? saveMap.sessionName : '', newValue);
                                    // console.log(JSON.stringify(param.sessionData, null, 4))
                                }
                            }
                        }
                        else if (saveMap.dataValue !== undefined) {
                            // sourceData = saveMap.dataValue
                            if (saveMap.dataType === 'array') {
                                // sourceData.push(saveMap.dataValue);
                                sourceData.push(saveMap.dataValue);
                            }
                            else if (saveMap.dataType === 'object') {
                                if (saveMap.objectPropertyName === undefined) {
                                    // throw new PropertyUndefinedError('objectPropertyName', saveMap, saveMap);
                                    throw new TypeError(this.formatErrorMessage(saveMap, 'required .objectPropertyName is missing', 'saveMap'));
                                }
                                _.set(sourceData, saveMap.objectPropertyName, saveMap.dataValue);
                            }
                            else {
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
            if (Array.isArray(item.targetProperty))
                targetList = item.targetProperty;
            else
                targetList = [item.targetProperty];
            // default parameter replace mapper
            let replace = '{{' + helper.regexpEscape(item.parameter) + '}}';
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
                    if (dataSource.sessionData.debug || item.debug)
                        console.log(`execute plugin::: >>>>>>>> ${commandKeyword} <<<<<<<<`);
                    replace = item.parameter;
                    newValue = plugins[0].execute(item, dataSource, parameter);
                    if (dataSource.sessionData.debug || item.debug)
                        console.log(`>>>>>>>> ${parameter}\n${newValue}\n<<<<<<<<`);
                }
                else {
                    throw new TypeError(this.formatErrorMessage(item, 'command not supported', 'parameter'));
                }
                ////TODO: shlould throw error here...
                if (newValue === '') {
                    throw new TypeError(this.formatErrorMessage(item, 'parameter source is missing/undefined', 'parameter'));
                    // throw new TypeError(this.formatErrorMessage({ item: item, dataSource: dataSource }, 'parameter source is missing/undefined', 'parameter'));
                }
                // console.log(`commandKeyword replace:::${replace}`)
            }
            else {
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
                throw new TypeError(this.formatErrorMessage(item, 'parameter source is missing/undefined', 'parameter'));
                // throw new TypeError(this.formatErrorMessage({ item: item, dataSource: dataSource }, 'parameter source is missing/undefined', 'parameter'));
            }
            targetList.forEach((listItem) => {
                // resolved target propety name with support for variable injection
                const targetProperty = this.updatePropertyV2(listItem, apiParam, sessionData);
                if (typeof _.get(apiParam, targetProperty) === 'string') {
                    // replace = '{{' + item.parameter + '}}'
                    const regex = new RegExp(helper.regexpEscape(replace), 'g');
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
                else {
                    // TODO: currently, non-string target will be overwritten
                    // need to handle, object type target like a = { ...a, ...newValue } ???
                    _.set(apiParam, targetProperty, newValue);
                }
            });
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
    static updatePropertyV2(sourcePropertyName, apiParam, 
    // sessionData: SessionDataBase | object
    sessionData) {
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
            if (outputMap.sortOrder.orderBy === 'asc' || outputMap.sortOrder.orderBy === 'desc')
                orderBy = outputMap.sortOrder.orderBy;
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
                }
                else {
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
                    }
                    else {
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
//# sourceMappingURL=mapsHelper.js.map