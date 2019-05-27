FROM node:stretch AS build

WORKDIR /usr/src/app
COPY . .
RUN npm install
RUN cd ui && npm install
RUN cd ui && npm run build

FROM node:stretch AS production

WORKDIR /usr/src/app
COPY bin/ bin/
COPY src/ src/

RUN mkdir -p ui/build
COPY --from=build /usr/src/app/ui/build/ ui/build/

COPY package*.json ./
RUN npm install --production
RUN ln -sf ../node_modules/@agoric/swingset-vat/src ./src/

RUN useradd -m ssfactory
USER ssfactory

EXPOSE 8000
ENTRYPOINT ["./bin/ssfactory"]

