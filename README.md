# urban-tree
Web tree file explorer client and server

## Get Started

### Clone Repository

Cloning is a pretty standard task, but if you need a hand, you can find the command below (uses HTTPS).

```sh
git clone https://github.com/nizarmah/urban-tree.git
```

Make sure to cd into the cloned project after.

### Specify Node Version

Initially, make sure you have [Node Version Manager](https://github.com/nvm-sh/nvm) installed.

```sh
nvm --version
```

Once you ensure that you have `nvm`, you'll want to install the version we're using here.

```sh
nvm install
```

Now that we've installed the version being used by this repository, let's officially use it.

```sh
nvm use
```

### Setup the Server

We've already prepared a guide for you to set things up.
Go checkout the [urban-tree/server guide](server/README.md).

### Setup the Client

We've already prepared a guide for you to set things up.
Go checkout the [urban-tree/client guide](client/README.md).

## Alternative Setups

### Docker Compose

As much as I love docker container orchestration, this can't be the standard build method
because we need to pass the directories we want to watch as command line arguments.

Fortunately, even though we're using docker compose, there's still a pretty neat way to do it.

But, beware, you'll need to get your hands dirty with some code.

#### Collect paths for directories of interest

To make the next steps easier for us, it's handful to have a list of the directories of interest (DOIs)
that we want the server to observe.

For example, below is a list of my DOIs.

```
~/Downloads/temp/
~/Downloads/temp/hello/
```

#### Allow docker read-only access for directories of interest

There's a method called volume mounting, which we'll be using. The idea behind it is that the docker
container will have access to the files on our system. You can also specify the access mode:

* `ro`: read-only
* `rw`: read-write

In this case, we want to go for read-only. Not only is it safer, but we don't really have any reason
for more access.

Volume mounting requires specifying a source, a target, and the access mode. That is done through
the following format: `[SOURCE:]TARGET[:MODE]`, [ref](https://docs.docker.com/compose/compose-file/compose-file-v3/#volumes).

A location which everyone in a system has access to is: `/tmp/`. Accordingly, we'll be mounting our
DOIs there.

For example, below is a list of my DOIs, their targets, and their access mode following the format:
`SOURCE:TARGET:MODE`.

```
  - ~/Downloads/temp/:/tmp/Downloads/temp/:ro
  - ~/Downloads/temp/hello:/tmp/Downloads/temp/hello/:ro
```

#### Add directories of interest to Docker Compose

The final step is quite simple, we'll just need to edit `docker-compose.yml` to mount these
DOIS and pass them as arguments to the server.

Conveniently, the list of DOIs, targets, and access modes from the previous step fit great under
the `server`'s `volumes`.

Also, we'll need to add the targets to the `entrypoint`.

Here's a _before and after_ to help guide you through it:

##### Before

```yml
server:
    container_name: nodejs
    entrypoint: sh -c "npm ci && npm run deploy"
    ...
    volumes:
        - ./server/:/usr/src/app
```

##### After

```yml
server:
    container_name: nodejs
    entrypoint: sh -c "npm ci && npm run deploy /tmp/Downloads/temp /tmp/Downloads/temp/hello"
    ...
    volumes:
        - ./server/:/usr/src/app
        - ~/Downloads/temp/:/tmp/Downloads/temp/:ro
        - ~/Downloads/temp/hello:/tmp/Downloads/temp/hello/:ro
```

#### Run Docker Compose

Phew! Nice going... What's left is to just run docker compose.

Please make sure you're in this directory; otherwise, it won't work.

```sh
docker-compose up
```

Now, you can make changes to these DOIs through your file explorer while docker takes care of the rest.