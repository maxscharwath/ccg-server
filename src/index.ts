import I18N from '@core/misc/I18N';
import CardManager from '@core/cards/CardManager';
import Server from '@core/Server';
import Game from '@core/Game';
import {Log} from '@core/misc/Logger';

(async () => {
  const i18n = new I18N('./locales/', 'fr_FR');
  await i18n.load();
  const cardManager = new CardManager();
  await cardManager.load();
  const server = new Server();
  server.fastify.get('/', async (request, reply) => {
    reply.type('application/json').code(200);
    return {
      cards: cardManager.getCards().map(card => ({
        ...card,
        name: i18n.t(`cards.${card.id}.name`, card.name),
        text: i18n.t(`cards.${card.id}.text`, card.text),
      })),
    };
  });

  const game = new Game('player1', 'player2');
  game.on('*', (event, params) => {
    Log.info(event, params);
    server.ws.clients.forEach(client => {
      client.send(JSON.stringify({event, params}));
    });
  });
  game.start();
  await server.listen(8080);
})();
