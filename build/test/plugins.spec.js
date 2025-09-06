import { ApiParam } from '../apiLibClass.js';
import { IfExists, IfNotExists } from '../plugins.js';
// const DEBUG = false;
describe('System plugins', () => {
    const classUnderTest_IfExists = new IfExists();
    const classUnderTest_IfNotExists = new IfNotExists();
    // const dataSourcex: DataSource = {
    //     apiParam: {
    //         description: '',
    //         parametersMaps: [],
    //         url: '',
    //         httpMethod: '',
    //         parameters: {
    //             isExists: {},
    //         },
    //         nextHopOnly: false,
    //         nextHopParams: [],
    //         nextHopMaps: [],
    //         saveMaps: [],
    //         debug: true,
    //         debugSession: false,
    //     },
    //     sessionData: {},
    // };
    const dataSource = {
        apiParam: new ApiParam(),
        sessionData: {},
    };
    dataSource.apiParam.debug = true;
    dataSource.apiParam.parameters = {
        isExists: {},
    };
    const apiParam_ifExists = {
        parameter: '{{ifExists:apiParam.parameters.isExists:true:false}}',
        targetProperty: 'skipExecute',
        debug: dataSource.apiParam.debug,
    };
    it('plugin (IfExists) log debugData when debug flag set to true', async () => {
        dataSource.apiParam.debugData = [];
        // remove {{ and }} from apiParam.parameter
        const match = apiParam_ifExists.parameter.match(/^{{(((?!}}.*{{).)*)}}$/);
        const parameter = match ? match[1] : '';
        const commandKeyword = parameter.split(':')[0];
        // apiParam match plugin
        expect(classUnderTest_IfExists.isMatch(commandKeyword)).toBeTruthy();
        const result = classUnderTest_IfExists.execute(apiParam_ifExists, dataSource, parameter);
        // console.log(JSON.stringify(dataSource, null, 4))
        expect(dataSource.apiParam.debugData).toHaveLength(1);
        expect(result).toBeTruthy();
    });
    const apiParam_ifNotExists = {
        parameter: '{{ifNotExists:apiParam.parameters.isNotExists:true:false}}',
        targetProperty: 'skipExecute',
        debug: dataSource.apiParam.debug,
    };
    it('plugin (IfNotExists) log debugData when debug flag set to true', async () => {
        dataSource.apiParam.debugData = [];
        // remove {{ and }} from apiParam.parameter
        const match = apiParam_ifNotExists.parameter.match(/^{{(((?!}}.*{{).)*)}}$/);
        const parameter = match ? match[1] : '';
        const commandKeyword = parameter.split(':')[0];
        // apiParam match plugin
        expect(classUnderTest_IfNotExists.isMatch(commandKeyword)).toBeTruthy();
        const result = classUnderTest_IfNotExists.execute(apiParam_ifNotExists, dataSource, parameter);
        // console.log(JSON.stringify(dataSource, null, 4));
        expect(dataSource.apiParam.debugData).toHaveLength(1);
        expect(result).toBeTruthy();
    });
});
//# sourceMappingURL=plugins.spec.js.map