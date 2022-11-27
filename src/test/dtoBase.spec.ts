import { Exclude, Expose } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';
import { DtoBase } from '../dtoBase.js';
import { ArrayValidator } from '../arrayValidator.js';
import { ValidationException } from '../validationException.js'


@Exclude()
export class TestParam extends DtoBase {
    @Expose()
    @IsString()
    @IsNotEmpty()
    apiKey: string = '';

    @Expose()
    @IsString()
    @IsNotEmpty()
    keyFile: string = '';
}


describe('DtoBase', () => {
    it('dtoBase file2Instance return instance of derived type (TestParam)', async () => {
        const fileName = './src/test/data/testParam.json';

        const dto = await TestParam.file2Instance(fileName);

        expect(dto).toBeInstanceOf(TestParam);
    });

    it('dtoBase file2Array return instance of derived type (ArrayValidator<TestParam>)', async () => {
        const fileName = './src/test/data/testParams.json';

        const dto = await TestParam.file2Array(fileName);

        expect(dto).toBeInstanceOf(ArrayValidator<TestParam>);
        expect(dto).toHaveLength(2)
    });

    it('dtoBase plain2Instance return instance of derived type (TestParam)', async () => {
        const plain = {
            apiKey: 'apikey-value',
            keyFile: 'filename-value'
        }
        const dto = await TestParam.plain2Instance(plain);

        expect(dto).toBeInstanceOf(TestParam);
    });

    it('dtoBase plain2Instance throw data validatio errors', async () => {
        const plain = {
            apiKey: 'apikey-value',
            keyFile: undefined
        }

        const validationError = 'Data validation errors';
        const dve = {
            errorCode: 500,
            errors: [
              {
                'sourceData.keyFile': [ 'keyFile should not be empty', 'keyFile must be a string' ]
              }
            ]
        }

        const sut = async () => {
            await TestParam.plain2Instance(plain);
        };

        expect(sut).rejects.toThrow(ValidationException);
        expect(sut).rejects.toThrow(validationError);

        // expect(sut).rejects.toMatch(dve);
        sut().catch(e => {
            // console.log(e.details)
            expect(JSON.stringify(e.details)).toBe(JSON.stringify(dve))
        })
    });
});