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
import { ApiParam } from '../apiLibClass.js';
import { DtoBase } from '../dtoBase.js';
import { PluginBase } from '../pluginBase.js';
import { ValidationException } from '../validationException.js';
// const DEBUG = false;
let TestParam = class TestParam extends DtoBase {
    constructor() {
        super(...arguments);
        this.apiKey = '';
        this.keyFile = '';
    }
};
__decorate([
    Expose(),
    IsString(),
    IsNotEmpty(),
    __metadata("design:type", Object)
], TestParam.prototype, "apiKey", void 0);
__decorate([
    Expose(),
    IsString(),
    IsNotEmpty(),
    __metadata("design:type", Object)
], TestParam.prototype, "keyFile", void 0);
TestParam = __decorate([
    Exclude()
], TestParam);
export { TestParam };
class TestPlugin extends PluginBase {
    constructor() {
        super('TestPlugin', 'testPlugin');
    }
    execute(item, dataSource, parameter) {
        const paramData = parameter.split(':');
        const dataValue = TestPlugin.getValue(TestPlugin.updatePropertyV2(paramData[1], dataSource), dataSource);
        // console.log(`dataValue::: ${dataValue}`)
        const testParam = TestPlugin.validateParam(TestParam, item, dataSource);
        // console.log(`dataValue::: ${dataValue}`)
        // validate data and raise error if any
        // ApexJwt.validateData(ApexJwtParam, authParam);
        // console.log('validateSync Before...')
        testParam.validateSync([], item.data);
        // const newValue = dataValue === undefined ? (paramData[2].toLocaleLowerCase() === 'true' ? true : false) : paramData[2].toLocaleLowerCase() === 'true' ? false : true;
        if (item.debug) {
            this.addDebugData(dataSource, { parameter: parameter, result: dataValue });
        }
        return dataValue;
    }
}
describe('PluginBase', () => {
    const classUnderTest_TestPlugin = new TestPlugin();
    const dataSource = {
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
        const apiParam_testPlugin = {
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
        const apiParam_testPlugin = {
            parameter: '{{testPlugin:{{apiParam.parameters.paramPath}}:true:false}}',
            targetProperty: 'skipExecute',
            debug: dataSource.apiParam.debug,
        };
        const syntaxError = 'Source:\n{\n    "parameter": "{{testPlugin:{{apiParam.parameters.paramPath}}:true:false}}",\n    "targetProperty": "skipExecute",\n    "debug": true\n}\n\nError Message:\n.data\n  [ApiParameter].data is missing/undefined';
        const sut = () => {
            classUnderTest_TestPlugin.execute(apiParam_testPlugin, dataSource, apiParam_testPlugin.parameter);
        };
        expect(sut).toThrow(SyntaxError);
        expect(sut).toThrow(syntaxError);
    });
    it('plugin (TestPlugin) apiParameter.data refernce missing', async () => {
        // dataSource.apiParam.debugData = [];
        const apiParam_testPlugin = {
            parameter: '{{testPlugin:{{apiParam.parameters.paramPath}}:true:false}}',
            targetProperty: 'skipExecute',
            data: 'apiParam.undefined',
            debug: dataSource.apiParam.debug,
        };
        const typeError = 'Source:\n{\n    "parameter": "{{testPlugin:{{apiParam.parameters.paramPath}}:true:false}}",\n    "targetProperty": "skipExecute",\n    "data": "apiParam.undefined",\n    "debug": true\n}\n\nError Message:\n.data\n  apiParam.undefined is missing/undefined';
        const sut = () => {
            classUnderTest_TestPlugin.execute(apiParam_testPlugin, dataSource, apiParam_testPlugin.parameter);
        };
        expect(sut).toThrow(TypeError);
        expect(sut).toThrow(typeError);
    });
    it('plugin (TestPlugin) apiParameter.data target is missing', async () => {
        // dataSource.apiParam.debugData = [];
        const apiParam_testPlugin = {
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
//# sourceMappingURL=pluginBase.spec.js.map