FROM node:current-alpine

#we need curl and jq
RUN apk add --no-cache curl jq && rm -rf /tmp/*

#download latest heatsheet from github
RUN curl -L https://github.com/orangecoding/heatsheet/archive/refs/heads/master.zip --output temp.zip
RUN unzip temp.zip
#copy to /app folder
RUN cp -r heatsheet-master /app
RUN rm -r temp.zip heatsheet-master

WORKDIR /app

#install dependencies
RUN npm install

#we need to move the config folder in order to mount it as a bind volume in docker-compose
RUN mv config config-example

COPY entrypoint.sh /
ENTRYPOINT ["/entrypoint.sh"]

#run it
CMD [ "yarn", "run", "start" ]

EXPOSE 9999