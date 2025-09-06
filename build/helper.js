import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export class Helper {
    static getFullPath(folderPath) {
        // always assume root path as {projectRoot}
        // convert relative path to absolute path (at process level)
        // return folderPath.startsWith('/') ? folderPath : `${process.cwd()}/${folderPath}`;
        return folderPath.startsWith('/') ? folderPath : `${this.getModuleFullPath(__dirname, process.cwd())}/${folderPath}`;
    }
    static getModuleFullPath(dirname, cwd) {
        const folderParts = dirname.replace(`${cwd}/`, '').split('/');
        // process path conatin node_modules folder, api-helper-v1 included as reference module
        if (folderParts[0] === 'node_modules') {
            return `${cwd}/node_modules/${folderParts[1]}`;
        }
        else {
            return cwd;
        }
    }
    static getFullPathV2(folderPath) {
        // always assume root path as {projectRoot}
        // convert relative path to absolute path (at process level)
        return folderPath.startsWith('/') ? folderPath : `${process.cwd()}/${folderPath}`;
    }
    static randomString(length) {
        return [...Array(length)].map(() => Helper.charset[Math.floor(Math.random() * Helper.charset.length)]).join('');
    }
    static regexpEscape(s) {
        return s.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
    }
    static uniqByMap(array) {
        const map = new Map();
        for (const item of array) {
            map.set(item, item);
        }
        return Array.from(map.values());
    }
    static uniqForObject(array) {
        const result = [];
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
// credit: https://stackoverflow.com/questions/1349404/generate-random-string-characters-in-javascript
Helper.charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
//# sourceMappingURL=helper.js.map