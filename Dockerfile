FROM node

WORKDIR /src/app

COPY . .

RUN npm install -g npm

RUN npm install

CMD npm run start

EXPOSE 3000