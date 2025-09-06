# https://khalilstemmler.com/blogs/typescript/node-starter-project/
# https://khalilstemmler.com/blogs/typescript/eslint-for-typescript/

# check if the jq is install
if [[ -f $(which jq) ]]; then echo "jq found, happy... to continue"; else echo "jq not found, to install type 'brew install jq'. stopping...\npress enter to exit..."; read; exit 0; fi

# install typescript, fommater, jest and lint
npm init -y && npm install --save-dev \
    typescript @types/node \
    rimraf prettier \
    jest ts-jest @types/jest \
    eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin

# configure jest - switch to cat command to set the file ext to .cjs
# and add extra config to the file
# npx ts-jest config:init
cat > jest.config.cjs <<- EOM
/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
};
EOM

# to support calss-validator
npx tsc --init --rootDir src --outDir build \
--esModuleInterop --resolveJsonModule --lib es6 \
--module es2022 --target es2017 --moduleResolution node \
--allowJs false --noImplicitAny true \
--experimentalDecorators true --emitDecoratorMetadata true \
--declaration true --declarationMap true --sourceMap true

read -r -d '' SCRIPTS <<- EOM
    "start": "node ./build/index.js",
    "watch": "tsc --watch",
    "build": "rimraf ./build && tsc",
    "format": "prettier --write --tab-width 4 --print-width 200 --single-quote \"src/**/*.ts\"",
    "lint": "eslint \"src/**/*.ts\"",
    "lint-fix": "eslint --fix \"src/**/*.ts\"",
    "lint-fix-dry-run": "eslint --fix-dry-run \"src/**/*.ts\"",
    "test": "jest",
    "test:1": "jest --verbose sample1.spec.ts",
    "test:2": "jest --verbose sample2.spec.ts",
    "coverage": "jest --coverage",
    "test:watch": "jest --watch"
EOM

if [ ! -f ./package.bak.json ]
then
    echo "Backup File does not exist, create backup for package.json"
    cp ./package.json ./package.bak.json
fi

jq 'del(.scripts.test)' ./package.bak.json | \
    jq '.types="build/index.d.js" | .main="build/index.js" | .type="module"' | \
    jq ".scripts += { $SCRIPTS } " > ./package.json

mkdir -p src && touch src/index.ts
mkdir -p src/test

cat > src/test/sample1.spec.ts <<- EOM
describe('test ', () => {
    it('case', () => {
        expect('data').toEqual('data');
    });
});
EOM

cat > src/index.ts <<- EOM
console.log('helloworld!!!')
EOM

cat > .eslintrc <<- EOM
{
    "root": true,
    "parser": "@typescript-eslint/parser",
    "plugins": [
        "@typescript-eslint"
    ],
    "extends": [
        "eslint:recommended",
        "plugin:@typescript-eslint/eslint-recommended",
        "plugin:@typescript-eslint/recommended"
    ],
    "rules": {
        "max-len": [
            "error",
            {
                "code": 200,
                "tabWidth": 4
            }
        ],
        "linebreak-style": [
            "error",
            "unix"
        ],
        "quotes": [
            "error",
            "single"
        ],
        "semi": [
            "error",
            "always"
        ]
    }
}
EOM

# custom module...
npm i class-transformer reflect-metadata class-validator
