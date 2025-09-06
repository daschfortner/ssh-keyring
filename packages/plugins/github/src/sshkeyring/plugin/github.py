from typing import Optional


class Plugin:
    def upload_key(public_key: str, remote: dict) -> Optional[dict]:
        print('ran the github plugin')
