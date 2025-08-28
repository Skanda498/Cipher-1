const localtunnel = require('localtunnel');

(async () => {
  const tunnel = await localtunnel({ port: 3000, subdomain: 'cipherapp123' }); // optional subdomain

  console.log('Your public URL is:', tunnel.url);

  tunnel.on('close', () => {
    console.log('Tunnel closed');
  });
})();
