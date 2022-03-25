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

## Software Design

### Server

#### Summary

* maintains cache of specified tree directories
* uses server-side events to send events with clients

#### Event Flow

* on start:
  * caches the tree directories specified in a memoized n-ary tree
* on runtime:
  * observers changes to specified tree directories
  * if client connection:
    * forward change events
  * updates the cached memoized tree structure
* on client connection:
  * dumps the tree structure to client
  * keep connection open for server-side events

### Client

#### Summary

* uses custom react hook to maintain cache of specified tree directories
* uses custom react hook to only updates components with change in direct children

#### Event Flow

* on new connection with server:
  * updates cached memoized tree structure
* on server-side event:
  * modifies tree structure to match event
* on update/modification to cached tree structure:
  * sends state update to component containing node affected by update/modification

## Software Design Journey

The software design for this project, to me, was much simpler than the implementation. 
I'm happy to say, though, that it helped me learn significant portions of Typescript and React in 2 days.

### Server

Initially, when I started working on the software's design, I cared about creating the server first.
Most of the heavy work consisting of retrieving the tree structure, observing it for any changes,
and sending those changes to a frontend was on the server's plate. 

So, I gave myself three different checkpoints related to creating that server.

#### Retrieve the tree structure of N directories

That checkpoint was rather straight forward. Directories are N-ary trees.
Accordingly, I retrieved the tree structure by traversing it, bottom-up.
That means I used a recursive approach, where I defined each node I arrived at
(starting from the root nodes passed as arguments) and, directly after, its children.
This defines the leaf nodes, first, before parent nodes are defined; thus, it is considered bottom-up.

While thinking of that recursive approach, it hit me, what if one of the directories passed as an argument
was actually a subdirectory of another directory passed as an argument? 
That means I would be retrieving the same subtree, twice!

With how large tree directories are, that's a really serious bottleneck.

Accordingly, I improved the initial solution I had by adding memoization to the mix.
Memoization allowed me to retrieve a pre-defined node for a specific path by utilizing a HashMap.
That meant increasing the space complexity, but considering the time improvements, it was definitely worth it.

Also, we want that to run before the server starts. So I did just that, and I cached the tree structure as well
as the memoized tree.

#### Observe the tree structure for changes

This checkpoint, as well, was rather simple. It required doing research to find relevant tools.
After some extensive research on which tools to use, I arrived at [chokidar](https://github.com/paulmillr/chokidar).

I used their documentation to write the relevant code to observe the specified directories.

Also, I used those events to keep my cached structure up-to-date, because I was able to create additions in O(1)
and deletions in O(num of children the delete node has) thanks to memoization.

Nothing fancy here. So, I'll just jump forward to the next checkpoint.

#### Send the changes to a frontend client

Alright, so we had our tree and our event handlers for changes. What's the best way to send that information
to a client?
I'll just repeat the thoughts that I had when thinking about the solution and whether each thought would work or not.

I went back to the requirements of the solution. The solution required reflecting changes as they took place.
So, we have one of two options: polling, or keeping a connection open with the client.

Although polling is possible on with low intervals, it's not a good solution because it is extremely wasteful of resources.
So, we'll definitely need to keep a connection open with the client.

I wasn't convinced, yet, about having a socket though. A socket is also pretty resource intensive, so I wanted to research
more about sockets to understand if there are good scalable ways to utilize them...

Then, I came across "Server-Side Events". Aha... That's exactly what I was looking for.

Server-Side Events were perfect in this case because the client isn't communicating with the server. 
So when the client connects to the server, they both keep that connection open and the client uses it to observe events
dispatched from the server to its active clients.

Great, so when the client first connects to my server, the server returns the latest cached tree structure (which we already had planned).
And then, once changes to the tree structure are observed, we send that event precisely.

So, if a file/folder was deleted or added, we inform the client of the type of that action, the path where the action was happening,
and any additional data (such as the file/folder which was just added).

Once I realized that's what I wanted to do, I simply followed a [digital ocean tutorial](https://www.digitalocean.com/community/tutorials/nodejs-server-sent-events-build-realtime-app) to do just that.

### Client

Once the events were being sent from the server, the remaining work was all related to the client.
That's where my lack of React knowledge presented some trouble; nothing hours of reading can't solve!

I already had an idea about React and how states are used to update components. So, I had a solution designed in mind.

I wanted to get the latest cached structure from the initial request and then update it in an efficient manner on the frontend.
Then, I'd be able to trigger updates for the specific components which are affected by the changes, instead of the entire tree.

This proved to be extremely difficult because I had all the following infront of me, with no way on how to proceed: states,
contexts, reducers, hooks, HOCs, and prop drilling... To calm myself down, I reminded myself that no initial solution is the best one.
So I created two new checkpoints to help me better understand how to get to the solution I had in mind.

#### Non-updating tree structure render

That was pretty straight forward. I used prop drilling to pass the necessary information down to their necessary components.

Let's jump forward.

#### Updating tree structure render

So, this was the most time consuming thing I've ever done in React to date (lol).

I spent so much time trying to understand why setting an object to the state was not triggering re-rendering of my components.
Finally, I started giving up on this approach and understanding why it wouldn't work. I slowly, then, started finding my way deeper into hooks.

Hooks are the best thing ever.

I ended up creating a custom hook and managed to solve my entire problem, while re-structuring my entire client code base, in a matter on an hour or so.

I, then, fell in love more with the custom hook and "over-engineered" things a little bit in order to get to the result I wanted.

I implemented a custom hook which returns a scope specific state. In addition, I created an effect hook to collect data from the event sourcer
and add everything into a memoized tree. This helped ensure that each client would only have a single connection to the server.

I'm really proud of this solution. So, I'd love to see me any criticism regarding it.