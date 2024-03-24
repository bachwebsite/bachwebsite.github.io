"use strict";

/**
 * @type {HTMLFormElement}
 */
const form = document.getElementById("uv-form");

/**
 * @type {HTMLInputElement}
 */
const address = document.getElementById("uv-address");

/**
 * @type {HTMLInputElement}
 */
const searchEngine = document.getElementById("uv-search-engine");

/**
 * @type {HTMLParagraphElement}
 */
const error = document.getElementById("uv-error");

/**
 * @type {HTMLPreElement}
 */
const errorCode = document.getElementById("uv-error-code");

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  try {
    await registerSW();
  } catch (err) {
    error.textContent = "Failed to register service worker.";
    errorCode.textContent = err.toString();
    console.error(err); // Log the error for debugging purposes
    return; // Return early to prevent further execution
  }

  const url = search(address.value, searchEngine.value);

  let frame = document.getElementById("uv-frame");
  frame.style.display = "block";
  frame.src = __uv$config.prefix + __uv$config.encodeUrl(url);
});

/**
 * Function to register the service worker
 */
async function registerSW() {
  if ('serviceWorker' in navigator) {
    try {
      await navigator.serviceWorker.register('/service-worker.js');
      console.log('Service worker registered successfully');
    } catch (error) {
      throw new Error('Failed to register service worker: ' + error.message);
    }
  } else {
    throw new Error('Service workers are not supported in this browser.');
  }
}

/**
 * Function to perform search
 * @param {string} addressValue
 * @param {string} searchEngineValue
 * @returns {string} The URL for the search
 */
function search(addressValue, searchEngineValue) {
  // Implement your search logic here
  return 'https://' + searchEngineValue + '.com/search?q=' + encodeURIComponent(addressValue);
}
