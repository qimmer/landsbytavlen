# Your existing base image, e.g. node:20-slim
FROM node:20-slim

# Add ffmpeg install step
RUN apt-get update && apt-get install -y ffmpeg

# The rest of your existing Dockerfile, e.g.:
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build
CMD ["npm", "run", "start"]
