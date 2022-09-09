import { Peer } from "peerjs";
import type { DataConnection } from "peerjs";
import { MessageTypes, type Message } from "./messages";

export class Client {
  private static uniqueBullshit = "dasdasdasdasdasd-gdfsgdfsgdsf-";
  private peer: Peer;
  private messageListeners: ((message: Message<unknown>) => void)[] = [];
  private connections: DataConnection[] = [];
  private ready = false;
  private pendingConnections: string[] = [];
  private resolveConnection: ((value: void | PromiseLike<void>) => void) | undefined;
  private errorConnection: ((value: any) => void) | undefined;
  constructor(public name: string) {
    this.peer = new Peer(this.generatePeerId(name));
    this.peer.on("open", this.onPeerOpen.bind(this));
    this.peer.on("error", (error) => this.errorConnection ? this.errorConnection(error) : undefined);
  }

  sendMessage<T>(message: Message<T>) {
    this.connections.forEach((connection) => {
      console.log({message, peer: connection.peer})
      connection.send(message)
    });
  }
  addListener(listener: (message: Message<unknown>) => void) {
    this.messageListeners.push(listener);
  }

  destroy() {
    this.peer.destroy();
  }

  connect(other: string): Promise<void> {
    const connection = new Promise<void>((resolve, error) => { this.resolveConnection = resolve; this.errorConnection = error });
    if (this.ready) {
      this.unsafeConnect(other);
    } else {
      this.pendingConnections.push(other);
    }
    return connection;
  }

  getPeerName(peerId: string) {
    return peerId.replace(Client.uniqueBullshit, "");
  }
  private unsafeConnect(other: string) {
    console.log("unsafe")
    const connection = this.peer.connect(this.generatePeerId(other));
    connection.on("open",  ()=> this.resolveConnection!());
    this.connections.push(connection);
    connection.on("data", (data) => {
      const message = data as unknown as Message<unknown>;
      console.log(message);
      this.messageListeners.forEach((listener) => listener(message));
    });
    
    connection.on("error", (error) => this.errorConnection!(error as any));
    
  }
  private onPeerOpen() {
    this.ready = true;
    console.log("OPEN")
    if (this.pendingConnections.length !== 0) {
      console.log("pending message")
      this.pendingConnections.forEach(this.unsafeConnect.bind(this));
    }
    this.peer.on("connection", this.onPeerConection.bind(this));
  }

  private onPeerConection(dataConnection: DataConnection) {
    console.log("Connection");
    this.connections.push(dataConnection);
    dataConnection.on("data", (data) => {
      const message = data as unknown as Message<unknown>;
      this.messageListeners.forEach((listener) => listener(message));
    });
    dataConnection.on("close", () => {
      this.messageListeners.forEach((listener) => listener({messageType: MessageTypes.LEAVE_ROOM, message: dataConnection}));
      console.log("someoneClosed")
    });
  }

  private generatePeerId(name: string) {
    return Client.uniqueBullshit + name;
  }

  
}
