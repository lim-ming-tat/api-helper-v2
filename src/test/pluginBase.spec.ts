import { Exclude, Expose } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';
import { ApiParam, ApiParameter } from '../apiLibClass.js';
import { DtoBase } from '../dtoBase.js';
import { DataSource, PluginBase } from '../pluginBase.js';
import { ValidationException } from '../validationException.js';

// const DEBUG = false;

@Exclude()
export class TestParam extends DtoBase {
    @Expose()
    @IsString()
    @IsNotEmpty()
    apiKey = '';

    @Expose()
    @IsString()
    @IsNotEmpty()
    keyFile = '';
}

class TestPlugin extends PluginBase {
    constructor() {
        super('TestPlugin', 'testPlugin');
    }

    public execute(item: ApiParameter, dataSource: DataSource, parameter: string): boolean {
        const paramData = parameter.split(':');
        const dataValue = TestPlugin.getValue<boolean>(TestPlugin.updatePropertyV2(paramData[1], dataSource), dataSource);
        // console.log(`dataValue::: ${dataValue}`)

        const testParam = TestPlugin.validateParam(TestParam, item, dataSource);
        // console.log(`dataValue::: ${dataValue}`)

        // validate data and raise error if any
        // ApexJwt.validateData(ApexJwtParam, authParam);
        // console.log('validateSync Before...')
        testParam.validateSync( [], item.data);

        // const newValue = dataValue === undefined ? (paramData[2].toLocaleLowerCase() === 'true' ? true : false) : paramData[2].toLocaleLowerCase() === 'true' ? false : true;

        if (item.debug) {
            this.addDebugData(dataSource, { parameter: parameter, result: dataValue });
        }

        return dataValue;
    }
}

describe('PluginBase', () => {
    const classUnderTest_TestPlugin = new TestPlugin();
    
    const dataSource: DataSource = {
        apiParam: new ApiParam(),
        sessionData: {},
    };
    dataSource.apiParam.debug = true;
    dataSource.apiParam.parameters = {
        isExists: true,
        paramPath: 'apiParam.parameters.isExists',
        
        paramData: {
            apiKey: 'key',
            keyFile: 'key file'
        }
    };

    // const dataSourcex: DataSource = {
    //     apiParam: {
    //         description: '',
    //         parametersMaps: [],
    //         url: '',
    //         httpMethod: '',

    //         parameters: {
    //             isExists: true,
    //             paramPath: 'apiParam.parameters.isExists',
                
    //             paramData: {
    //                 apiKey: 'key',
    //                 keyFile: 'key file'
    //             }
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

    it('plugin (TestPlugin) happy path', async () => {
        const apiParam_testPlugin: ApiParameter = {
            parameter: '{{testPlugin:apiParam.parameters.isExists:true:false}}',
            targetProperty: 'skipExecute',
    
            data: 'apiParam.parameters.paramData',

            debug: dataSource.apiParam.debug,
        };

        const returnValue = classUnderTest_TestPlugin.execute(apiParam_testPlugin, dataSource, apiParam_testPlugin.parameter);

        expect(returnValue).toBeTruthy();

    });

    it('plugin (TestPlugin) apiParameter.data missing', async () => {
        // dataSource.apiParam.debugData = [];
        const apiParam_testPlugin: ApiParameter = {
            parameter: '{{testPlugin:{{apiParam.parameters.paramPath}}:true:false}}',
            targetProperty: 'skipExecute',
    
            debug: dataSource.apiParam.debug,
        };

        const syntaxError =
            'Source:\n{\n    "parameter": "{{testPlugin:{{apiParam.parameters.paramPath}}:true:false}}",\n    "targetProperty": "skipExecute",\n    "debug": true\n}\n\nError Message:\n.data\n  [ApiParameter].data is missing/undefined';

        const sut = () => {
            classUnderTest_TestPlugin.execute(apiParam_testPlugin, dataSource, apiParam_testPlugin.parameter);
        };

        expect(sut).toThrow(SyntaxError);
        expect(sut).toThrow(syntaxError);
    });
    
    it('plugin (TestPlugin) apiParameter.data refernce missing', async () => {
        // dataSource.apiParam.debugData = [];
        const apiParam_testPlugin: ApiParameter = {
            parameter: '{{testPlugin:{{apiParam.parameters.paramPath}}:true:false}}',
            targetProperty: 'skipExecute',

            data: 'apiParam.undefined',

            debug: dataSource.apiParam.debug,
        };

        const typeError =
            'Source:\n{\n    "parameter": "{{testPlugin:{{apiParam.parameters.paramPath}}:true:false}}",\n    "targetProperty": "skipExecute",\n    "data": "apiParam.undefined",\n    "debug": true\n}\n\nError Message:\n.data\n  apiParam.undefined is missing/undefined';

        const sut = () => {
            classUnderTest_TestPlugin.execute(apiParam_testPlugin, dataSource, apiParam_testPlugin.parameter);
        };

        expect(sut).toThrow(TypeError);
        expect(sut).toThrow(typeError);
    });

    it('plugin (TestPlugin) apiParameter.data target is missing', async () => {
        // dataSource.apiParam.debugData = [];
        const apiParam_testPlugin: ApiParameter = {
            parameter: '{{testPlugin:{{apiParam.parameters.paramPath}}:true:false}}',
            targetProperty: 'skipExecute',

            data: 'apiParam.parameters',
    
            debug: dataSource.apiParam.debug,
        };

        const validationError = 'Data validation errors';

        const sut = () => {
            classUnderTest_TestPlugin.execute(apiParam_testPlugin, dataSource, apiParam_testPlugin.parameter);
        };

        expect(sut).toThrow(ValidationException);
        expect(sut).toThrow(validationError);
    });
});
