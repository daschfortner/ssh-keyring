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
const exec = (0, util_1.promisify)(child_process_1.exec);
const loadPlugins = async () => {
    const { stdout } = await exec('npm list -g --json');
    const globalPackages = JSON.parse(stdout);
    console.log(globalPackages);
    const keyringPlugins = Object.keys(globalPackages.dependencies).filter((d) => d.startsWith('@ssh-keyring/plugin-'));
    const plugins = await Promise.all(keyringPlugins.map(async (plugin) => await import(plugin)));
    return plugins.map((p) => p.default.default);
};
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
    const cliOptions = [
        {
            name: 'pluginCommand',
            defaultOption: true,
            type: String,
        }
    ];
    const { pluginCommand, _unknown } = (0, command_line_args_1.default)(cliOptions, { stopAtFirstUnknown: true });
    if (pluginCommand === undefined) {
        console.log(printUsage(availablePlugins));
        process.exit(0);
    }
    const selectedPlugin = availablePlugins.find((plugin) => plugin.name === pluginCommand);
    if (selectedPlugin === undefined) {
        console.error(`plugin '${pluginCommand}' is not installed`);
        console.error('see <insert url> for instructions to install plugins');
        console.log(printUsage(availablePlugins));
        process.exit(1);
    }
    await selectedPlugin.run(_unknown ?? []);
};
exports.main = main;
