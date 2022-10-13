import { Peer } from "peerjs";
import type { DataConnection } from "peerjs";
import { MessageTypes, type Message } from "./messages";

export class PeerClient {
  private static uniqueBullshit = "dasdasdasdasdasd1223gdfsgdfsgdsf23123";
  private static separator = "_"
  private peer: Peer;
  private messageListeners: ((message: Message<unknown>) => void)[] = [];
  private connections: DataConnection[] = [];
  private ready = false;
  private pendingConnections: string[] = [];
  private resolveConnection: ((value: void | PromiseLike<void>) => void) | undefined;
  private errorConnection: ((value: any) => void) | undefined;
  constructor(public roomName: string , public name: string | void = undefined) {
    this.peer = new Peer(this.generatePeerId(roomName, name));
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

  connect(room: string): Promise<void> {
    const connection = new Promise<void>((resolve, error) => { this.resolveConnection = resolve; this.errorConnection = error });
    if (this.ready) {
      this.unsafeConnect(room);
    } else {
      this.pendingConnections.push(room);
    }
    return connection;
  }

  getPeerName(peerId: string) {
    const parts = peerId.split(PeerClient.separator);
    let name;
    if (parts.length == 3) {
      name = parts[3];
    } else if (parts.length == 2) {
      name = parts[2];
    }
    return name;
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

  private generatePeerId(roomName: string, name: string | void ) {
    return roomName ? `${PeerClient.uniqueBullshit}${PeerClient.separator}${roomName}${PeerClient.separator}${name}` : `${PeerClient.uniqueBullshit}${PeerClient.separator}${roomName}`;
  }

  
}
