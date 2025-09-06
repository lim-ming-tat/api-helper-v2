import { MapsHelper as mapsHelpers, NexthopMap } from '../mapsHelper.js';
import { SessionData } from './sessionData.js';
import { ApiCommand, ApiParam } from '../apiLibClass.js';

// https://github.com/jest-community/jest-extended#tothrowwithmessagetype-message

// TestData data structure design for parametersMaps
// [
//      [ <test case description>, <test data>],
//      [ <test case description>, <test data>]
// ]
// required one input json file as input and each test case will be generated for each ietm of parametersMaps
// apiParam and sessionData will be clone for each test case

type TestData = { apiParam: ApiParam; sessionData: SessionData };
type TestCases = Array<Array<string | TestData>>;

function getTestCases(fileName: string, chunkSize = 1): TestCases {
    const testCases: TestCases = [];

    const { apiParams, sessionData } = ApiCommand.file2InstanceSync(fileName, false, false);

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
        const maps = apiParam.nextHopMaps;

        const paramMaps = splitToChunk<NexthopMap>(maps, chunkSize);

        paramMaps.forEach((item) => {
            // console.log(item.description);
            const newApiParam = JSON.parse(JSON.stringify(apiParam));
            newApiParam.nextHopMaps = item;

            testCases.push([
                apiParam.description ? apiParam.description : '',
                {
                    apiParam: newApiParam,
                    sessionData: JSON.parse(JSON.stringify(sessionData)),
                },
            ]);
        });
    });

    // console.log('testCases', JSON.stringify(testCases, null,4))
    return testCases;
}

describe('test nextHopMaps function', () => {
    describe('nextHopMaps test', () => {
        // test case required 2 parametersMaps per test
        const testCases = getTestCases('./src/test/data/nextHopMaps-basic.json', 1);
        // const apiTag = new ApiHelper.ApiTag();

        test.each(testCases)('%s', (name, testData) => {
            const data = testData as TestData;

            // prepare the test data
            mapsHelpers.applyParametersMaps(data.apiParam, data.sessionData, data.apiParam.parametersMaps);

            mapsHelpers.applyNextHopMaps(data.apiParam, data.sessionData);

            // console.log('apiParam', JSON.stringify(data.apiParam, null, 4));
            // console.log('nextHopParams', JSON.stringify(data.apiParam.nextHopParams, null, 4));

            // target property must be created
            expect(data.apiParam.nextHopParams).toHaveLength((data.apiParam.expected ?? { arrayLength: -1 }).arrayLength);
            expect(data.apiParam.nextHopParams).toMatchObject((data.apiParam.expected ?? { fields: [] }).fields);
        });
    });

    describe('nextHopMaps error', () => {
        // test case required 2 parametersMaps per test
        const testCases = getTestCases('./src/test/data/nextHopMaps-error.json');

        test.each(testCases)('%s', (name, testData) => {
            const data = testData as TestData;

            // prepare the test data
            mapsHelpers.applyParametersMaps(data.apiParam, data.sessionData, data.apiParam.parametersMaps);

            const functionUnderTest = () => {
                mapsHelpers.applyNextHopMaps(data.apiParam, data.sessionData);
            };

            try {
                functionUnderTest();

                // Fail test if above expression doesn't throw anything.
                expect(true).toBe(false);
            } catch (error) {
                // let msg = error.message.replace(/\n/g, '\\n').replace(/"/g, '\\"');
                // console.log(name, msg);
                // console.log(error);

                expect(data.apiParam.expected).toBeDefined();

                expect(error).toBeInstanceOf(TypeError);
                expect(error).toHaveProperty('message', data.apiParam.expected);
            }
        });
    });
});
