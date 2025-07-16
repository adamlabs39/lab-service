FROM node:19.5.0-alpine
WORKDIR /adameds-lab
COPY . .
ENV APPLICATION_HOST=0.0.0.0
ENV APPLICATION_PORT=8090
RUN npm install
EXPOSE ${APPLICATION_PORT}/tcp
# CMD ["npm", "run", "start"]
CMD ["sh", "-c", "infisical run --env=development -- npm run start"]
