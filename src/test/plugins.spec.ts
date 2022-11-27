import { ValidationException, ValidationDetails, ApiParameter, DataSource } from 'api-helper-v2';
import { NexthopMap } from '../mapsHelper.js';
import { IfExists, IfNotExists } from '../plugins.js';

const DEBUG = false;

describe('System plugins', () => {
    const classUnderTest_IfExists = new IfExists();
    const classUnderTest_IfNotExists = new IfNotExists();

    const dataSource: DataSource = {
        apiParam: {
            description: '',
            parametersMaps: [],
            url: '',
            httpMethod: '',

            parameters: {
                isExists: {},
            },

            nextHopOnly: false,
            nextHopParams: [],
            nextHopMaps: [],
            saveMaps: [],

            debug: true,
            debugSession: false,
        },
        sessionData: {},
    };

    const apiParam_ifExists: ApiParameter = {
        parameter: '{{ifExists:apiParam.parameters.isExists:true:false}}',
        targetProperty: 'skipExecute',

        debug: dataSource.apiParam.debug,
    };

    it('plugin (IfExists) log debugData when debug flag set to true', async () => {
        dataSource.apiParam.debugData = [];
        const result = classUnderTest_IfExists.execute(apiParam_ifExists, dataSource, apiParam_ifExists.parameter);
        // console.log(JSON.stringify(dataSource, null, 4))

        expect(dataSource.apiParam.debugData).toHaveLength(1);
        expect(result).toBeTruthy();
    });

    const apiParam_ifNotExists: ApiParameter = {
        parameter: '{{ifNotExists:apiParam.parameters.isNotExists:true:false}}',
        targetProperty: 'skipExecute',

        debug: dataSource.apiParam.debug,
    };

    it('plugin (IfNotExists) log debugData when debug flag set to true', async () => {
        dataSource.apiParam.debugData = [];
        const result = classUnderTest_IfNotExists.execute(apiParam_ifNotExists, dataSource, apiParam_ifNotExists.parameter);
        // console.log(JSON.stringify(dataSource, null, 4));

        expect(dataSource.apiParam.debugData).toHaveLength(1);
        expect(result).toBeTruthy();
    });
});
