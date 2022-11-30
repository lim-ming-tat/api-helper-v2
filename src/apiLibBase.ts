import fs from 'fs';
import _ from 'lodash';
import request from 'superagent';
import * as qs from 'querystring';
import { DateTime } from 'luxon';

import { Helper } from './helper.js';
import { PluginBase } from './pluginBase.js';
import { MapsHelper } from './mapsHelper.js';

import { ApiParam, ApiTag, SessionDataBase, ResponseParam, ApiResponse, ApiCommand, ApiParamBase, ParametersMaps } from './apiLibClass.js';
import { ValidationException } from './validationException.js';

export abstract class ApiLibBase {
    protected logLabel = Helper.randomString(6);
    protected cluster = '';

    private static maskList: Array<string> = [];

    constructor(cluster?: string) {
        if (cluster) this.cluster = cluster;
    }

    public static addPlugin(plugin: PluginBase) {
        MapsHelper.addPlugin(plugin);
    }

    public static addPropertyMask(name: string) {
        ApiLibBase.maskList.push(name);
    }

    protected static regexpEscape(s: string): string {
        return s.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
    }

    public static displayFolders() {
        console.log('apiLibBase');
        console.log(`__filename::: ${__filename}`);
        console.log(` __dirname::: ${__dirname}`);
        console.log(`   process::: ${process.cwd()}`);
    }

    protected logMessage(message: string) {
        console.log(`[${DateTime.local().toString()}] ${this.logLabel} - ${message}`);
    }

