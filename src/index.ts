import I18N from '@core/misc/I18N';
import CardManager from '@core/cards/CardManager';
import Server from '@studimax/server';
import {Log} from '@studimax/logger';
import localizeCard from '@core/cards/LocalizedCard';
import {BodyParser} from '@studimax/server/src/Server';
import Lobby from '@core/Lobby';
import * as crypto from 'crypto';
import Booster from '@core/booster/Booster';

(async () => {
  const i18n = new I18N('./locales/', 'fr-fr');
  await i18n.load();
  Log.info('I18N catalog', i18n.getCatalog());
  Log.info('I18N locale', i18n.getLocale());
  i18n.verifyMissingKey();
  const cardManager = new CardManager();
  await cardManager.load();
  const server = new Server();
  const lobby = new Lobby(server);
  server
    .use(BodyParser)
    .get('/routes/:method?', ({params}) => server.getRoutes(params.method).map(({method, path}) => ({method, path})))
    .get('/', () => cardManager.getCards().map(card => localizeCard(card, i18n)))
    .get('/log', () => Log.logHistory.map((log, i) => `[${i}]\t${log.output}`).join('\n'))
    .get('/lobby', () => lobby.getRooms())
    .get('/booster/:seed?', ({params}) => new Booster(params.seed ?? crypto.randomUUID(), cardManager))
    .get('/test', () => {
      const booster = new Booster(crypto.randomUUID(), cardManager);
      let it = 0;
      while (it <= 100_000) {
        it++;
        const b = new Booster(crypto.randomUUID(), cardManager);
        if (b.hash === booster.hash) {
          return {
            it,
            a: booster,
            b,
          };
        }
      }
      return 'Not found same booster';
    });
  await server.listen(8080);
})();
