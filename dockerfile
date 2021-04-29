FROM node
RUN mkdir -p /usr/src/app

COPY . /usr/src/app
WORKDIR /usr/src/app

RUN cd /backend npm install
# RUN npm run typeorm -- migration:run

CMD npm start