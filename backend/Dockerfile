# 1. Use a lightweight Node.js image
FROM node:18-alpine

# 2. Set the working directory inside the container
WORKDIR /app

# 3. Copy only the package files first (better for caching)
COPY package*.json ./

# 4. Install dependencies
RUN npm install

# 5. Copy your actual backend code (index.js, etc.)
COPY . .

# 6. Azure uses dynamic ports, so we don't hardcode 5000 here.
# We expose a common port, but the CMD will handle the dynamic one.
EXPOSE 8080

# 7. Start the server
CMD ["node", "index.js"]