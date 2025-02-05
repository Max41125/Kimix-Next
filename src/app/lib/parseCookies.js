// src/app/lib/parseCookies.js

import Cookies from 'cookies';

const parseCookies = (ctx) => {
  if (typeof window !== 'undefined') {
    // На клиентской стороне используем document.cookie
    return document.cookie.split(';').reduce((cookies, cookie) => {
      const [name, value] = cookie.split('=');
      cookies[name.trim()] = value;
      return cookies;
    }, {});
  } else if (ctx) {
    // На серверной стороне, используем Cookies с req, res
    const cookies = new Cookies(ctx.req, ctx.res);
    return cookies.getAll();
  }
  return {};
};

export default parseCookies;
