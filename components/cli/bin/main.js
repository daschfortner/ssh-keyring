"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.main = void 0;
const child_process_1 = require("child_process");
const util_1 = require("util");
const command_line_args_1 = __importDefault(require("command-line-args"));
const command_line_usage_1 = __importDefault(require("command-line-usage"));
const core_1 = require("@ssh-keyring/core");
// TODO: move plugin loading to its own file
const exec = (0, util_1.promisify)(child_process_1.exec);
const loadPlugins = async () => {
    const { stdout } = await exec('npm list -g --json');
    const globalPackages = JSON.parse(stdout);
    const keyringPlugins = Object.keys(globalPackages.dependencies).filter((d) => d.startsWith('@ssh-keyring/plugin-'));
    const plugins = await Promise.all(keyringPlugins.map(async (plugin) => await import(plugin)));
    return plugins.map((p) => p.default.default);
};
const CliOptions = [
    {
        name: 'log-level',
        description: 'Logging level to use (debug, info, or error)',
        alias: 'l',
        defaultValue: 'error',
        type: String,
    },
    {
        name: 'remotes-path',
        description: 'Override the default configuration paths and use a costom remote configuration path',
        alias: 'r',
        type: String,
    }
];
const printUsage = (plugins) => {
    return (0, command_line_usage_1.default)([
        {
            header: 'ssh-keyring',
            content: 'Manage ssh keys on remote environments.',
        },
        {
            header: 'USAGE',
            content: 'ssh-keyring <plugin> [args]',
        },
        {
            header: 'ARGUMENTS',
            optionList: CliOptions,
        },
        {
            header: 'INSTALLING PLUGINS',
            content: [
                'To run the keyring on a remote, you need to install a plugin.',
                'For instructions on how to install a plugin, see <insert link>.',
            ]
        },
        {
            header: 'AVAILABLE PLUGINS',
            content: plugins.length ? plugins.map((p) => ({
                header: p.name,
                content: p.description,
            })) : [
                'No plugins available.',
                'Install a plugin to run the keyring.',
            ]
        },
    ]);
};
const main = async () => {
    const availablePlugins = await loadPlugins();
    const { pluginCommand, logLevel, _unknown } = (0, command_line_args_1.default)([{ name: 'pluginCommand', defaultOption: true }, ...CliOptions], { stopAtFirstUnknown: true, camelCase: true });
    const logger = (0, core_1.createLogger)(core_1.LogLevels.includes(logLevel) ? logLevel : 'error');
    if (pluginCommand === undefined) {
        // using normal log so user can't accidentally turn off usage text
        console.log(printUsage(availablePlugins));
        process.exit(0);
    }
    const selectedPlugin = availablePlugins.find((plugin) => plugin.name === pluginCommand);
    if (selectedPlugin === undefined) {
        logger.error(`plugin '${pluginCommand}' is not installed`);
        logger.error('see <insert url> for instructions to install plugins');
        // using normal log so user can't accidentally turn off usage text
        console.log(printUsage(availablePlugins));
        process.exit(1);
    }
};
exports.main = main;
