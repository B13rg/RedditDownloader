title: Docker

# Docker

By default the service will run on port `7505`.
This can be changed by modifying the settings file, located in `/storage/config/settings.json`.

## Using Docker

There are two mountpoints, one for data and one for configuration.
* Data container directory: `/download`
* Config container directory: `/storage/config`

## Building and running yourself

```bash
docker run --rm -p 127.0.0.1:7505:7505 -v ./data:/download -v ./config:/storage/config $(docker build -q .)
```

## Running latest published image

```bash
docker run -p 127.0.0.1:7505:7505 -v ./data:/download -v ./config:/storage/config shadowmoose/redditdownloader:latest
```

To expose port publicly:

```bash
docker run -p 127.0.0.1:7505:7505 -v ./data:/download -v ./config:/storage/config shadowmoose/redditdownloader:latest
```

## Using Docker Compose

There are two docker-compose files in this repository.
`docker-compose-local.yml` builds the dockerfile locally and runs it.
You can do this wil the following command:

```bash
docker-compose -f docker-compose-local.yml up --build --detach
```

`docker-compose.yml` pulls the latest public image, and runs that.
You can do this with the following command:

```bash
docker-compose -f docker-compose.yml up --detach
# or
docker-compose up -d
```

