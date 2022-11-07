# https://khalilstemmler.com/blogs/typescript/node-starter-project/
# https://khalilstemmler.com/blogs/typescript/eslint-for-typescript/

# install typescript, fommater, jest and lint
npm init -y && npm install --save-dev \
    typescript @types/node \
    rimraf prettier \
    jest ts-jest @types/jest \
    eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin

# configure jest
npx ts-jest config:init

# configure type script
npx tsc --init --rootDir src --outDir build \
--esModuleInterop --resolveJsonModule --lib es6 \
--module commonjs --allowJs false --noImplicitAny true

# update package with the following commands
  "scripts": {
    "watch": "tsc --watch",
    "build": "rimraf ./build && tsc",
    "format": "prettier --write --tab-width 4 --print-width 200 --single-quote \"src/**/*.ts\"",
    "lint": "eslint \"{src,apps,libs,test}/**/*.ts\"",
    "lint-fix": "eslint --fix src/**/*.ts",
    "lint-fix-dry-run": "eslint --fix-dry-run src/**/*.ts",
    "test": "jest",
    "test:1": "jest --verbose parametersMaps.spec.ts",
    "test:2": "jest --verbose saveMaps.spec.ts",
    "test:3": "jest --verbose nextHopMaps.spec.ts",
    "coverage": "jest --coverage",
    "test:watch": "jest --watch"
  },

mkdir src && source src/index.ts


# custom module...
npm i lodash superagent luxon 
npm i --save-dev @types/lodash
npm i --save-dev @types/superagent
npm i --save-dev @types/luxon

npm i class-transformer 
npm i reflect-metadata
npm i class-validator


