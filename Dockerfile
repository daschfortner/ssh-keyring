from node:24-alpine3.22@sha256:fef54ced750c979986c8e9caa5bce4e5be8cdf9101f07b995fa3197a41caf78c as build

copy . /build/ssh-keyring
workdir /build/ssh-keyring

run npm i && \
    npm run build --workspaces && \
    mkdir release && \
    npm pack --workspaces --pack-destination release

from node:24-alpine3.22@sha256:fef54ced750c979986c8e9caa5bce4e5be8cdf9101f07b995fa3197a41caf78c

copy --from=build /build/ssh-keyring/release /tmp/release

run npm i -g /tmp/release/*

run npm list -g

# TODO set up a non-root user so volume mounts don't come in with root perms

entrypoint ["ssh-keyring"]
