FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci --only=production

COPY . .

# build ts to js
RUN npm run build

EXPOSE 5000

CMD [ "npm", "start" ]
