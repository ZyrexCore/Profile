(() => {
  const source = document.getElementById('source');
  const ascii = document.getElementById('ascii');
  const preview = document.getElementById('preview');
  const toast = document.getElementById('toast');
  let toastTimer;
  function encode() {
    const value = source.value;
    try {
      // Nudi is a legacy byte-position encoding; do not translate the text.
      ascii.value = unicodeToASCII(value, 'nudi');
      preview.textContent = value || 'ನಿಮ್ಮ ಕನ್ನಡ ಪಠ್ಯ ಇಲ್ಲಿ ಕಾಣಿಸುತ್ತದೆ…';
      document.getElementById('inputCount').textContent = value.length + ' characters';
      document.getElementById('asciiCount').textContent = new TextEncoder().encode(ascii.value).length + ' bytes';
    } catch (error) {
      console.error(error);
      ascii.value = '';
      preview.textContent = 'Encoding error — please check the input method.';
    }
  }
  function showToast(message) {
    toast.textContent = message; toast.classList.add('show');
    clearTimeout(toastTimer); toastTimer = setTimeout(() => toast.classList.remove('show'), 1800);
  }
  function copy(text, label) {
    if (!text) return showToast('Nothing to copy');
    navigator.clipboard.writeText(text).then(() => showToast(label + ' copied')).catch(() => showToast('Clipboard permission denied'));
  }
  source.addEventListener('input', encode);
  document.getElementById('clearBtn').addEventListener('click', () => { source.value=''; encode(); source.focus(); });
  document.getElementById('copyAscii').addEventListener('click', () => copy(ascii.value, 'Nudi ASCII'));
  document.getElementById('copyUnicode').addEventListener('click', () => copy(source.value, 'Unicode'));
  document.getElementById('downloadAscii').addEventListener('click', () => {
    const blob = new Blob([ascii.value], {type:'text/plain;charset=utf-8'});
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'nudi-ascii.txt'; a.click(); URL.revokeObjectURL(a.href);
  });
  document.getElementById('themeBtn').addEventListener('click', () => document.body.classList.toggle('light'));
  // Wikimedia jquery.ime KGP layout: Unicode input is converted to Nudi legacy ASCII above.
  if (window.jQuery && jQuery.fn.ime) {
    $.ime.setPath('https://cdn.jsdelivr.net/gh/wikimedia/jquery.ime@master/');
    $(source).ime({showSelector:false});
    const ime = $(source).data('ime');
    if (ime) {
      ime.setLanguage('kn');
      ime.load('kgp').done(() => { ime.setIM('kgp'); ime.enable(); });
    }
  } else {
    showToast('Keyboard engine could not load — check your connection');
  }
  encode();
})();