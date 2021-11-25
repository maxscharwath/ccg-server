//TODO for testing purposes

import Server from '@studimax/server';
import {WebSocket, WebSocketServer} from 'ws';
import {match} from 'path-to-regexp';
import {Request} from '@studimax/server/src/Request';
import {Socket} from 'net';
import Game from '@core/Game';
import MinionCard from '@core/cards/MinionCard';
import {Log} from '@studimax/logger';
import CardManager from '@core/cards/CardManager';

class Room {
  private players: WebSocket[] = [];

  addPlayer(ws: WebSocket) {
    if (this.players.length >= 2) {
      throw new Error('Room is full');
    }
    this.players.push(ws);
    if (this.players.length === 2) {
      this.#onReady();
    }
  }

  async #onReady() {
    const cardManager = new CardManager();
    await cardManager.load();
    const game = new Game();
    this.players.forEach((ws, index) => {
      const hero = game.heroes[index];
      ws.on('message', async (msg: string) => {
        const {event, data} = JSON.parse(msg);
        Log.info(event, data);
        if (!hero.isMyTurn()) return;
        switch (event) {
          case 'playCard':
            {
              const card = cardManager.getCardById(data.card);
              if (card) {
                hero.playCard(card as MinionCard, {position: data.position});
              }
            }
            break;
          case 'skip':
            await game.skipTurn();
            break;
        }
      });
    });
    game.on('*', async (event, data) => {
      this.players.forEach(ws => {
        ws.send(event);
      });
    });
    game.start();
  }
}

export default class Lobby {
  public rooms = new Map<string, Room>();

  constructor(server: Server) {
    const wss = new WebSocketServer({noServer: true});
    server.on('upgrade', (req: Request, socket: Socket, head: Buffer) => {
      const result = match<{uuid: string}>('/:uuid')(req.url ?? '');
      if (!result) {
        return socket.destroy();
      }
      const {uuid} = result.params;
      if (!this.rooms.has(uuid)) {
        this.rooms.set(uuid, new Room());
      }
      const room = this.rooms.get(uuid)!;
      wss.handleUpgrade(req, socket, head, ws => {
        room.addPlayer(ws);
        ws.emit('connection', ws, req);
      });
    });
  }

  public getRooms(): string[] {
    return Array.from(this.rooms.keys());
  }
}
