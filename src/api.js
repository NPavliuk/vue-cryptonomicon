const API_KEY = 'd4e4c4ab567a8ffee1a04b3b12a9ef5597beb6f31eb176f4ecc6102461d6fc94';
const UPDATE_DELAY = 5000;

const tickersHandlers = new Map();

export const getCoins = async () => {
  const res = await fetch(`https://min-api.cryptocompare.com/data/all/coinlist?summary=true&api_key${API_KEY}`);
  return res.json();
};

const loadTickers = () => {
  if (tickersHandlers.size === 0) {
    return;
  }

  fetch(
    `https://min-api.cryptocompare.com/data/pricemulti?fsyms=${[
      ...tickersHandlers.keys()
    ].join(",")}&tsyms=USD&api_key=${API_KEY}`
  )
    .then(r => r.json())
    .then(rawData => {
      const updatedPrices = Object.fromEntries(
        Object.entries(rawData).map(([key, value]) => [key, value.USD])
      );

      Object.entries(updatedPrices).forEach(([currency, newPrice]) => {
        const handlers = tickersHandlers.get(currency) ?? [];
        handlers.forEach(fn => fn(newPrice));
      });
    });
};


export const subscribeToTicker = (ticker, cb) => {
  const subscribers = tickersHandlers.get(ticker) || [];
  tickersHandlers.set(ticker, [...subscribers, cb]);
};

export const unsubscribeFromTicker = ticker => {
  tickersHandlers.delete(ticker);
};

setInterval(loadTickers, UPDATE_DELAY);
// setTimeout(loadTickers, 0);

