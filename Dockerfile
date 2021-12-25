FROM node:14-slim
WORKDIR /usr/src/app
COPY . .
RUN npm i
RUN npm audit fix
RUN echo '$_FIREBASE' >> src/environments/environment.prod.json
RUN npm run build:ssr
CMD ["npm", "run", "serve:ssr"]
