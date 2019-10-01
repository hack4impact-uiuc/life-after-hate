FROM node:12.10.0

WORKDIR '/var/www/app'
# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

RUN npm install
# If you are building your code for production
# RUN npm ci --only=production
# Bundle app source
COPY . .
EXPOSE 3000
ENV NODE_ENV production
CMD [ "npm", "start" ]

