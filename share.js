'use strict';
(() => {
  const get = id => document.getElementById(id);
  const shareButton = get('share');
  const copyButton = get('copy');
  const status = get('status');
  const download = get('download');
  const preview = get('asp-image');
  const panel = get('asp-panel');
  let message = '';
  let selectedAsp = '';
  let file = null;
  let loading = false;
  let busy = false;
  let currentLoad = 0;

  const validAsp = value => /^(L1-(0[1-9]|[1-3][0-9]|4[0-6])|L2-(0[1-9]|1[0-4]))$/.test(value);
  const canShareFile = () => {
    try {
      return !!(file && navigator.share && navigator.canShare && navigator.canShare({files: [file]}));
    } catch (_) {
      return false;
    }
  };
  function updateButtons() {
    shareButton.disabled = !message || loading || busy || !navigator.share ||
      (!!selectedAsp && !canShareFile());
    copyButton.disabled = !message;
  }
  async function receive() {
    const loadId = ++currentLoad;
    busy = false;
    file = null;
    message = '';
    selectedAsp = '';
    loading = false;
    preview.hidden = true;
    preview.removeAttribute('src');
    panel.hidden = true;
    download.hidden = true;
    download.removeAttribute('href');
    const params = new URLSearchParams(location.hash.slice(1));
    // Remove message data from the visible address after reading it. Do not store it.
    if (location.hash) history.replaceState(null, '', location.pathname + location.search);
    const text = params.get('text') || '';
    const asp = params.get('asp') || '';
    get('message').textContent = '';
    if (!text.trim() || text.length > 12000 || (asp && !validAsp(asp))) {
      status.textContent = 'Open this page from the TCC notification action in SD&O Kit. The message or ASP code is missing or invalid.';
      updateButtons();
      return;
    }
    message = text;
    selectedAsp = asp;
    get('message').textContent = text;
    if (!selectedAsp) {
      status.textContent = navigator.share ? 'Your message is ready.' :
        'This browser does not offer a share menu. Copy the message and paste it into WhatsApp.';
      updateButtons();
      return;
    }
    loading = true;
    updateButtons();
    panel.hidden = false;
    get('asp-name').textContent = selectedAsp;
    const path = 'media/' + selectedAsp + '.gif';
    status.textContent = 'Preparing ' + selectedAsp + '…';
    try {
      const response = await fetch(path, {credentials: 'same-origin'});
      if (!response.ok) throw new Error('GIF unavailable');
      const bytes = await response.arrayBuffer();
      if (loadId !== currentLoad) return;
      const signature = new Uint8Array(bytes, 0, Math.min(6, bytes.byteLength));
      if (String.fromCharCode(...signature) !== 'GIF89a' &&
          String.fromCharCode(...signature) !== 'GIF87a') throw new Error('Invalid GIF');
      file = new File([bytes], selectedAsp + '.gif', {type: 'image/gif'});
      preview.src = path;
      preview.alt = selectedAsp + ' alternative service plan animation';
      preview.hidden = false;
      download.href = path;
      download.download = selectedAsp + '.gif';
      download.hidden = false;
      status.textContent = canShareFile() ? 'Your message and GIF are ready.' :
        'This browser cannot share this GIF directly. Download the GIF, attach it in WhatsApp, and paste the copied message.';
    } catch (_) {
      if (loadId !== currentLoad) return;
      file = null;
      status.textContent = 'The selected GIF could not be loaded. Check your connection and reopen the TCC notification from SD&O Kit.';
    } finally {
      if (loadId === currentLoad) {
        loading = false;
        updateButtons();
      }
    }
  }

  shareButton.addEventListener('click', async () => {
    if (shareButton.disabled || busy) return;
    const loadId = currentLoad;
    const payload = {text: message};
    if (selectedAsp) {
      if (!canShareFile()) return;
      payload.files = [file];
    }
    busy = true;
    updateButtons();
    try {
      // File loading completes before this click, preserving the browser's user activation.
      await navigator.share(payload);
      if (loadId === currentLoad) status.textContent = 'Share menu completed. Check WhatsApp for the final send and delivery status.';
    } catch (error) {
      if (loadId !== currentLoad) return;
      status.textContent = error.name === 'AbortError' ? 'Sharing cancelled. You can try again.' :
        'Sharing could not open. Use Copy message and Download GIF to attach them in WhatsApp.';
    } finally {
      if (loadId === currentLoad) {
        busy = false;
        updateButtons();
      }
    }
  });
  copyButton.addEventListener('click', async () => {
    if (!message) return;
    try {
      await navigator.clipboard.writeText(message);
      status.textContent = 'Message copied. Paste it into WhatsApp if the caption is empty.';
    } catch (_) {
      status.textContent = 'Clipboard access is unavailable. Press and hold the message to copy it.';
    }
  });
  window.addEventListener('hashchange', receive);
  receive();
})();
