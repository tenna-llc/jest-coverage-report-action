FROM node:16

# /github/workspace is owned by the runner (uid 1001) but this container runs
# as root, so git 2.35.2+ refuses operations with "dubious ownership". Register
# it as safe in the system gitconfig (read regardless of HOME) so the action's
# base-branch fetch/checkout for coverage diffing works.
RUN git config --system --add safe.directory '*'

# The action runs `npm i` for both head and base branches. npm 8 reconciling an
# older (lockfileVersion 1) base-branch lockfile refetches registry metadata for
# the whole tree and exhausts Node's default ~2GB heap. Raise the limit.
ENV NODE_OPTIONS=--max-old-space-size=6144

COPY dist/index.js /index.js

ENTRYPOINT ["node", "/index.js"]
