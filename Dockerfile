FROM node:16
 
WORKDIR /usr/src/app
 
# Copy root package.json and lockfile
COPY package.json ./
COPY package-lock.json ./
 
# Copy the docs package.json
COPY packages/foundation/package.json ./packages/foundation/package.json
 
RUN npm install
 
# Copy app source
COPY . .
 
EXPOSE 8080
 
CMD [ "node", "apps/docs/server.js" ]