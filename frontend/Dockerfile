# Use Node.js base image to build and serve React app
FROM node:18-alpine

# Set working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to install dependencies
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application files
COPY . .

# Build the React app for production
RUN npm run build

# Install 'serve' globally to serve the app
RUN npm install -g serve

# Expose the port that the app will run on (default serve port is 3000)
EXPOSE 3000

# Start the app using 'serve' (defaults to serving the 'build' folder)
CMD ["serve", "-s", "build", "-l", "3000"]
