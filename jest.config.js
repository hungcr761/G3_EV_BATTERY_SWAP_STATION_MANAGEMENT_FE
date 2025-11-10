// jest.config.js
export default {
    testEnvironment: "jsdom",
    moduleFileExtensions: ["js", "jsx", "ts", "tsx"],
    transform: {
        "^.+\\.(t|j)sx?$": "babel-jest", // or "ts-jest" if you use TypeScript
    },
    setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
};