    private invokeRequest(apiParam: ApiParam, apiTag: ApiTag, sessionData: SessionDataBase): Promise<ResponseParam> {
        // if (apiParam.description === 'Create New API with uploded file' || apiParam.description === 'Create Agency.') {
        //     console.log(`\n---b4-invokeRequest---\n${JSON.stringify(apiParam, null, 4)}\n---b4-invokeRequest---\n`)
        // }

        return new Promise<ResponseParam>((resolve, reject) => {
            const responseParam = new ResponseParam(apiTag, apiParam.description, sessionData, apiParam.saveMaps, apiParam);
            try {
                // TODO: require further review on the skipExecute usage
                if (responseParam.skipExecute === undefined && sessionData.skipList !== undefined && sessionData.skipList.length > 0) {
                    responseParam.skipExecute = sessionData.skipList.includes(responseParam.apiTag) ? true : false;
                }

                // handle skipExecute and nextHopOnly only...
                // TODO: bug ::: skipExecute targetProperty cause skipList not to work...
                if (apiParam.parametersMaps !== undefined) {
                    MapsHelper.applyParametersMaps(
                        apiParam,
                        sessionData,
                        apiParam.parametersMaps.filter((item) => {
                            return item.targetProperty === 'skipExecute' || item.targetProperty === 'nextHopOnly' ? item : undefined;
                        }) as ParametersMaps
                    );
                }
                // if (apiParam.description === 'Upload X.509 Certificate to API Service') {
                //     console.log(`\n---b4-applyParametersMaps---\n${JSON.stringify(apiParam, null, 4)}\n---b4-applyParametersMaps---\n`)
                // }

                // apiParm.skipExecute setting take precedent...
                if (apiParam.skipExecute !== undefined) {
                    responseParam.skipExecute = apiParam.skipExecute;
                }
                if (apiParam.nextHopOnly !== undefined) {
                    responseParam.nextHopOnly = apiParam.nextHopOnly;
                }

                if (responseParam.skipExecute) {
                    this.logMessage(`Skip Execute API...${responseParam.apiTag} - ${responseParam.description}`);
                    // console.log(`\n---b4-applyParametersMaps---\n${JSON.stringify(apiParam, null, 4)}\n---b4-applyParametersMaps---\n`)

                    resolve(responseParam);
                } else {
                    if (apiParam.nextHopOnly) {
                        responseParam.skipExecute = true;
                        responseParam.nextHopOnly = true;

                        resolve(responseParam);
                    } else {
                        // propagate debug flag
                        if (sessionData.debug == true) responseParam.debug = true;
                        else if (sessionData.debugList !== undefined) responseParam.debug = sessionData.debugList.includes(responseParam.apiTag) ? true : false;
                        else responseParam.debug = false;

                        // overwrite debug flag based on caller debugList
                        if (responseParam.debug) {
                            this.logMessage(` >>> API Debug Start ...${responseParam.apiTag} <<<`);
                            apiParam.debug = true;
                        }

                        MapsHelper.applyParametersMaps(apiParam, sessionData, apiParam.parametersMaps);

                        // update dscription after applyParametersMaps
                        responseParam.description = apiParam.description;

                        const targetURL = new URL(apiParam.url);

                        // construct query string
                        if (apiParam.queryString != undefined) {
                            targetURL.search =
                                qs.stringify(apiParam.queryString, undefined, undefined, {
                                    encodeURIComponent: encodeURIComponent,
                                }) + targetURL.search.replace('?', '&');
                        }

                        let req = request(apiParam.httpMethod, targetURL.href);
                        req.buffer(true);

                        if (apiParam.httpHeaders !== undefined) {
                            // iterate through properties of headers
                            for (const key in apiParam.httpHeaders) {
                                req = req.set(key, apiParam.httpHeaders[key]);
                            }
                        }

                        if (apiParam.httpMethod === 'POST' || apiParam.httpMethod === 'PUT') {
                            if (apiParam.jsonData !== undefined) {
                                if (apiParam.base64Data !== undefined) {
                                    const buff = fs.readFileSync(Helper.getFullPath(apiParam.base64Data.dataFileName));
                                    const base64data = buff.toString('base64');
                                    apiParam.jsonData[apiParam.base64Data.fieldName] = base64data;
                                }

                                const postData = JSON.stringify(apiParam.jsonData);
                                req = req.type('application/json').send(postData);
                            }

                            // handle multiPartData POST request
                            if (apiParam.multiPartData != undefined) {
                                if (apiParam.multiPartData.fields != undefined) {
                                    for (const key in apiParam.multiPartData.fields) {
                                        req = req.field(key, apiParam.multiPartData.fields[key]);
                                    }
                                }

                                if (apiParam.multiPartData.attachments != undefined) {
                                    // console.log(`multiPartData ${JSON.stringify(apiParam.multiPartData.attachments, null, 4)}`)
                                    for (const key in apiParam.multiPartData.attachments) {
                                        if (Array.isArray(apiParam.multiPartData.attachments[key])) {
                                            _.forEach(apiParam.multiPartData.attachments[key], function (paramValue) {
                                                // trigger error if file not found...
                                                // req.attach does not propagate error
                                                fs.readFileSync(Helper.getFullPath(paramValue));

                                                req = req.attach('files', Helper.getFullPath(paramValue));
                                            });
                                        } else {
                                            // trigger error if file not found...
                                            // req.attach does not propagate error
                                            fs.readFileSync(Helper.getFullPath(apiParam.multiPartData.attachments[key]));

                                            req = req.attach(key, Helper.getFullPath(apiParam.multiPartData.attachments[key]));
                                        }
                                    }
                                }

                                req = req.type('multipart/form-data');
                            }

                            if (apiParam.formData != undefined) {
                                const postData = qs.stringify(apiParam.formData as qs.ParsedUrlQueryInput, undefined, undefined, {
                                    encodeURIComponent: encodeURIComponent,
                                });
                                req = req
                                    .type('application/x-www-form-urlencoded')
                                    .set({ field: 'Content-Length', val: Buffer.byteLength(postData) })
                                    .send(postData);
                            }

                            if (apiParam.textData != undefined) {
                                let postData = apiParam.textData.data;

                                if (apiParam.textData.dataFileName != undefined) {
                                    postData = fs.readFileSync(Helper.getFullPath(apiParam.textData.dataFileName), 'utf8');

                                    // data mapping for dataFile
                                    // console.log(JSON.stringify(sessionData, null, 4));
                                    if (apiParam.textData.replaceMapper != undefined) {
                                        let jsonData = JSON.stringify(postData);

                                        for (const key in apiParam.textData.replaceMapper) {
                                            const replace = '{{' + ApiLibBase.regexpEscape(key) + '}}';
                                            const regex = new RegExp(replace, 'g');

                                            jsonData = jsonData.replace(regex, _.get({ apiParam: apiParam, sessionData: sessionData }, _.get(apiParam.textData.replaceMapper, key)));
                                        }
                                        postData = JSON.parse(jsonData);
                                    }
                                }

                                req = req.type(apiParam.textData.contentType).send(postData);
                            }
                        }

                        this.logMessage(`Invoke API...${responseParam.apiTag} - ${responseParam.description}`);
                        responseParam.startTime = DateTime.local();

                        if (responseParam.debug === true || apiParam.debug === true || sessionData.debug === true) {
                            ApiLibBase.displayResult(req, 'request');

                            if (sessionData.showApiParam) {
                                ApiLibBase.displayResult(apiParam, 'apiParam');
                            }

                            // ApiLibBase.displayResult(sessionData, 'sessionData');
                            if (sessionData.showSessionData) {
                                ApiLibBase.displayResult(sessionData, 'pre api call sessionData');
                            }
                        }

                        // console.log(responseParam);
                        req.then((res) => {
                            this.logMessage(`Successful...${responseParam.apiTag}`);
                            responseParam.endTime = DateTime.local();

                            if (responseParam.startTime) responseParam.elapsed = responseParam.endTime.diff(responseParam.startTime, ['minutes', 'seconds', 'milliseconds']).toObject();

                            responseParam.sessionData = sessionData;

                            responseParam.httpStatus = res.status;
                            // responseParam.response = res

                            if (apiParam.parameters !== undefined) responseParam.parameters = apiParam.parameters;

                            if (apiParam.baseString !== undefined) responseParam.baseString = apiParam.baseString;

                            responseParam.responseHeaders = res.headers;
                            if (!_.isEmpty(res.body)) {
                                responseParam.responseBody = res.body;
                            } else {
                                responseParam.responseText = res.text;
                            }

                            if (responseParam.debug === true || apiParam.debug === true || sessionData.debug === true) {
                                ApiLibBase.displayResult(res, 'response', ['text', 'req']);
                                // ApiLibBase.displayResult(responseParam, 'responseParam');
                            }

                            resolve(responseParam);
                        }).catch((err) => {
                            responseParam.endTime = DateTime.local();

                            this.logMessage(`API Failed...${responseParam.apiTag}`);

                            this.logMessage(`>>>>>> ${err.message} <<<<<<`);
                            ApiLibBase.displayResult(err, 'error object');

                            ApiLibBase.displayResult(apiParam, 'apiParam');
                            if (!_.isEmpty(err.response) && !_.isEmpty(err.response.body)) {
                                console.log(err.response.body);
                            } else if (!_.isEmpty(err.response) && !_.isEmpty(err.response.text)) {
                                console.log(err.response.text);
                            }

                            responseParam.httpStatus = err.status;
                            responseParam.error = err;
                            reject(responseParam);
                        });
                    }
                }
            } catch (err) {
                const error = err as Error;

                responseParam.endTime = DateTime.local();

                this.logMessage(`API Failed...${responseParam.apiTag} - ${apiParam.description}`);
                this.logMessage(`\n---error object---\n${error}\n---error object---`);
                if (error.message === 'Data validation errors') {
                    const valError = error as ValidationException;
                    // valError.showMessage();
                    console.log(`---ValidationException---\n${JSON.stringify(valError.details, null, 4)}\n---ValidationException---`);
                }
                console.log();
                ApiLibBase.displayResult(apiParam, 'apiParam');

                responseParam.error = { name: 'Pre Execution Error', message: error.message };
                reject(responseParam);
            }
        });
    }

