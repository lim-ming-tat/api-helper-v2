import { Exclude, Expose } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';
import { ArrayValidator } from '../arrayValidator.js';
import { ValidationException } from '../validationException.js';

@Exclude()
class TestParam {
    @Expose()
    @IsString()
    @IsNotEmpty({ groups: ['key'] })
    apiKey: string = '';

    @Expose()
    @IsString()
    @IsNotEmpty()
    keyFile: string = '';

    constructor(apiKey: string = '', keyFile: string = '') {
        this.apiKey = apiKey;
        this.keyFile = keyFile;
    }
}

describe('ArrayValidator', () => {
    const dtoArray_valid: TestParam[] = [new TestParam('key1', 'file1'), new TestParam('key2', 'file2')];
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

    const dtoArray_invalid: TestParam[] = [new TestParam(), new TestParam()];
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
        } catch (err) {
            const e = err as ValidationException;
            expect(e).toBeInstanceOf(ValidationException);
            expect(e.message).toBe(validationError);

            expect(e.errorCode).toBe(expectedError.errorCode);
            expect(e.errors).toStrictEqual(expectedError.errors);

            expect(e.details).toStrictEqual(expectedError);
        }
    });
});
