FROM node:latest

RUN mkdir -p /home/nodeApp2
WORKDIR /home/nodeApp2

COPY package*.json /home/nodeApp2/

RUN npm install && \
  npm rebuild bcrypt --build-from-source

COPY . /home/nodeApp2/

EXPOSE 3000


CMD [ "npm", "run", "start.dev" ]


