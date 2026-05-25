/* 결과 공유 URL 인코딩/디코딩
 * 페이로드: { score, total, category, nickname? }
 * 형식: #/result?s=<base64url>
 */

function toBase64Url(str) {
  // UTF-8 안전 base64url
  const utf8 = unescape(encodeURIComponent(str));
  return btoa(utf8).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(b64) {
  let s = b64.replace(/-/g, '+').replace(/_/g, '/');
  while (s.length % 4) s += '=';
  const utf8 = atob(s);
  return decodeURIComponent(escape(utf8));
}

function encodeResult(payload) {
  return toBase64Url(JSON.stringify(payload));
}

function decodeResult(token) {
  try {
    return JSON.parse(fromBase64Url(token));
  } catch (e) {
    return null;
  }
}

function buildShareUrl(payload) {
  const token = encodeResult(payload);
  // 현재 origin + pathname 유지, 해시만 결과 페이지로
  const base = window.location.origin + window.location.pathname;
  return `${base}#/result?s=${token}`;
}

async function copyText(text) {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch (e) {
    // fall through
  }
  // 폴백: textarea + execCommand
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.style.position = 'fixed';
  ta.style.opacity = '0';
  document.body.appendChild(ta);
  ta.select();
  try {
    document.execCommand('copy');
    return true;
  } catch (e) {
    return false;
  } finally {
    document.body.removeChild(ta);
  }
}

window.encodeResult = encodeResult;
window.decodeResult = decodeResult;
window.buildShareUrl = buildShareUrl;
window.copyText = copyText;
