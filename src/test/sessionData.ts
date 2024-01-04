import { SessionDataBase } from '../apiLibClass.js';

export class SessionData extends SessionDataBase {
    expected?: {
        arrayLength: number;
        fields: Array<Record<string, unknown>>;
    };
}
