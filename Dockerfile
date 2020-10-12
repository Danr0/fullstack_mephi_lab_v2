FROM node:latest

RUN mkdir -p /home/nodeApp
WORKDIR /home/nodeApp

COPY package*.json /home/nodeApp/

RUN npm install

COPY . /home/nodeApp/

EXPOSE 3000

CMD ["npm", "rebuild", "bcrypt", "--build-from-source"]

CMD [ "npm", "run", "start.dev" ]


