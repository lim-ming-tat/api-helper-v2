import { ApiParameter } from './apiLibClass.js';
import { PluginBase, DataSource } from './pluginBase.js';
export declare class IfExists extends PluginBase {
    constructor();
    execute(item: ApiParameter, dataSource: DataSource, parameter: string): boolean;
}
export declare class IfNotExists extends PluginBase {
    constructor();
    execute(item: ApiParameter, dataSource: DataSource, parameter: string): boolean;
}
export declare class IfTrue extends PluginBase {
    constructor();
    execute(item: ApiParameter, dataSource: DataSource, parameter: string): boolean;
}
export declare class IfFalse extends PluginBase {
    constructor();
    execute(item: ApiParameter, dataSource: DataSource, parameter: string): boolean;
}
export declare class IfEmpty extends PluginBase {
    constructor();
    execute(item: ApiParameter, dataSource: DataSource, parameter: string): boolean;
}
//# sourceMappingURL=plugins.d.ts.map