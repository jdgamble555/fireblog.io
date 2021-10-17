FROM node:14
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm i
RUN npm audit fix
COPY . .
RUN npm run build:ssr
CMD ["npm", "run", "serve:ssr"]
