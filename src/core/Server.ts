import {WebSocketServer} from 'ws';
import {IncomingMessage} from 'http';
import {Socket} from 'net';
import Fastify, {FastifyInstance, FastifyServerOptions} from 'fastify';

export default class Server {
  public fastify: FastifyInstance;
  public ws: WebSocketServer;

  constructor(opts?: FastifyServerOptions) {
    this.fastify = Fastify(opts);
    this.ws = new WebSocketServer({noServer: true});
    this.fastify.server.on(
      'upgrade',
      (request: IncomingMessage, socket: Socket, head: Buffer) => {
        this.ws.handleUpgrade(request, socket, head, ws => {
          this.ws.emit('connection', ws, request);
        });
      }
    );
  }

  public listen(port: number) {
    return this.fastify.listen(port);
  }
}
