# Use the official Node.js image as a base image
FROM node:18-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy the package.json and package-lock.json (or yarn.lock) files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the entire project folder to the working directory
COPY . .

# Expose the port Next.js will run on
EXPOSE 3000

# Set the environment variable to development
ENV NODE_ENV=development

# Start the Next.js application in development mode
CMD ["npm", "run", "dev"]
