FROM node:latest
WORKDIR /app
COPY . /app
RUN npm install
EXPOSE 4000
ENTRYPOINT ["npm","start"]
