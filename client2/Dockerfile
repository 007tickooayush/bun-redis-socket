FROM oven/bun:latest
WORKDIR /home/bun/app
# Copy package.json and package-lock.json to the working directory
COPY ./package.json .
# Install project dependencies
RUN bun install

# Copy the rest of the project files to the working directory
COPY . .
# Expose the port that the application will run on
EXPOSE 5174
# Define the command to run the application with hot reload
CMD [ "bun", "run", "dev" ]
