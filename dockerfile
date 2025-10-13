FROM node:alpine
WORKDIR /
COPY package.json .
RUN npm install
COPY . . .
RUN npm run build
EXPOSE 5010
CMD ["npm","run","start"]