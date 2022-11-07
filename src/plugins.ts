import _ from 'lodash';
import { ApiParameter } from './apiLibClass';
import { PluginBase, DataSource } from './pluginBase';

export class IfExists extends PluginBase {
    constructor() {
        super('IfExists', 'ifExists');
    }

    public execute(item: ApiParameter, dataSource: DataSource, parameter: string): boolean {
        const paramData = parameter.split(':');
        const dataValue = _.get(dataSource, paramData[1]);

        const newValue = dataValue !== undefined ? (paramData[2].toLocaleLowerCase() === 'true' ? true : false) : paramData[2].toLocaleLowerCase() === 'true' ? false : true;

        if (item.debug) {
            IfExists.addDebugData(dataSource, { parameter: parameter, result: newValue });
        }

        return newValue;
    }
}

export class IfNotExists extends PluginBase {
    constructor() {
        super('IfNotExists', 'ifNotExists');
    }

    public execute(item: ApiParameter, dataSource: DataSource, parameter: string): boolean {
        const paramData = parameter.split(':');
        const dataValue = _.get(dataSource, paramData[1]);

        const newValue = dataValue === undefined ? (paramData[2].toLocaleLowerCase() === 'true' ? true : false) : paramData[2].toLocaleLowerCase() === 'true' ? false : true;

        return newValue;
    }
}

export class IfTrue extends PluginBase {
    constructor() {
        super('IfTrue', 'ifTrue');
    }

    public execute(item: ApiParameter, dataSource: DataSource, parameter: string): boolean {
        const paramData = parameter.split(':');
        const dataValue = _.get(dataSource, paramData[1]);

        // make sure that the input variable must be boolean
        if (typeof dataValue !== 'boolean') {
            throw new TypeError(IfTrue.formatErrorMessage(item, 'if operand must be a boolean value', 'parameter'));
        }

        const newValue = dataValue === true ? (paramData[2].toLocaleLowerCase() === 'true' ? true : false) : paramData[2].toLocaleLowerCase() === 'true' ? false : true;

        return newValue;
    }
}

export class IfFalse extends PluginBase {
    constructor() {
        super('IfFalse', 'ifFalse');
    }

    public execute(item: ApiParameter, dataSource: DataSource, parameter: string): boolean {
        const paramData = parameter.split(':');
        const dataValue = _.get(dataSource, paramData[1]);

        // make sure that the input variable must be boolean
        if (typeof dataValue !== 'boolean') {
            throw new TypeError(IfFalse.formatErrorMessage(item, 'if operand must be a boolean value', 'parameter'));
        }

        const newValue = dataValue === false ? (paramData[2].toLocaleLowerCase() === 'true' ? true : false) : paramData[2].toLocaleLowerCase() === 'true' ? false : true;

        return newValue;
    }
}

export class IfEmpty extends PluginBase {
    constructor() {
        super('IfEmpty', 'ifEmpty');
    }

    public execute(item: ApiParameter, dataSource: DataSource, parameter: string): boolean {
        const paramData = parameter.split(':');
        const dataValue = _.get(dataSource, paramData[1]);

        // make sure that the input variable must be string
        if (typeof dataValue !== 'string') {
            throw new TypeError(IfEmpty.formatErrorMessage(item, 'if operand must be a string', 'parameter'));
        }

        const newValue = dataValue === '' ? (paramData[2].toLocaleLowerCase() === 'true' ? true : false) : paramData[2].toLocaleLowerCase() === 'true' ? false : true;

        return newValue;
    }
}
