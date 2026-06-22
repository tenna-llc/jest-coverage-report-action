FROM node:16

COPY dist/index.js /index.js

ENTRYPOINT ["node", "/index.js"]
