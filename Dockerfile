FROM node:stretch AS build

WORKDIR /usr/src/app
COPY . .
RUN npm install
RUN cd ui && npm install
RUN cd ui && npm run build

FROM node:stretch AS install

WORKDIR /usr/src/app
COPY bin/ bin/
COPY src/ src/

RUN mkdir ui/
COPY --from=build /usr/src/app/ui/build/ ui/build/

COPY package*.json ./
RUN npm install --production
RUN ln -sf $PWD/node_modules/@agoric/swingset-vat/src ./src/

EXPOSE 8000
ENTRYPOINT ["bash", "-c", "./bin/ssfactory"]
