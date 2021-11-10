import I18N from '@core/misc/I18N';
import CardManager from '@core/cards/CardManager';
import Server from '@core/Server';
import Game from '@core/Game';
import {Log} from '@studimax/logger';
import localizeCard from '@core/cards/LocalizedCard';
import Minion from '@core/Minion';

(async () => {
  const i18n = new I18N('./locales/', 'fr-fr');
  await i18n.load();
  Log.info('I18N catalog', i18n.getCatalog());
  Log.info('I18N locale', i18n.getLocale());
  i18n.verifyMissingKey();
  const cardManager = new CardManager();
  await cardManager.load();
  const server = new Server();
  server.fastify.get('/', async (request, reply) => {
    reply.type('application/json').code(200);
    const cards = cardManager.getCards().map(card => localizeCard(card, i18n));
    return {
      cards,
    };
  });
  const minion = Minion.fromCard(cardManager.getCardById(1));
  console.log(JSON.stringify(minion));
  minion.attackTarget(minion);
  console.log(JSON.stringify(minion));
  const game = new Game();
  game.on('*', (event, params) => {
    Log.info(event, params);
    server.ws.clients.forEach(client => {
      client.send(JSON.stringify({event, params}));
    });
  });
  game.start();
  await server.listen(8080);
})();
