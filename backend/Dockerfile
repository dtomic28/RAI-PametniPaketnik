# Use ARM-compatible Node.js LTS image
FROM --platform=linux/arm64/v8 node:18

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy app source
COPY . .

# Copy entrypoint script
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Expose app port
EXPOSE 3001

# Use entrypoint to check envs before starting
ENTRYPOINT ["/entrypoint.sh"]
CMD ["node", "bin/www"]
