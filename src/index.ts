import I18N from '@core/misc/I18N';
import CardManager from '@core/cards/CardManager';
import Server from '@core/Server';
import Game from '@core/Game';
import Logger, {Log} from '@core/misc/Logger';

(async () => {
  const i18n = new I18N('./locales/');
  await i18n.load();
  i18n.setLocale('fr_FR');
  const cardManager = new CardManager();
  await cardManager.load();
  const server = new Server();
  server.fastify.get('/', async (request, reply) => {
    reply.type('application/json').code(200);
    return {
      cards: cardManager.getCards().map(card => ({
        ...card,
        name: i18n.t(`cards.${card.id}.name`),
        text: i18n.t(`cards.${card.id}.text`),
      })),
    };
  });
  await server.listen(8080);
})();

const game = new Game('player1', 'player2');
game.on('*', (event, params) => Log.info(event, params));
game.start();
