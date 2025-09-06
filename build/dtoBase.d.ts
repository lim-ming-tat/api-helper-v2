import { ArrayValidator } from './arrayValidator.js';
export declare class DtoBase {
    private static validateData;
    private static getErrorMessage;
    validate(groups?: Array<string>): Promise<boolean>;
    validateSync(groups?: Array<string>, parentProprtyName?: string): boolean;
    private static getFullPath;
    private static getModuleFullPath;
    static file2Instance<T extends typeof DtoBase>(this: T, fileName: string, validate?: boolean, excludeExtraneousValues?: boolean): Promise<InstanceType<T>>;
    static file2InstanceSync<T extends typeof DtoBase>(this: T, fileName: string, validate?: boolean, excludeExtraneousValues?: boolean): InstanceType<T>;
    static file2Array<T extends typeof DtoBase>(this: T, fileName: string, validate?: boolean): Promise<ArrayValidator<InstanceType<T>>>;
    static plain2Instance<T extends typeof DtoBase>(this: T, dto: object, validate?: boolean, excludeExtraneousValues?: boolean): Promise<InstanceType<T>>;
    static plain2InstanceSync<T extends typeof DtoBase>(this: T, dto: object, validate?: boolean, excludeExtraneousValues?: boolean): InstanceType<T>;
    protected static plain2Instances<T extends typeof DtoBase>(this: T, dto: object, validate?: boolean): Promise<ArrayValidator<InstanceType<T>>>;
}
//# sourceMappingURL=dtoBase.d.ts.map