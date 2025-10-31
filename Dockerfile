FROM node:20-alpine
WORKDIR /adameds-lab
COPY . .
ENV APPLICATION_HOST=0.0.0.0
ENV APPLICATION_PORT=8087
RUN npm install
EXPOSE ${APPLICATION_PORT}/tcp
CMD ["npm", "run", "start"]
