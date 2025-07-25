FROM node:20-alpine
WORKDIR /adameds-lab
COPY . .
ENV APPLICATION_HOST=0.0.0.0
ENV APPLICATION_PORT=8090
RUN npm install
RUN npm install -g @infisical/cli --ignore-scripts
EXPOSE ${APPLICATION_PORT}/tcp
CMD ["sh", "-c", "infisical run --env=development -- npm run start"]
