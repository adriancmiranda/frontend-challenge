FROM node:carbon

RUN apt-get update
RUN apt-get upgrade -y
RUN apt-get -y install libcap2-bin autoconf automake libtool nasm make pkg-config git apt-utils
RUN setcap cap_net_bind_service=+ep `readlink -f \`which node\``

LABEL maintainer Adrian C. Miranda <adriancmiranda@gmail.com>

RUN mkdir -p /usr/src/app/
WORKDIR /usr/src/app/

RUN npm -v
RUN node -v

COPY package*.json /usr/src/app/

RUN npm install --only=production

CMD [ "npm", "run", "build" ]

RUN npm ci --only=production

COPY . /usr/src/app/

RUN find .bin -not -path "*.config.*" -type f -exec chmod +x {} \

EXPOSE 80

CMD [ "npm", "run", "docker" ]
