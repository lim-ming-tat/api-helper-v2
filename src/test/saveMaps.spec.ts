import { SessionData } from './sessionData.js';
import { ApiCommand, ApiParam, ApiTag, ResponseParam } from '../apiLibClass.js';
import { MapsHelper as mapsHelpers, SaveMap } from '../mapsHelper.js';

// https://github.com/jest-community/jest-extended#tothrowwithmessagetype-message

// TestData data structure design for parametersMaps
// [
//      [ <test case description>, <test data>],
//      [ <test case description>, <test data>]
// ]
// required one input json file as input and each test case will be generated for each ietm of parametersMaps
// apiParam and sessionData will be clone for each test case

type TestData = { apiParam: ApiParam; sessionData: SessionData; saveMaps: Array<SaveMap> };
type TestCases = Array<Array<string | TestData>>;

function getTestCases(fileName: string, chunkSize = 1): TestCases {
    const testCases: TestCases = [];

    const { apiParams, sessionData } = ApiCommand.getInstanceSync(fileName);

    // split array into multiple chunk with size
    function splitToChunk<T>(arr: T[], chunkSize: number): T[][] {
        const bulks: T[][] = [];
        for (let i = 0; i < Math.ceil(arr.length / chunkSize); i++) {
            bulks.push(arr.slice(i * chunkSize, (i + 1) * chunkSize));
        }
        return bulks;
    }

    // const apiParam = apiParams[0];
    apiParams.forEach((apiParam) => {
        const saveMaps = apiParam.saveMaps;

        const paramMaps = splitToChunk<SaveMap>(saveMaps, chunkSize);

        paramMaps.forEach((item) => {
            // console.log(item.description);
            testCases.push([
                item[0].description ? item[0].description : '',
                {
                    apiParam: JSON.parse(JSON.stringify(apiParam)),
                    sessionData: JSON.parse(JSON.stringify(sessionData)),
                    saveMaps: item,
                },
            ]);
        });
    });

    // console.log('testCases', JSON.stringify(testCases, null,4))
    return testCases;
}

describe('test saveMaps function', () => {
    describe('basic maps', () => {
        const testCases = getTestCases('./src/test/data/saveMaps-sessionData-init.json');
        const apiTag = new ApiTag();

        test.each(testCases)('%s', (name, testData) => {
            const data = testData as TestData;

            // make sure that the target property not define yet
            // when parameters is undefined set to undefined
            expect(data.sessionData.targetSessionVariable).toBeDefined();

            const responseParam = new ResponseParam(apiTag, data.apiParam.description, data.sessionData, data.saveMaps, data.apiParam);

            mapsHelpers.applySaveMaps(responseParam, data.sessionData, data.saveMaps);

            //This condition will always return 'false' since the types '"string" | "number" | "bigint" | "boolean" | "symbol" | "undefined" | "object" | "function"' and '"objectx"' have no overlap.
            switch (data.saveMaps[0].dataType) {
                case 'string':
                    expect(typeof data.sessionData.targetSessionVariable).toBe('string');
                    break;
                case 'number':
                    expect(typeof data.sessionData.targetSessionVariable).toBe('number');
                    break;
                case 'bigint':
                    expect(typeof data.sessionData.targetSessionVariable).toBe('bigint');
                    break;
                case 'booleanTrue':
                    expect(typeof data.sessionData.targetSessionVariable).toBe('boolean');
                    expect(data.sessionData.targetSessionVariable).toBeTruthy();
                    break;
                case 'booleanFalse':
                    expect(typeof data.sessionData.targetSessionVariable).toBe('boolean');
                    expect(data.sessionData.targetSessionVariable).toBeFalsy();
                    break;
                case 'undefined':
                    expect(data.sessionData.targetSessionVariable).toBeUndefined();
                    break;
                case 'object':
                    expect(data.sessionData.targetSessionVariable && typeof data.sessionData.targetSessionVariable === 'object').toBe(true);
                    break;
                case 'array':
                    expect(Array.isArray(data.sessionData.targetSessionVariable)).toBe(true);
                    break;
                default:
                    break;
            }
        });
    });

    describe('dataType error', () => {
        // test case required 2 parametersMaps per test
        const testCases = getTestCases('./src/test/data/saveMaps-sessionData-init-error.json', 2);
        const apiTag = new ApiTag();

        test.each(testCases)('%s', (name, testData) => {
            const data = testData as TestData;

            const functionUnderTest = () => {
                const responseParam = new ResponseParam(apiTag, data.apiParam.description, data.sessionData, data.saveMaps, data.apiParam);
                responseParam.responseBody = data.sessionData.responseBody;

                mapsHelpers.applySaveMaps(responseParam, data.sessionData, data.saveMaps);
            };

            try {
                functionUnderTest();

                // Fail test if above expression doesn't throw anything.
                expect(true).toBe(false);
            } catch (error) {
                // let msg = error.message.replace(/\n/g, '\\n').replace(/"/g, '\\"');
                // console.log(name, msg);

                expect(data.sessionData.expected).toBeDefined();

                expect(error).toBeInstanceOf(TypeError);
                expect(error).toHaveProperty('message', data.sessionData.expected);
            }
        });
    });

    describe('dataPath test', () => {
        // test case required 2 parametersMaps per test
        const testCases = getTestCases('./src/test/data/saveMaps-sessionData-dataPath.json', 2);
        const apiTag = new ApiTag();

        test.each(testCases)('%s', (name, testData) => {
            const data = testData as TestData;

            const responseParam = new ResponseParam(apiTag, data.apiParam.description, data.sessionData, data.saveMaps, data.apiParam);
            responseParam.responseBody = data.sessionData.responseBody;

            mapsHelpers.applySaveMaps(responseParam, data.sessionData, data.saveMaps);

            // console.log('sessionData', data.sessionData);

            // target property must be created
            expect(data.sessionData.selectedData).toHaveLength((data.sessionData.expected ?? { arrayLength: -1 }).arrayLength);
            expect(data.sessionData.selectedData).toMatchObject((data.sessionData.expected ?? { fields: [] }).fields);
        });
    });

    describe('target dataType test', () => {
        // test case required 2 parametersMaps per test
        const testCases = getTestCases('./src/test/data/saveMaps-sessionData-dataType.json', 3);
        const apiTag = new ApiTag();

        test.each(testCases)('%s', (name, testData) => {
            const data = testData as TestData;

            const responseParam = new ResponseParam(apiTag, data.apiParam.description, data.sessionData, data.saveMaps, data.apiParam);
            responseParam.responseBody = data.sessionData.responseBody;

            mapsHelpers.applySaveMaps(responseParam, data.sessionData, data.saveMaps);

            // console.log('sessionData', data.sessionData);

            // target property must be created
            // expect(data.sessionData.selectedData).toHaveLength(data.sessionData.expected.arrayLength);
            expect(data.sessionData.targetSessionVariable).toStrictEqual(data.sessionData.expected);
        });
    });
});
