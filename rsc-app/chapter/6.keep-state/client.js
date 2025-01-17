import { hydrateRoot } from 'react-dom/client';

const root = hydrateRoot(document, getInitialClientJSX());

function getInitialClientJSX() {
  const clientJSX = JSON.parse(window.__INITIAL_CLIENT_JSX_STRING__, parseJSX);
  return clientJSX;
}

function parseJSX(key, value) {
  if (value === '$RE') {
    return Symbol.for('react.element');
  } else if (typeof value === 'string' && value.startsWith('$$')) {
    return value.slice(1);
  } else {
    return value;
  }
}

let currentPathname = window.location.pathname;

async function navigate(pathname) {
  currentPathname = pathname;
  const clientJSX = await fetchClientJSX(pathname);
  if (pathname === currentPathname) {
    root.render(clientJSX);
  }
}

export async function fetchClientJSX(pathname) {
  const response = await fetch(pathname + '?jsx');
  const clientJSXString = await response.text();
  const clientJSX = JSON.parse(clientJSXString, parseJSX);
  return clientJSX;
}

window.addEventListener(
  'click',
  (e) => {
    // Only listen to link clicks.
    if (e.target.tagName !== 'A') {
      return;
    }
    // Ignore "open in a new tab".
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {
      return;
    }
    // Ignore external URLs.
    const href = e.target.getAttribute('href');
    if (!href.startsWith('/')) {
      return;
    }
    // Prevent the browser from reloading the page but update the URL.
    e.preventDefault();
    window.history.pushState(null, null, href);
    // Call our custom logic.
    navigate(href);
  },
  true
);

window.addEventListener('popstate', () => {
  navigate(window.location.pathname);
});
