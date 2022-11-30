import { Exclude, Expose } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';
import { DtoBase } from '../dtoBase.js';
import { ArrayValidator } from '../arrayValidator.js';
import { ValidationException } from '../validationException.js';


@Exclude()
class TestParam extends DtoBase {
    @Expose()
    @IsString()
    @IsNotEmpty({ groups: ['key'] })
    apiKey = '';

    @Expose()
    @IsString()
    @IsNotEmpty()
    keyFile = '';

    constructor(apiKey = '', keyFile = '') {
        super();

        this.apiKey = apiKey;
        this.keyFile = keyFile;
    }
}

describe('DtoBase error test', () => {
    const validationError = 'Data validation errors';
    const expectedError = {
        errorCode: 500,
        errors: [
            {
                'data.apiKey': ['apiKey should not be empty'],
            },
            {
                'data.keyFile': ['keyFile should not be empty'],
            },
        ],
    };
    const dtoBase = new TestParam();

    it('validate error', async () => {
        const sut = async () => {
            await dtoBase.validate();
        };

        sut().catch((e) => {
            expect(e).toBeInstanceOf(ValidationException);
            expect(e.message).toBe(validationError);

            expect(e.details).toStrictEqual(expectedError);
        });
    });

    it('validateSync error', () => {
        try {
            dtoBase.validateSync();
        } catch (err) {
            const e = err as ValidationException;
            expect(e).toBeInstanceOf(ValidationException);
            expect(e.message).toBe(validationError);

            expect(e.errorCode).toBe(expectedError.errorCode);
            expect(e.errors).toStrictEqual(expectedError.errors);

            expect(e.details).toStrictEqual(expectedError);
        }
    });

    const expectedError_groups = {
        errorCode: 500,
        errors: [
            {
                'data.apiKey': ['apiKey should not be empty'],
            },
        ],
    };

    it('validateSync group error', () => {
        try {
            dtoBase.validateSync(['key']);
        } catch (err) {
            const e = err as ValidationException;
            expect(e).toBeInstanceOf(ValidationException);
            expect(e.message).toBe(validationError);

            expect(e.details).toStrictEqual(expectedError_groups);
        }
    });
});

describe('DtoBase happy path', () => {
    const dtoBase = new TestParam('key', 'file');

    it('validate', async () => {
        const result = await dtoBase.validate();

        expect(result).toBeTruthy();
    });

    it('validateSync', () => {
        const result = dtoBase.validateSync();

        expect(result).toBeTruthy();
    });
});

describe('DtoBase', () => {
    it('dtoBase file2Instance to throw File not found', async () => {
        const fileName = './src/test/data/invalid.json';

        const sut = async () => {
            await TestParam.file2Instance(fileName);
        };

        expect(sut).rejects.toThrow(Error);
        expect(sut).rejects.toThrow(/^File not found .+/);
    });

    it('dtoBase file2Array to throw File not found', async () => {
        const fileName = './src/test/data/invalid.json';

        const sut = async () => {
            await TestParam.file2Array(fileName);
        };

        expect(sut).rejects.toThrow(Error);
        expect(sut).rejects.toThrow(/^File not found .+/);
    });

    it('dtoBase file2Instance return instance of derived type (TestParam)', async () => {
        const fileName = './src/test/data/testParam.json';

        const dto = await TestParam.file2Instance(fileName);

        expect(dto).toBeInstanceOf(TestParam);
    });

    it('dtoBase file2Array return instance of derived type (ArrayValidator<TestParam>)', async () => {
        const fileName = './src/test/data/testParams.json';

        const dto = await TestParam.file2Array(fileName);

        expect(dto).toBeInstanceOf(ArrayValidator<TestParam>);
        expect(dto).toHaveLength(2);
    });

    it('dtoBase plain2Instance return instance of derived type (TestParam)', async () => {
        const plain = {
            apiKey: 'apikey-value',
            keyFile: 'filename-value'
        };
        const dto = await TestParam.plain2Instance(plain);

        expect(dto).toBeInstanceOf(TestParam);
    });

    it('dtoBase plain2Instance throw data validatio errors', async () => {
        const plain = {
            apiKey: 'apikey-value',
            keyFile: undefined
        };

        const validationError = 'Data validation errors';
        const dve = {
            errorCode: 500,
            errors: [
              {
                'data.keyFile': [ 'keyFile should not be empty', 'keyFile must be a string' ]
              }
            ]
        };

        const sut = async () => {
            await TestParam.plain2Instance(plain);
        };

        expect(sut).rejects.toThrow(ValidationException);
        expect(sut).rejects.toThrow(validationError);

        // expect(sut).rejects.toMatch(dve);
        sut().catch(e => {
            // console.log(e.details)
            expect(JSON.stringify(e.details)).toBe(JSON.stringify(dve));
        });
    });
});