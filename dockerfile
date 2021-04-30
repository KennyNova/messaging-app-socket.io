FROM node
RUN mkdir -p /usr/src/app

COPY . /usr/src/app
WORKDIR /usr/src/app

RUN cd /backend npm install

CMD npm start