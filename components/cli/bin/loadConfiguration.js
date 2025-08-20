"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const promises_1 = require("fs/promises");
const toml_1 = require("toml");
const DefaultConfigurationLocations = [
    '~/.config/ssh-keyring/keyringrc',
    '~/.keyringrc',
];
const loadConfiguration = async (configPath) => {
    const pathSearchLocations = configPath !== undefined ? [
        configPath,
        ...DefaultConfigurationLocations,
    ] : DefaultConfigurationLocations;
    for (const path in pathSearchLocations) {
        try {
            const fileContents = await (0, promises_1.readFile)(path);
            return (0, toml_1.parse)(fileContents.toString());
        }
        catch (e) {
        }
    }
};
