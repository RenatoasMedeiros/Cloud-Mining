# Dashboard

### Install dependencies
```pwsh
$ yarn install
```

### Development
```pwsh
$ yarn dev
```

## Docker
At the root of the project
```
docker build -t dashboard-image .
```
To run the image
```pwsh
$ docker run \
    -p 8080:80
    --name dashboard-container
    -e VITE_API_URL=https://api.com \
    -e VITE_WS_URL=https://ws.com \
    dashboard-image
```

It should be up and running at [http://localhost:8080](http://localhost:8080)
