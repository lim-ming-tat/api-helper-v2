var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Exclude, Expose } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';
import { ArrayValidator } from '../arrayValidator.js';
import { ValidationException } from '../validationException.js';
let TestParam = class TestParam {
    constructor(apiKey = '', keyFile = '') {
        this.apiKey = '';
        this.keyFile = '';
        this.apiKey = apiKey;
        this.keyFile = keyFile;
    }
};
__decorate([
    Expose(),
    IsString(),
    IsNotEmpty({ groups: ['key'] }),
    __metadata("design:type", Object)
], TestParam.prototype, "apiKey", void 0);
__decorate([
    Expose(),
    IsString(),
    IsNotEmpty(),
    __metadata("design:type", Object)
], TestParam.prototype, "keyFile", void 0);
TestParam = __decorate([
    Exclude(),
    __metadata("design:paramtypes", [Object, Object])
], TestParam);
describe('ArrayValidator', () => {
    const dtoArray_valid = [new TestParam('key1', 'file1'), new TestParam('key2', 'file2')];
    const arrValidator_valid = new ArrayValidator(dtoArray_valid);
    it('ArrayValidator - validate', async () => {
        const result = await arrValidator_valid.validate();
        expect(result).toBeTruthy();
    });
    it('ArrayValidator - validateSync', () => {
        const result = arrValidator_valid.validateSync();
        expect(result).toBeTruthy();
    });
    const validationError = 'Data validation errors';
    const expectedError = {
        errorCode: 500,
        errors: [
            {
                'data.array': [
                    {
                        'array.0': [
                            {
                                '0.apiKey': ['apiKey should not be empty'],
                            },
                            {
                                '0.keyFile': ['keyFile should not be empty'],
                            },
                        ],
                    },
                    {
                        'array.1': [
                            {
                                '1.apiKey': ['apiKey should not be empty'],
                            },
                            {
                                '1.keyFile': ['keyFile should not be empty'],
                            },
                        ],
                    },
                ],
            },
        ],
    };
    const dtoArray_invalid = [new TestParam(), new TestParam()];
    const arrValidator_invalid = new ArrayValidator(dtoArray_invalid);
    it('ArrayValidator - validate with error', async () => {
        const sut = async () => {
            await arrValidator_invalid.validate();
        };
        sut().catch((e) => {
            expect(e).toBeInstanceOf(ValidationException);
            expect(e.message).toBe(validationError);
            expect(e.details).toStrictEqual(expectedError);
        });
    });
    it('ArrayValidator - validateSync with error', () => {
        try {
            arrValidator_invalid.validateSync();
        }
        catch (err) {
            const e = err;
            expect(e).toBeInstanceOf(ValidationException);
            expect(e.message).toBe(validationError);
            expect(e.errorCode).toBe(expectedError.errorCode);
            expect(e.errors).toStrictEqual(expectedError.errors);
            expect(e.details).toStrictEqual(expectedError);
        }
    });
});
//# sourceMappingURL=arrayValidator.spec.js.map