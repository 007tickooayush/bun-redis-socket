# Bun Redis Adapter

A project implementing load balancing using @socket.io/redis-adapter and Express as the server for handling HTTP requests and socket events.

## Description

This project aims to provide load balancing capabilities for socket.io applications using the @socket.io/redis-adapter package. It utilizes Express as the server to handle both HTTP requests and socket events.

## Features

- Load balancing of socket.io connections using @socket.io/redis-adapter
- Handling of HTTP requests using Express
- Handling of socket events using Express

## Installation

1. Clone the repository:

    ```bash
    git clone https://github.com/your-username/project-name.git
    ```

2. Install the dependencies:

    ```bash
    bun install
    ```

## Usage

1. Start the server:

    ```bash
    bun run dev
    ```

2. Access the application in your browser at `http://localhost:3002` or `http://localhost:3003`.

## Configuration

The following environment variables can be configured:

- `REDIS_URL`: The URL of the Redis server (default: `redis://localhost:6379`)
- `PORT`: The port on which the server should listen (default: `3002` or `3003`)

## License

N/A