from argparse import ArgumentParser
from os import path, listdir, mkdir
from shutil import rmtree
from sys import exit
from json import dumps
from importlib import import_module
from pkgutil import iter_modules
import logging

from .configuration import load_configuration

import sshkeyring.plugin

# here we are using the plugin discovery strategy outlined here:
#   https://packaging.python.org/en/latest/guides/creating-and-discovering-plugins/#using-naming-convention
# ssh-keyring plugins follow the format:
#   ssh-keyring-plugin-*

# todo: switch to the entrypoint config: https://packaging.python.org/en/latest/guides/creating-and-discovering-plugins/#using-package-metadata

keyring_plugin_prefix = 'ssh-keyring-plugin-'

plugins = {
    name: import_module(name)
    for finder, name, ispkg
    in iter_modules(sshkeyring.plugin.__path__, sshkeyring.plugin.__name__ + ".")
}

#plugins = {
#    'git': 'test',
#    'azure': 'test',
#}

logger = logging.getLogger('ssh-keyring-cli')

def main():
    plugin_choices = plugins.keys()
    available_plugins_text = f'available plugins: {", ".join(plugin_choices)}' if len(plugin_choices) else 'no plugins installed'

    # todo: add an epilog to this that lists the available plugins
    parser = ArgumentParser(
        prog='ssh-keryring',
        description='Manage ssh keys in remote environments',
        epilog=available_plugins_text
    )

    parser.add_argument(
        '-r', '--remotes',
        help='path to the remotes configuration file',
        type=str,
    )

    parser.add_argument(
        '-o', '--output',
        help='output directory to save keys and ssh configs to',
        type=str,
        default='~/.ssh/keyring',
    )

    parser.add_argument(
        '-f', '--force',
        help='blow away output directory during deployment',
        type=bool,
        default=False,
    )

    parser.add_argument(
        '-l', '--log-level',
        help='the logging level to use',
        type=str,
        choices=['DEBUG', 'INFO', 'WARNING', 'ERROR'],
        default='WARN',
    )

    parser.add_argument(
        'plugin',
        help='plugin to use for remote deployment',
        choices=plugin_choices,
        type=str
    )

    arguments = parser.parse_args()

    logging.basicConfig()
    logger.setLevel(arguments.log_level)

    if path.isdir(arguments.output) and listdir(arguments.output):
        logger.debug(f"output directory '{arguments.output}' found")

        if not arguments.force:
            logger.error(f"output directory '{arguments.output}' exists")
            logger.error('use the -f/--force flag to overwrite directory')

            exit(1)

        logger.debug("proceeding to remove directory '{arguments.output}' to recreate configuration")

        try:
            rmtree(arguments.output)
            mkdir(arguments.output)
        except OSError as e:
            logger.error(f"output directory '{arguments.output}' could not be overwritten: {e}")

            exit(1)

    remotes_configuration = load_configuration(arguments.remotes)

    if remotes_configuration is None:
        logger.error('no remotes configuration found')

        exit(1)

    logger.debug(f'remotes configuration loaded: {dumps(remotes_configuration, indent=2)}')

    print(plugins[arguments.plugin].Plugin)

if __name__ == "__main__":
    main()
