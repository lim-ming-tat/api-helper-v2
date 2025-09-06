import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class Helper {
    public static getFullPath(folderPath: string): string {
        // always assume root path as {projectRoot}
        // convert relative path to absolute path (at process level)

        // return folderPath.startsWith('/') ? folderPath : `${process.cwd()}/${folderPath}`;
        return folderPath.startsWith('/') ? folderPath : `${this.getModuleFullPath(__dirname, process.cwd())}/${folderPath}`;
    }

    private static getModuleFullPath(dirname: string, cwd: string) {
        const folderParts = dirname.replace(`${cwd}/`, '').split('/');

        // process path conatin node_modules folder, api-helper-v1 included as reference module
        if (folderParts[0] === 'node_modules') {
            return `${cwd}/node_modules/${folderParts[1]}`;
        } else {
            return cwd;
        }
    }

    public static getFullPathV2(folderPath: string): string {
        // always assume root path as {projectRoot}
        // convert relative path to absolute path (at process level)

        return folderPath.startsWith('/') ? folderPath : `${process.cwd()}/${folderPath}`;
    }

    // credit: https://stackoverflow.com/questions/1349404/generate-random-string-characters-in-javascript
    private static charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    public static randomString(length: number): string {
        return [...Array(length)].map(() => Helper.charset[Math.floor(Math.random() * Helper.charset.length)]).join('');
    }

    public static regexpEscape(s: string): string {
        return s.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
    }

    public static uniqByMap<T>(array: T[]): T[] {
        const map = new Map();
        for (const item of array) {
            map.set(item, item);
        }
        return Array.from(map.values());
    }

    public static uniqForObject<T>(array: T[]): T[] {
        const result: T[] = [];
        for (const item of array) {
            // const found = result.some((value) => isEqual(value, item));
            const found = result.some((value) => JSON.stringify(value) === JSON.stringify(item));
            if (!found) {
                result.push(item);
            }
        }
        return result;
    }
}
