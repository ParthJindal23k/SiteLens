(function () {
  "use strict";

  var VERSION = "1.1.0";
  var SESSION_DURATION_MS = 12 * 60 * 60 * 1000;
  var LIVE_PING_INTERVAL_MS = 10000;
  var VISITOR_KEY = "sitelens_visitor_id";
  var SESSION_KEY = "sitelens_session_time";

  // document.currentScript is only set while a script is being parsed from the
  // HTML. Frameworks that inject the tag programmatically - next/script, and
  // React 19's hoisting of <script> rendered inside a component - leave it
  // null, so fall back to locating our own tag in the document.
  var script = document.currentScript;

  if (!script || !script.src) {
    // Match on the filename rather than just data-website-id, so an unrelated
    // analytics snippet on the same page is never mistaken for ours.
    var candidates = [].filter.call(
      document.querySelectorAll("script[data-website-id][src]"),
      function (el) {
        return /\/analytics\.js(\?|#|$)/.test(el.getAttribute("src") || "");
      }
    );

    if (candidates.length > 1) {
      console.warn(
        "Sitelens: found " +
          candidates.length +
          " install snippets on this page. Keep only one - the extras will be ignored."
      );
    }

    script = candidates[0] || null;
  }

  if (!script || !script.src) {
    console.warn(
      "Sitelens: could not locate its own script tag. The snippet needs data-website-id and a src ending in /analytics.js."
    );
    return;
  }

  var websiteId = script.getAttribute("data-website-id");
  if (!websiteId) {
    console.warn("Sitelens: missing data-website-id, tracking disabled");
    return;
  }

  // The collector lives wherever this script was served from, so the endpoint
  // is derived rather than hardcoded. Baking in a host meant renaming the
  // deployment silently broke every installed snippet.
  var endpoint;
  try {
    // Without an explicit src this would resolve to the host page's own origin
    // and quietly post tracking data back at the customer's site.
    if (!script.src) throw new Error("script has no src");
    endpoint = new URL(script.src, window.location.href).origin;
  } catch (e) {
    console.warn("Sitelens: could not resolve collector endpoint from script src");
    return;
  }

  if (
    window.location.protocol === "https:" &&
    new URL(endpoint).protocol === "http:"
  ) {
    console.warn(
      "Sitelens: an https page cannot load tracking over http (" +
        endpoint +
        "). Point data-* and src at an https collector."
    );
  }

  var domain = script.getAttribute("data-domain") || window.location.hostname;

  console.log("Sitelens Analytics loaded (v" + VERSION + ")");

  /* ---------------- Visitor identity ---------------- */
  function generateVisitorId() {
    return Date.now().toString(36) + Math.random().toString(36).substring(2, 10);
  }

  // Private browsing and blocked-storage contexts throw on localStorage access,
  // which would otherwise abort the whole script.
  function readStore(key) {
    try {
      return window.localStorage.getItem(key);
    } catch (e) {
      return null;
    }
  }

  function writeStore(key, value) {
    try {
      window.localStorage.setItem(key, value);
    } catch (e) {
      /* non-fatal: the visitor simply gets a fresh ID next load */
    }
  }

  var now = Date.now();
  var visitorId = readStore(VISITOR_KEY);
  var sessionStarted = parseInt(readStore(SESSION_KEY), 10);

  if (!visitorId || !isFinite(sessionStarted) || now - sessionStarted > SESSION_DURATION_MS) {
    visitorId = generateVisitorId();
    writeStore(VISITOR_KEY, visitorId);
    writeStore(SESSION_KEY, String(now));
  }

  /* ---------------- Request helpers ---------------- */
  function post(path, payload) {
    var body = JSON.stringify(payload);

    try {
      fetch(endpoint + path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: body,
        keepalive: true,
      }).catch(function () {});
    } catch (e) {
      /* ignore: analytics must never break the host page */
    }
  }

  /* ---------------- Entry event ---------------- */
  var search = window.location.search;
  var params = new URLSearchParams(search);

  post("/api/track", {
    type: "entry",
    websiteId: websiteId,
    domain: domain,
    url: window.location.href,
    referrer: document.referrer || "direct",
    visitorId: visitorId,
    entryTime: Math.floor(now / 1000),
    // URLSearchParams has no toJSON, so sending the object serialized to "{}"
    // and this column was always empty.
    urlParams: search.replace(/^\?/, "") || null,
    utm_source: params.get("utm_source") || null,
    utm_medium: params.get("utm_medium") || null,
    utm_campaign: params.get("utm_campaign") || null,
    // Lowercase to match what the collector reads; the old "RefParams" key
    // never bound to anything server-side.
    refParams: search.replace(/^\?/, "") || null,
  });

  /* ---------------- Active time ---------------- */
  var activeStart = Date.now();
  var totalActiveTime = 0;
  var exited = false;

  function pauseTracking() {
    if (activeStart !== null) {
      totalActiveTime += Math.floor((Date.now() - activeStart) / 1000);
      activeStart = null;
    }
  }

  function resumeTracking() {
    if (activeStart === null) activeStart = Date.now();
  }

  /* ---------------- Live heartbeat ---------------- */
  var liveTimer = null;

  function sendLivePing() {
    post("/api/live", {
      websiteId: websiteId,
      visitorId: visitorId,
      last_seen: Date.now(),
      url: window.location.href,
    });
  }

  function startLivePings() {
    if (liveTimer === null) {
      liveTimer = window.setInterval(sendLivePing, LIVE_PING_INTERVAL_MS);
    }
  }

  function stopLivePings() {
    if (liveTimer !== null) {
      window.clearInterval(liveTimer);
      liveTimer = null;
    }
  }

  /* ---------------- Exit event ---------------- */
  function handleExit() {
    if (exited) return;
    exited = true;

    pauseTracking();
    stopLivePings();

    var payload = JSON.stringify({
      type: "exit",
      websiteId: websiteId,
      domain: domain,
      visitorId: visitorId,
      totalActiveTime: totalActiveTime,
      exitTime: Math.floor(Date.now() / 1000),
      exitUrl: window.location.href,
    });

    if (navigator.sendBeacon) {
      // text/plain keeps this a CORS-simple request. An application/json beacon
      // would need a preflight, which is unreliable during page unload.
      navigator.sendBeacon(
        endpoint + "/api/track",
        new Blob([payload], { type: "text/plain" })
      );
    } else {
      post("/api/track", JSON.parse(payload));
    }
  }

  document.addEventListener("visibilitychange", function () {
    if (document.hidden) {
      pauseTracking();
      stopLivePings();
    } else {
      resumeTracking();
      startLivePings();
    }
  });

  // pagehide is the reliable signal on mobile Safari, where beforeunload often
  // does not fire at all.
  window.addEventListener("pagehide", handleExit);
  window.addEventListener("beforeunload", handleExit);

  sendLivePing();
  startLivePings();
})();
