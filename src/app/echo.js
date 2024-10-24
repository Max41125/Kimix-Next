// echo.js
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

window.Pusher = Pusher;

const echo = new Echo({
  broadcaster: 'pusher',
  key: 'a511ccd3ff6dbde81a48',
  cluster: 'eu',
  forceTLS: true,
  authEndpoint: 'https://test.kimix.space/broadcasting/auth',

});

export default echo;
