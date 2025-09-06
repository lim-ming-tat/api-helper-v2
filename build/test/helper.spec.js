import { Helper } from '../helper.js';
describe('Helper test', () => {
    it('getFullPath - relative with ./', () => {
        const result = Helper.getFullPath('./src/test/data/testParam.json');
        expect(result).toEqual(`${process.cwd()}/./src/test/data/testParam.json`);
    });
    it('getFullPath - relative', () => {
        const result = Helper.getFullPath('src/test/data/testParam.json');
        expect(result).toEqual(`${process.cwd()}/src/test/data/testParam.json`);
    });
    it('getFullPath - absolute', () => {
        const result = Helper.getFullPath('/src/test/data/testParam.json');
        expect(result).toEqual('/src/test/data/testParam.json');
    });
    it('uniqByMap', () => {
        const result = Helper.uniqByMap([1, 2, 3, 2, 1]);
        expect(result).toEqual([1, 2, 3]);
    });
    it('uniqForObject', () => {
        const result = Helper.uniqForObject([1, 2, 3, 2, 1]);
        expect(result).toEqual([1, 2, 3]);
    });
});
//# sourceMappingURL=helper.spec.js.map