    private async executeApiInternal(apiParams: ApiParam[], apiResults: ResponseParam[], apiTag: ApiTag, sessionData: SessionDataBase): Promise<ResponseParam> {
        let currentParam: ApiParam;
        // let nextParams: Array<ApiParam>;

        if (apiParams[0].moduleName !== undefined) {
            // load module
            currentParam = await ApiParam.file2Instance(apiParams[0].moduleName);

            // transfer module description to currentParam
            // console.log(`\n---module.description---\n${JSON.stringify(apiParams[0].description, null, 4)}\n---apiParams[0]---\n`)
            // console.log(`\n---currentParam.description---\n${JSON.stringify(currentParam.description, null, 4)}\n---apiParams[0]---\n`)
            if (apiParams[0].description !== undefined) {
                currentParam.description = apiParams[0].description;
            }

            // transfer module skipExecute to currentParam
            if (apiParams[0].skipExecute !== undefined) {
                currentParam.skipExecute = apiParams[0].skipExecute;
            }

            // transfer module nextHopParams to currentParam
            if (apiParams[0].nextHopMaps !== undefined) {
                if (currentParam.nextHopMaps !== undefined && currentParam.nextHopMaps.length > 0) {
                    // merge 2 array
                    currentParam.nextHopMaps = [...currentParam.nextHopMaps, ...apiParams[0].nextHopMaps];
                } else {
                    currentParam.nextHopMaps = apiParams[0].nextHopMaps;
                }

                // bring in the nextHopParam
                apiParams[0].nextHopMaps.forEach((item) => {
                    // currentParam[item.paramTemplateName] = apiParams[0][item.paramTemplateName]
                    // https://stackoverflow.com/questions/12710905/how-do-i-dynamically-assign-properties-to-an-object-in-typescript
                    // (currentParam as any)[item.paramTemplateName] = (apiParams[0] as any)[item.paramTemplateName];
                    _.set(currentParam, item.paramTemplateName, _.get(apiParams[0], item.paramTemplateName));
                });
                // console.log(`\n---currentParam---\n${JSON.stringify(currentParam, null, 4)}\n---currentParam---\n`)
            }

            if (apiParams[0].parameters !== undefined) {
                currentParam.parameters = apiParams[0].parameters;
            }

            if (apiParams[0].moduleParameters !== undefined) {
                // console.log(`\n---moduleParameters.sessionData---\n${JSON.stringify(sessionData, null, 4)}\n---sessionData---\n`)
                apiParams[0].moduleParameters.forEach((item) => {
                    _.set(currentParam, item.targetProperty, _.get({ sessionData: sessionData, apiParam: currentParam }, item.parameter));
                });
            }

            if (apiParams[0].returnParameterName !== undefined) {
                currentParam.returnParameterName = apiParams[0].returnParameterName;
            } else {
                currentParam.returnParameterName = 'returnParameter';
            }
            // console.log(`\n---currentParam---\n${JSON.stringify(currentParam, null, 4)}\n---currentParam---\n`)
        } else {
            // clone the apiParam for update
            currentParam = await ApiParam.plain2Instance(JSON.parse(JSON.stringify(apiParams[0])));
        }

        // transfer module parameter to currentParam
        if (apiParams[0].parameters !== undefined) {
            currentParam.parameters = apiParams[0].parameters;
        }

        const nextParams = apiParams.splice(1);

        // applyParametersMaps(currentParam, sessionData, currentParam.parametersMaps)
        // console.log(JSON.stringify(currentParam, null, 4))
        // console.log(`\n---currentParam---\n${JSON.stringify(currentParam, null, 4)}\n---currentParam---\n`)

        return this.invokeRequest(currentParam, apiTag, sessionData)
            .then((result) => {
                // console.log(`\n---invokeRequest-result---\n${JSON.stringify(result, null, 4)}\n---result---\n`)

                apiResults.push(result);
                if (!result.skipExecute) {
                    MapsHelper.applySaveMaps(result, sessionData, currentParam.saveMaps);

                    // clear sessionData to save memory
                    delete result.sessionData;
                    delete result.apiParam;

                    if (result.debug === true || currentParam.debug === true || sessionData.debug === true) {
                        if (sessionData.showResults) {
                            ApiLibBase.displayResult(result, 'responseParam');
                        }

                        if (sessionData.showSessionData === true) {
                            ApiLibBase.displayResult(sessionData, 'post api call sessionData');
                        }
                    }

                    MapsHelper.applyNextHopMaps(currentParam, sessionData);
                    // console.log(`\n---currentParam---\n${JSON.stringify(currentParam, null, 4)}\n---currentParam---\n`)

                    if (currentParam.nextHopParams !== undefined && currentParam.nextHopParams.length > 0) {
                        const nextApiTag = new ApiTag(apiTag);
                        result.apiResults = [];

                        return this.executeApiInternal(currentParam.nextHopParams, result.apiResults, nextApiTag, sessionData);
                    }
                } else if (result.skipExecute && result.nextHopOnly) {
                    // clear sessionData to save memory
                    delete result.sessionData;
                    delete result.apiParam;

                    MapsHelper.applyNextHopMaps(currentParam, sessionData);
                    // console.log(`\n---applyNextHopMaps---\n${JSON.stringify(currentParam, null, 4)}\n---applyNextHopMaps---\n`)

                    if (currentParam.nextHopParams !== undefined && currentParam.nextHopParams.length > 0) {
                        // console.log(`\n---nextHopParams---\n${JSON.stringify(currentParam.nextHopParams, null, 4)}\n---nextHopParams---\n`)

                        const nextApiTag = new ApiTag(apiTag);
                        result.apiResults = [];

                        return this.executeApiInternal(currentParam.nextHopParams, result.apiResults, nextApiTag, sessionData);
                    }
                }

                // clear sessionData to save memory
                delete result.sessionData;
                delete result.apiParam;

                return result;
            })
            .catch((result) => {
                this.logMessage('Failed...');
                if (result.httpStatus === undefined) {
                    result.httpStatus = 601;
                    // result.errorMessage = result.message || result.error;
                    // result.errorStack = result.stack
                    if (result.stack) console.log(result.stack);
                }

                // console.log(JSON.stringify(result, null, 4))
                apiResults.push(result);
                return result;
            })
            .finally(() => {
                // this.logMessage("Finally...");

                if (nextParams.length > 0) {
                    // console.log(nextParams)
                    apiTag.next();

                    return this.executeApiInternal(nextParams, apiResults, apiTag, sessionData);
                }
            });
    }

