import { decrypt, deriveKey } from './crypto.js';
import { API_BASE_URL } from './config.js';

const API = API_BASE_URL;
const site = document.querySelector('#site');
const message = document.querySelector('#message');
const form = document.querySelector('#unlock');
const matches = document.querySelector('#matches');
const entries = document.querySelector('#entries');
const submitButton = form.querySelector('button');

let activeTab;
let unlockedEntries = [];

async function currentTab() {
  [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
  site.textContent = activeTab?.url
    ? new URL(activeTab.url).hostname
    : 'Unsupported page';
}

function report(text) {
  message.textContent = text;
}

async function getSessionToken() {
  const result = await chrome.storage.session.get('vaultoraExtensionToken');
  return result.vaultoraExtensionToken || null;
}

async function setSessionToken(token) {
  await chrome.storage.session.set({ vaultoraExtensionToken: token });
}

async function clearSessionToken() {
  await chrome.storage.session.remove('vaultoraExtensionToken');
}

async function authorizedFetch(path, options = {}) {
  const token = await getSessionToken();
  if (!token) return null;

  const response = await fetch(`${API}${path}`, {
    ...options,
    headers: {
      ...(options.headers || {}),
      Authorization: `Bearer ${token}`
    }
  });

  if (response.status === 401) {
    await clearSessionToken();
    return null;
  }

  return response;
}

function matchingLogins(items) {
  if (!activeTab?.url) return [];

  let current;
  try {
    current = new URL(activeTab.url);
  } catch {
    return [];
  }

  if (!/^https?:$/i.test(current.protocol)) return [];

  const hostname = current.hostname.toLowerCase().replace(/^www\./, '');

  return items
    .filter(item => (item.type === 'login' || !item.type) && item.secret)
    .filter(item => {
      try {
        const raw = item.website.includes('://')
          ? item.website
          : `https://${item.website}`;
        const saved = new URL(raw);

        if (!/^https?:$/i.test(saved.protocol)) return false;

        const savedHost = saved.hostname.toLowerCase().replace(/^www\./, '');
        return savedHost === hostname;
      } catch {
        return false;
      }
    });
}

function render(items) {
  entries.replaceChildren();

  if (!items.length) {
    matches.hidden = false;
    report('No saved login matches this site.');
    return;
  }

  matches.hidden = false;
  report('');

  items.forEach(item => {
    const button = document.createElement('button');
    button.className = 'entry';
    button.textContent = item.title;

    const detail = document.createElement('span');
    detail.textContent = item.username || 'No username';
    button.append(detail);

    button.addEventListener('click', () => fill(item));
    entries.append(button);
  });
}

async function fill(item) {
  if (!activeTab?.id) {
    report('No active page is available.');
    return;
  }

  try {
    const results = await chrome.scripting.executeScript({
      target: { tabId: activeTab.id },
      func: (username, secret) => {
        const setInput = (input, value) => {
          const setter = Object.getOwnPropertyDescriptor(
            HTMLInputElement.prototype,
            'value'
          )?.set;

          if (!setter) return false;

          setter.call(input, value);
          input.dispatchEvent(new Event('input', { bubbles: true }));
          input.dispatchEvent(new Event('change', { bubbles: true }));
          return true;
        };

        const password = document.querySelector('input[type="password"]');
        const usernameInput = document.querySelector(
          'input[autocomplete="username"], input[type="email"], input[name*="user" i], input[name*="email" i]'
        );

        const usernameFilled = usernameInput && username
          ? setInput(usernameInput, username)
          : false;

        const passwordFilled = password && secret
          ? setInput(password, secret)
          : false;

        return { filled: Boolean(usernameFilled || passwordFilled) };
      },
      args: [item.username || '', item.secret || item.password || '']
    });

    report(
      results?.[0]?.result?.filled
        ? 'Filled. Review the form before signing in.'
        : 'No compatible login fields were found.'
    );
  } catch {
    report('This page cannot be filled. Try a normal HTTPS page and reopen the extension.');
  }
}

async function loginExtension(email, accountPassword) {
  const response = await fetch(`${API}/auth/extension-login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email,
      password: accountPassword
    })
  });

  if (!response.ok) {
    throw new Error('Account sign-in failed.');
  }

  const result = await response.json();
  await setSessionToken(result.token);
}

async function unlockWithVault(masterPassword) {
  const response = await authorizedFetch('/vault');

  if (!response) {
    throw new Error('AUTH_REQUIRED');
  }

  if (response.status === 204) {
    return [];
  }

  if (!response.ok) {
    throw new Error('Encrypted vault not found.');
  }

  const vault = await response.json();
  const key = await deriveKey(masterPassword, vault.salt);
  return decrypt(vault, key);
}

async function unlockFlow(email, accountPassword, masterPassword) {
  try {
    return await unlockWithVault(masterPassword);
  } catch (error) {
    if (error.message !== 'AUTH_REQUIRED') throw error;

    await loginExtension(email, accountPassword);
    return unlockWithVault(masterPassword);
  }
}

form.addEventListener('submit', async event => {
  event.preventDefault();
  submitButton.disabled = true;
  report('Unlocking locally…');

  try {
    const data = new FormData(form);

    unlockedEntries = await unlockFlow(
      data.get('email'),
      data.get('accountPassword'),
      data.get('masterPassword')
    );

    render(matchingLogins(unlockedEntries));
  } catch (error) {
    await clearSessionToken();

    unlockedEntries = [];
    entries.replaceChildren();

    report(
      error.message === 'Account sign-in failed.'
        ? error.message
        : 'Could not authenticate or unlock the vault.'
    );
  } finally {
    form.querySelector('#masterPassword').value = '';
    form.querySelector('#accountPassword').value = '';
    submitButton.disabled = false;
  }
});

document.querySelector('#lock').addEventListener('click', async () => {
  unlockedEntries = [];
  entries.replaceChildren();
  matches.hidden = true;
  await clearSessionToken();
  form.reset();
  report('Locked.');
});

currentTab();
