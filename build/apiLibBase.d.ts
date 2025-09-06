import { PluginBase } from './pluginBase.js';
import { SessionDataBase, ResponseParam, ApiResponse, ApiCommand, ApiParamBase } from './apiLibClass.js';
export declare abstract class ApiLibBase {
    protected logLabel: string;
    protected cluster: string;
    private static maskList;
    constructor(cluster?: string);
    static addPlugin(plugin: PluginBase): void;
    static addPropertyMask(name: string): void;
    protected static regexpEscape(s: string): string;
    static displayFolders(): void;
    protected logMessage(message: string): void;
    private invokeRequest;
    private executeApiInternal;
    executeApi(apiCommand: ApiCommand): Promise<Array<ResponseParam>>;
    static displayResult<T>(apiResults: T, tag: string, props?: Array<string>): void;
    protected configureSystemConfig?(sessionData: SessionDataBase): Promise<void>;
    protected executeCommand(apiCommandFileName: string, inputParam: ApiParamBase, callBackSessionData: (sessionData: SessionDataBase) => void): Promise<Array<ApiResponse>>;
}
//# sourceMappingURL=apiLibBase.d.ts.map