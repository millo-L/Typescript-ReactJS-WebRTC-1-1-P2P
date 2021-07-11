# Typescript-ReactJS-WebRTC-1-1-P2P

## Features
- 1:1 communication (peer to peer)
- React with Typescript
- Docker

## How to start
### 1. Docker version
```sh
# server use 8080 port
# web use 8085 port
# You can connect to http://localhost:8085
docker-compose up -d
```

### 2. Non-Docker version(Node.js and React.js)
You need to install Node.js
```sh
cd Typescript-ReactJS-WebRTC-1-1-P2P
npm install
node index.js
cd web
npm install
npm start
```

### More Details are in my blog...
- [Korean](https://millo-l.github.io/WebRTC-%EA%B5%AC%ED%98%84%ED%95%98%EA%B8%B0-1-1-P2P/)
- [English](https://millo-l.github.io/Implementing-WebRTC-using-ReactJS-and-Typescript-1-1-P2P/)
  

### Next Upload is...
- 1:N communication (peer to peer) https://github.com/Seung3837/Typescript-ReactJS-WebRTC-1-N-P2P
- 1:N communication (SFU Server as a MediaServer) https://github.com/Seung3837/Typescript-ReactJS-WebRTC-1-N-SFU
