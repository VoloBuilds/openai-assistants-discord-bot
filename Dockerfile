# Use the official Node.js alpine image as a parent image
FROM node:slim

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy the package.json and package-lock.json files
COPY package*.json ./
COPY .env ./
# Install only production dependencies and build the app (if necessary)
RUN npm install --only=production

# Copy the rest of the application's code
COPY . .

# Use an unprivileged user to run the app
USER node

# Your app binds to port 3000, so use the EXPOSE instruction to have it mapped by docker daemon
EXPOSE 3000

# Define the command to run your app using CMD which defines your runtime
CMD [ "node", "bot.js" ]