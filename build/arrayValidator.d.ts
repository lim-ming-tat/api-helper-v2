export declare class ArrayValidator<T> extends Array<T> {
    private array;
    constructor(inputArray: Array<T>);
    validate(): Promise<boolean>;
    validateSync(): boolean;
    private static validateData;
    private static getErrorMessage;
}
//# sourceMappingURL=arrayValidator.d.ts.map