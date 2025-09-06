from typing import Optional
from os import path
import logging
from toml import loads, TomlDecodeError

logger = logging.getLogger('ssh-keyring-cli')


# todo: do schema validation here

def load_configuration(remotes_file: Optional[str]) -> Optional[dict]:
    remotes_paths = [
        remotes_file,
        '~/.ssh/remotes',
        '~/.ssh/remotes.toml',
        '~/.config/ssh-keyring/remotes',
        '~/.config/ssh-keyring/remotes.toml',
        '~/.remotes',
        '~/.remotes.toml'
    ]

    sanitized_remotes_paths = [path.expanduser(p) for p in remotes_paths if p is not None]

    for remotes_path in sanitized_remotes_paths:
        if path.exists(remotes_path):
            try:
                with open(remotes_path, 'r') as remotes:
                    return loads(remotes.read())
            except OSError as e:
                logger.debug(f"failed to load remotes file '{remotes_path}': {e}")

                continue
            except TomlDecodeError as e:
                logger.debug(f"could not parse remotes file '{remotes_path}': {e}")

                continue

    return None
