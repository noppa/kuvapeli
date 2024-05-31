FROM node:20
RUN mkdir -p /app
WORKDIR /app
COPY . /app
RUN npm install
ENV NODE_ENV=production
RUN npm run build
RUN rm -rf node_modules web
RUN npm install --production
CMD [ "npm run server" ]
