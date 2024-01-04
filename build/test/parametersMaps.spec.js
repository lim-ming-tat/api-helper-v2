import { ApiCommand } from '../apiLibClass.js';
import { Helper as helper } from '../helper.js';
import { MapsHelper } from '../mapsHelper.js';
function getTestCases(fileName, chunkSize = 1) {
    const testCases = [];
    const { apiParams, sessionData } = ApiCommand.file2InstanceSync(fileName, false, false);
    // split array into multiple chunk with size
    function splitToChunk(arr, chunkSize) {
        const bulks = [];
        for (let i = 0; i < Math.ceil(arr.length / chunkSize); i++) {
            bulks.push(arr.slice(i * chunkSize, (i + 1) * chunkSize));
        }
        return bulks;
    }
    // const apiParam = apiParams[0];
    apiParams.forEach((apiParam) => {
        const parametersMaps = apiParam.parametersMaps;
        const paramMaps = splitToChunk(parametersMaps, chunkSize);
        // const paramMaps = splitToChunk<ParametersMaps>(parametersMaps, chunkSize);
        // console.log(splitToChunk<ApiParameter>(parametersMaps, 1));
        paramMaps.forEach((item) => {
            const newApiParam = JSON.parse(JSON.stringify(apiParam));
            newApiParam.parametersMaps = item;
            // console.log(item.description);
            testCases.push([
                item[0].description ? item[0].description : '',
                {
                    apiParam: newApiParam,
                    sessionData: JSON.parse(JSON.stringify(sessionData)),
                    parametersMaps: item,
                },
            ]);
        });
    });
    // console.log('testCases', JSON.stringify(testCases, null,4))
    return testCases;
}
describe('test parametersMaps function', () => {
    beforeAll(() => {
        // MapsHelper.addPlugin(new ApexAuth());
        // MapsHelper.addPlugin(new ApexJwt());
        // MapsHelper.addPlugin(new BasicAuth());
        // MapsHelper.addPlugin(new RandomString());
    });
    // describe("simple maps", () => {
    //     const testCases = getTestCases('./src/test/data/parametersMaps-basic.json')
    //     testCases.forEach(testCase => {
    //         const desc = testCase[0] as string
    //         const data = testCase[1] as TestData
    //         test(desc, async () => {
    //             // make sure that the target property not define yet
    //             expect(data.apiParam.parameters!.sessionName).toBeUndefined()
    //             MapsHelper.applyParametersMaps(data.apiParam, data.sessionData, data.parametersMaps);
    //             // target property must be created
    //             expect(data.apiParam.parameters!.sessionName).toEqual('adminSession')
    //         });
    //     })
    // });
    describe('basic maps', () => {
        const testCases = getTestCases('./src/test/data/parametersMaps-basic.json');
        test.each(testCases)('%s', (name, testData) => {
            const data = testData;
            // make sure that the target property not define yet
            // when parameters is undefined set to undefined
            expect(data.apiParam.parameters?.sessionName ?? undefined).toBeUndefined();
            MapsHelper.applyParametersMaps(data.apiParam, data.sessionData, data.parametersMaps);
            // target property must be created
            // when parameters is undefined set to undefined which will failed the test case
            expect(data.apiParam.parameters?.sessionName ?? undefined).toEqual('adminSession');
        });
    });
    describe('basic command error', () => {
        // test case required 2 parametersMaps per test
        const testCases = getTestCases('./src/test/data/parametersMaps-basic-error.json', 2);
        test.each(testCases)('%s', (name, testData) => {
            const data = testData;
            const t = () => {
                MapsHelper.applyParametersMaps(data.apiParam, data.sessionData, data.parametersMaps);
            };
            expect(t).toThrow(TypeError);
            // target property must be created
            expect(data.apiParam.parameters?.expected ?? undefined).toBeDefined();
            expect(t).toThrow(data.apiParam.parameters?.expected ?? helper.randomString(20));
        });
    });
    describe('target property string replace', () => {
        // test case required 3 parametersMaps
        const testCases = getTestCases('./src/test/data/parametersMaps-stringReplace.json', 3);
        test.each(testCases)('%s', (name, testData) => {
            const data = testData;
            // make sure that the target property not define yet
            expect(data.apiParam.parameters?.sessionName ?? undefined).toBeUndefined();
            MapsHelper.applyParametersMaps(data.apiParam, data.sessionData, data.parametersMaps);
            // console.log('data.apiParam.parameters', data.apiParam)
            // target property must be created
            expect(data.apiParam.parameters?.sessionName ?? undefined).toEqual(data.apiParam.parameters?.expected ?? helper.randomString(20));
        });
    });

    describe('ifExists & ifNotExists command', () => {
        // test case required 2 parametersMaps per test
        const testCases = getTestCases('./src/test/data/parametersMaps-ifExists.json', 2);
        test.each(testCases)('%s', (name, testData) => {
            const data = testData;
            // make sure that the target property not define yet
            expect(data.apiParam.skipExecute).toBeUndefined();
            MapsHelper.applyParametersMaps(data.apiParam, data.sessionData, data.parametersMaps);
            // target property must be created
            expect(data.apiParam.skipExecute).toEqual(data.apiParam.parameters?.expected ?? helper.randomString(20));
        });
    });
    describe('ifTrue & ifFalse command', () => {
        // test case required 2 parametersMaps per test
        const testCases = getTestCases('./src/test/data/parametersMaps-ifTrue.json', 2);
        test.each(testCases)('%s', (name, testData) => {
            const data = testData;
            // make sure that the target property not define yet
            expect(data.apiParam.skipExecute).toBeUndefined();
            MapsHelper.applyParametersMaps(data.apiParam, data.sessionData, data.parametersMaps);
            // target property must be created
            expect(data.apiParam.skipExecute).toEqual(data.apiParam.parameters?.expected ?? helper.randomString(20));
        });
    });
    describe('ifTrue & ifFalse command error', () => {
        // test case required 2 parametersMaps per test
        const testCases = getTestCases('./src/test/data/parametersMaps-ifTrue-error.json', 2);
        test.each(testCases)('%s', (name, testData) => {
            const data = testData;
            const t = () => {
                MapsHelper.applyParametersMaps(data.apiParam, data.sessionData, data.parametersMaps);
            };
            expect(t).toThrow(TypeError);
            // target property must be created
            expect(data.apiParam.parameters?.expected ?? undefined).toBeDefined();
            expect(t).toThrow(data.apiParam.parameters?.expected ?? helper.randomString(20));
        });
    });
    describe('ifEmpty command', () => {
        // test case required 2 parametersMaps per test
        const testCases = getTestCases('./src/test/data/parametersMaps-ifEmpty.json', 2);
        test.each(testCases)('%s', (name, testData) => {
            const data = testData;
            // make sure that the target property not define yet
            expect(data.apiParam.skipExecute).toBeUndefined();
            MapsHelper.applyParametersMaps(data.apiParam, data.sessionData, data.parametersMaps);
            // target property must be created
            expect(data.apiParam.skipExecute).toEqual(data.apiParam.parameters?.expected ?? helper.randomString(20));
        });
    });
    describe('ifEmpty command error', () => {
        // test case required 2 parametersMaps per test
        const testCases = getTestCases('./src/test/data/parametersMaps-ifEmpty-error.json', 2);
        test.each(testCases)('%s', (name, testData) => {
            const data = testData;
            const t = () => {
                MapsHelper.applyParametersMaps(data.apiParam, data.sessionData, data.parametersMaps);
            };
            expect(t).toThrow(TypeError);
            // target property must be created
            expect(data.apiParam.parameters?.expected ?? undefined).toBeDefined();
            expect(t).toThrow(data.apiParam.parameters?.expected ?? helper.randomString(20));
        });
    });
});
//# sourceMappingURL=parametersMaps.spec.js.map
