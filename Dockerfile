FROM node:16

# /github/workspace is owned by the runner (uid 1001) but this container runs
# as root, so git 2.35.2+ refuses operations with "dubious ownership". Register
# it as safe in the system gitconfig (read regardless of HOME) so the action's
# base-branch fetch/checkout for coverage diffing works.
RUN git config --system --add safe.directory '*'

COPY dist/index.js /index.js

ENTRYPOINT ["node", "/index.js"]
