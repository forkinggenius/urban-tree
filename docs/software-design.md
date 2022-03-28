# Software Design

## Abstract

Explores building a file explorer tree view with multiple collapsible sections, which takes multiple paths to local directories as command-line arguments, by utilizing server-side events to provide live updates of these changes.
In-memory cached structure of the directory trees is stored on both the server and client end and is also updated as different operations are executed in said local directories.

## Specification

Build a “vs-code like” file explorer tree view with multiple collapsible sections.
The program needs to take as an argument one or multiple paths to local directories.
Each directory needs to be represented as an independent section in the rendered file explorer.
When a file on the host is deleted, added, removed or renamed within one of the specified directories, changes should be reflected in the rendered file explorer.
The file explorer component should be rendered in a web browser. 

## Proposed Solution

Creating a file explorer tree view would require isolating the different responsibilities handled by a server and a client service.

Unfortunately, the browser's safe sandboxed execution environment prevents any client-sided applications from accessing the files on disks.
Accordingly, it is important to rely on a server to provide access to the specified file directories.
A server would also be able to observe the local directories for any file changes.
Moreover, if, in the future, there's any interest in providing the ability to modify directories or files, a server would be capable of handling that task as well.

Meanwhile, the client's responsibilities would be to communicate with the server and render the tree view of the server's shared local directories.

### Server-Side Cached Directories

For the client to render the directories, the server needs to communicate the tree structure of said directories.
Accordingly, the server will need to traverse the specified directories to be aware of their structure.

However, the local directories specified are passed as command-line arguments according to the specification.
Therefore, it's more efficient to traverse the local directories once and maintain their server-side cached version than to repeatedly traverse the local directories per client request.

Accordingly, upon running, the server should handle traversing the specified directories and create a copy of them in memory, which will be updated according to observed changes in said directories during the server's run-time.

### Client-Server Communication

#### Protocol

The client-server communication protocol can take different forms which mainly are:

##### Polling

There are two different types of polling: short polling and long polling.

Short polling involves issuing new requests to the server, repeatedly, checking for new updates.
The client sends a request to the server, to which the server instantly responds.
After the connection is closed, a new connection is opened instantly or after a specific period of time.
Accordingly, this can generate a lot of traffic and can be quite costly on resources.
Therefore, it's not quite recommended.

Long polling, on the other hand, involves issuing a request to the server with the expectation that the server may not respond immediately.
In this case the connection remains open until it either times out or the server responds with updates.
A new connection is, then, either instantly opened or after a specific period of time.

In this case, long polling would potentially work as a solution if the client instantly opens new requests after closed ones.
However, long polling isn't the ideal solution. 
We'll cover that in the upcoming segments.

##### Web Sockets

Web sockets is a protocol that provides two-way communication between the server and the client over an open channel (single connection) between them.

Web sockets is an ideal solution for real-time communication between a server and a client.
It allows both parties to send and receive data at any time.

For this case, however, a two-way communication is a little bit of an overkill.

According to the specification, the file changes occuring to the specified directories are expected to be done on the host and not through the web-client file explorer.
Since the specification does not specify being able to do any file operations through the web-client, there is no need for having a two-way communication. The client isn't expected to send any information to the server, but only to receive updates from the server about any file operations done on the host.

So, web sockets also isn't the ideal solution in this case.
We'll cover a better option that in the upcoming segment.

##### Server-Sent Events

Server-sent events is a one way communication channel where events flow from the server to the client.
The client subscribes to the server's stream of events and the server will stream any events until the connection is closed by one of the two parties.

Server sent events also provide a near real-time transmission of information from the server to the client.

Since it's one-way and near real-time, it is a more ideal solution compared to Web Sockets. 

Meanwhile, while long polling requires re-opening connections after the connection times-out or the client receives updates, server-sent events doesn't require that.
When a client subscribes to a server's stream of events, the connection remains open between the two while information is transmitted.
Also, since the server keeps track of that connection, the connection, usually, does not time out.
This makes server-sent events also a better solution compared to long polling.

#### Format

In order to maintain efficient and cost effective communication between the client and the server, it's important to stay aware of the format of said communication. 

Realistically, for the client to be aware of the tree file structure of the specified directories, the structure will have to be delivered by the server when the connection is initially opened between the two.
Accordingly, once the client subscribes to the server, the initial data sent by the server has to be a "dump" of its server-side cached directories.

As file operations on the host are recorded by the server, data containing the changes can be communicated to the server in two different ways.

In both cases, small reminder that the server is already expected to store a cached tree structure copy of the directories which is maintained and kept up-to-date by observing for file operations in the specified directories on the host.

##### Entire Updated Structure

This approach keeps the heavy work on the server, by expecting the server to dump the _entire_ updated structure again after events triggered by file operations and handled on the server.

This approach is not recommended though, because the size of the data being transmitted is large.
In addition, the client will be responsible for either diffing the old structure against the new one or rendering the entire new structure, again.

This can be extremely inefficient and costly on resources as the size of the specified directories increase.

##### Specific File Operation

This approach distributes the work on both the server and the client by expectin the client to maintain its own copy of the tree structure of directories.

Initially, the server already would be sending the entire tree structure copy of the directories.
In this case, however, the client creates its own copy of the tree structure from the received data.

By having its own structure, now we can transmit _only_ the file operation event triggered on the host from the server to the client.
Then, based on whether the operation was a delete or create file operation, the client can apply that same operation on its copied tree structure.

This allows for transmitting a lot less information and updating _only_ the directory directly affected by that file operation.
For example, if a file is created or deleted, only the direct directory of that specified path (the one directly containing the file) would be updated.

This is the recommended solution, as we don't have to compute the diff between the previous structure and the updated one because it's already given to us through the server's file operation observers.