    public async executeApi(apiCommand: ApiCommand): Promise<Array<ResponseParam>> {
        const apiTag = new ApiTag();

        this.logMessage(`Start Execute Apis - (${apiCommand.description})`);
        await this.executeApiInternal(apiCommand.apiParams, apiCommand.apiResults, apiTag, apiCommand.sessionData);
        this.logMessage(`Execute Apis Completed... - (${apiCommand.description})\n\n`);

        return apiCommand.apiResults;
    }

    // public static displayResult<T>(apiResults: Array<T>, tag: string) {
    public static displayResult<T>(apiResults: T, tag: string, props: Array<string> = []) {
        let dataArray: T | Array<T> = apiResults;
        if (!Array.isArray(dataArray)) {
            dataArray = [dataArray];
        }

        const propsList = [...ApiLibBase.maskList, ...props];

        console.log(`----${tag}----Start----`);
        dataArray.forEach((item) => {
            console.log(
                JSON.stringify(
                    item,
                    function (key, value) {
                        // if (RES.CONFIG.PROPERTY_EXCLUDED.includes(key)) return '***';
                        if (propsList.includes(key)) return '***';
                        else return value;
                    },
                    4
                )
            );
        });

        console.log(`----${tag}------End----`);
    }

    protected async configureSystemConfig?(sessionData: SessionDataBase): Promise<void>;

