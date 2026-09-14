FROM node:24-bookworm-slim
WORKDIR /var/www/app
COPY --chown=node:node package*.json ./
RUN npm ci --ignore-scripts
COPY --chown=node:node . .
USER node
EXPOSE 5000
CMD ["npm", "start"]
