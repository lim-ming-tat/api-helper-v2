import { SessionDataBase } from '../apiLibClass.js';

export class SessionData extends SessionDataBase {
    // baseDomain?: string;
    // emailDomain?: string;

    // adminCredential?: string;
    // adminSessionName?: string;

    // pmAdminCredential?: string;

    // // data definition
    // apiProvider?: string;
    // apiProviderUpper?: string;
    // apiProviderLower?: string;

    // apis?: Array<ApiDefinition>;
    // apis?: Array<ApiDefinition | ApiSpec>;

    // apiServer: ApiServer = {
    //     baseUrl: '',
    // };

    // // [key: string]: any;
    // cmServer: CmServer = {
    //     environment: '',
    //     baseDomain: '',
    //     subDomain: '',
    //     baseUrl: '',
    // };

    // apiGateway?: ApiAgency;

    // apiAgency?: SelectedGateway;

    // agencyName?: string;
    // agencyNameLower?: string;

    // appOwnerCredential?: string;

    // tenantName?: string;
    // policyPrefix = '';

    // gatewayName?: string;
    // gatewayNameLower?: string;
    // secret?: Secret;

    // users?: Array<UserParam>;
    // usersEmail?: Array<UserEmail>;
    // usersArray?: Array<string>;

    // apexAuthL1?: Apex2Auth;
    // apexAuthL2?: Apex2Auth;

    // apexAuthL01?: Apex2Auth;
    // apexAuthL02?: Apex2Auth;
    // apexAuthL11?: Apex2Auth;
    // apexAuthL12?: Apex2Auth;
    // apexAuthL21?: Apex2Auth;
    // apexAuthL22?: Apex2Auth;

    // userInfo?: AnyUnknown;

    // camsApiReqBody?: CamsApiReqBody;
    // camsApiType?: string;

    // for test cases
    expected?: {
        arrayLength: number;
        fields: Array<Record<string, unknown>>;
    };
}