    // protected async executeCommandV3(
    //     apiCommandFileName: string,
    //     callBackSessionData: (sessionData: SessionDataBase) => void
    // ): Promise<Array<ApiResponse>> {
    //     // load the apis commands file
    //     this.logMessage(`Load api command file: '${apiCommandFileName}'`);
    //     const apiCommand = await ApiCommand.getInstance(apiCommandFileName);

    //     if (this.configureSystemConfig) await this.configureSystemConfig(apiCommand.sessionData);

    //     // allow caller to update the sessionData before proceed...
    //     callBackSessionData(apiCommand.sessionData);

    //     // console.log(JSON.stringify(apiCommand, null, 4))
    //     // apiCommand.sessionData.skipList.push( "5" )

    //     const results = await this.executeApi(apiCommand);

    //     if (apiCommand.sessionData.showResults) {
    //         ApiLibBase.displayResult(apiCommand.apiResults, 'Results');
    //     }
    //     if (apiCommand.sessionData.showSessionData) {
    //         ApiLibBase.displayResult([apiCommand.sessionData], 'sessionData');
    //     }

    //     const apiResponses: Array<ApiResponse> = [{ sessionData: apiCommand.sessionData, results: results }];

    //     return apiResponses;
    // }

    protected async executeCommand(apiCommandFileName: string, inputParam: ApiParamBase, callBackSessionData: (sessionData: SessionDataBase) => void): Promise<Array<ApiResponse>> {
        // load the apis commands file
        this.logMessage(`Load api command file: '${apiCommandFileName}'`);
        const apiCommand = await ApiCommand.file2Instance(apiCommandFileName);

        if (this.configureSystemConfig) await this.configureSystemConfig(apiCommand.sessionData);

        // transfer the default flags from inputParam to sessionData
        apiCommand.sessionData.showSessionData = inputParam.showSessionData;
        apiCommand.sessionData.showResults = inputParam.showResults;
        apiCommand.sessionData.showApiParam = inputParam.showApiParam;

        apiCommand.sessionData.debug = inputParam.debug;
        apiCommand.sessionData.debugList = inputParam.debugList;

        // allow caller to update the sessionData before proceed...
        callBackSessionData(apiCommand.sessionData);

        const results = await this.executeApi(apiCommand);

        // if (apiCommand.sessionData.showResults) {
        //     ApiLibBase.displayResult(apiCommand.apiResults, 'Results');
        // }
        // if (apiCommand.sessionData.showSessionData) {
        //     ApiLibBase.displayResult([apiCommand.sessionData], 'sessionData');
        // }

        const apiResponses: Array<ApiResponse> = [{ sessionData: apiCommand.sessionData, results: results }];

        return apiResponses;
    }
}
