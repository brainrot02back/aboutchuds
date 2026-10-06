(function () {
  var USER_ID = "1467337400576639218";
  var body = document.body;
  var gate = document.getElementById("gate");
  var music = document.getElementById("music");
  var soundBtn = document.getElementById("sound");

  music.volume = 0.5;

  function enter() {
    if (body.classList.contains("entered")) return;
    body.classList.add("entered");
    var p = music.play();
    if (p && typeof p.catch === "function") p.catch(function () {});
    window.setTimeout(function () {
      gate.setAttribute("hidden", "");
      gate.style.display = "none";
    }, 1300);
  }

  gate.addEventListener("click", enter);

  soundBtn.addEventListener("click", function () {
    var muted = !music.muted;
    music.muted = muted;
    soundBtn.setAttribute("aria-pressed", String(muted));
    soundBtn.setAttribute("aria-label", muted ? "Unmute music" : "Mute music");
    if (!muted && music.paused) music.play().catch(function () {});
  });

  var fullTitle = "chuds.gg";
  var titleLen = fullTitle.length;
  var titleDir = -1;

  function titleStep() {
    titleLen += titleDir;
    document.title = fullTitle.slice(0, titleLen);
    var wait = 140;
    if (titleDir === -1 && titleLen <= 1) {
      titleDir = 1;
      wait = 700;
    } else if (titleDir === 1 && titleLen >= fullTitle.length) {
      titleDir = -1;
      wait = 2200;
    }
    window.setTimeout(titleStep, wait);
  }

  window.setTimeout(titleStep, 2200);

  var canvas = document.getElementById("graph");
  var ctx = canvas.getContext("2d");
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var nodes = [];
  var w = 0;
  var h = 0;
  var dpr = 1;
  var mouse = { x: -9999, y: -9999 };

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    var count = Math.max(28, Math.min(70, Math.floor((w * h) / 22000)));
    nodes = [];
    for (var i = 0; i < count; i++) {
      var a = Math.random() * Math.PI * 2;
      var s = 0.12 + Math.random() * 0.22;
      nodes.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: Math.cos(a) * s,
        vy: Math.sin(a) * s,
        r: 1 + Math.random() * 1.4,
        t: Math.random() * Math.PI * 2
      });
    }
  }

  function frame() {
    ctx.clearRect(0, 0, w, h);
    var maxD = Math.min(190, Math.max(120, w / 7));
    var i, j, n, m, dx, dy, d;
    for (i = 0; i < nodes.length; i++) {
      n = nodes[i];
      if (!reduce) {
        n.x += n.vx;
        n.y += n.vy;
        n.t += 0.02;
        if (n.x < -20) n.x = w + 20;
        if (n.x > w + 20) n.x = -20;
        if (n.y < -20) n.y = h + 20;
        if (n.y > h + 20) n.y = -20;
      }
    }
    for (i = 0; i < nodes.length; i++) {
      n = nodes[i];
      for (j = i + 1; j < nodes.length; j++) {
        m = nodes[j];
        dx = n.x - m.x;
        dy = n.y - m.y;
        d = Math.sqrt(dx * dx + dy * dy);
        if (d < maxD) {
          ctx.strokeStyle = "rgba(255,255,255," + ((1 - d / maxD) * 0.22).toFixed(3) + ")";
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(n.x, n.y);
          ctx.lineTo(m.x, m.y);
          ctx.stroke();
        }
      }
      dx = n.x - mouse.x;
      dy = n.y - mouse.y;
      d = Math.sqrt(dx * dx + dy * dy);
      if (d < 170) {
        ctx.strokeStyle = "rgba(255,255,255," + ((1 - d / 170) * 0.5).toFixed(3) + ")";
        ctx.beginPath();
        ctx.moveTo(n.x, n.y);
        ctx.lineTo(mouse.x, mouse.y);
        ctx.stroke();
      }
    }
    for (i = 0; i < nodes.length; i++) {
      n = nodes[i];
      var pulse = 0.55 + Math.sin(n.t) * 0.3;
      ctx.fillStyle = "rgba(255,255,255," + pulse.toFixed(3) + ")";
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fill();
    }
    if (!reduce) requestAnimationFrame(frame);
  }

  window.addEventListener("resize", function () {
    resize();
    if (reduce) frame();
  });
  window.addEventListener("pointermove", function (e) {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });
  window.addEventListener("pointerleave", function () {
    mouse.x = -9999;
    mouse.y = -9999;
  });

  resize();
  frame();

  var el = {
    banner: document.getElementById("banner"),
    avatar: document.getElementById("avatar"),
    status: document.getElementById("status"),
    display: document.getElementById("display"),
    handle: document.getElementById("handle"),
    custom: document.getElementById("custom"),
    activity: document.getElementById("activity")
  };

  el.avatar.addEventListener("load", function () {
    el.avatar.classList.add("loaded");
  });
  el.avatar.addEventListener("error", function () {
    el.avatar.classList.remove("loaded");
  });

  var current = null;
  var tickTimer = null;

  function make(tag, cls, text) {
    var node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text !== undefined && text !== null) node.textContent = text;
    return node;
  }

  function pad(n) {
    return n < 10 ? "0" + n : String(n);
  }

  function clock(ms) {
    var s = Math.max(0, Math.floor(ms / 1000));
    var hrs = Math.floor(s / 3600);
    var mins = Math.floor((s % 3600) / 60);
    var secs = s % 60;
    return (hrs > 0 ? hrs + ":" + pad(mins) : mins) + ":" + pad(secs);
  }

  function assetUrl(img, appId) {
    if (!img) return null;
    if (img.indexOf("mp:external/") === 0) return "https://media.discordapp.net/external/" + img.slice(12);
    if (img.indexOf("spotify:") === 0) return "https://i.scdn.co/image/" + img.slice(8);
    if (img.indexOf("youtube:") === 0) return "https://i.ytimg.com/vi/" + img.slice(8) + "/hqdefault.jpg";
    if (img.indexOf("twitch:") === 0) return "https://static-cdn.jtvnw.net/previews-ttv/live_user_" + img.slice(7) + "-440x248.jpg";
    if (!appId) return null;
    return "https://cdn.discordapp.com/app-assets/" + appId + "/" + img + ".png";
  }

  function kindLabel(a) {
    if (a.type === 2) return "Listening to Spotify";
    if (a.type === 3) return "Watching";
    if (a.type === 5) return "Competing in";
    if (a.type === 1) return "Streaming";
    return "Playing";
  }

  function avatarUrl(user) {
    if (!user || !user.avatar) return null;
    var ext = user.avatar.indexOf("a_") === 0 ? "gif" : "png";
    return "https://cdn.discordapp.com/avatars/" + user.id + "/" + user.avatar + "." + ext + "?size=256";
  }

  function renderActivity(data) {
    el.activity.textContent = "";
    if (tickTimer) {
      window.clearInterval(tickTimer);
      tickTimer = null;
    }

    var list = (data.activities || []).filter(function (a) {
      return a.type !== 4;
    });

    if (!list.length) {
      el.activity.appendChild(make("p", "idle", "no activity right now"));
      return;
    }

    var a = list[0];
    var spotify = a.type === 2 && data.spotify ? data.spotify : null;
    var row = make("div", "act");
    var art = make("div", "act-art");
    var largeSrc = spotify ? spotify.album_art_url : assetUrl(a.assets && a.assets.large_image, a.application_id);
    var smallSrc = !spotify && a.assets ? assetUrl(a.assets.small_image, a.application_id) : null;

    if (largeSrc) {
      var big = document.createElement("img");
      big.src = largeSrc;
      big.alt = "";
      big.loading = "lazy";
      art.appendChild(big);
    }
    if (smallSrc) {
      var small = document.createElement("img");
      small.src = smallSrc;
      small.alt = "";
      small.className = "small";
      art.appendChild(small);
    }
    if (largeSrc || smallSrc) row.appendChild(art);

    var text = make("div", "act-text");
    text.appendChild(make("p", "act-kind", kindLabel(a)));
    text.appendChild(make("p", "act-name", spotify ? spotify.song : a.name));

    if (spotify) {
      text.appendChild(make("p", "act-line", "by " + spotify.artist.replace(/;/g, ",")));
      if (spotify.album) text.appendChild(make("p", "act-line", "on " + spotify.album));
    } else {
      if (a.details) text.appendChild(make("p", "act-line", a.details));
      if (a.state) text.appendChild(make("p", "act-line", a.state));
    }

    var timeEl = null;
    var barEl = null;
    var start = null;
    var end = null;
    var ts = spotify ? spotify.timestamps : a.timestamps;
    if (ts && ts.start) start = ts.start;
    if (ts && ts.end) end = ts.end;

    if (spotify && start && end) {
      timeEl = make("p", "act-time", "");
      var bar = make("div", "bar");
      barEl = make("span");
      bar.appendChild(barEl);
      text.appendChild(bar);
      text.appendChild(timeEl);
    } else if (start) {
      timeEl = make("p", "act-time", "");
      text.appendChild(timeEl);
    }

    row.appendChild(text);
    el.activity.appendChild(row);

    function tick() {
      var now = Date.now();
      if (spotify && start && end) {
        var total = end - start;
        var pos = Math.min(Math.max(now - start, 0), total);
        barEl.style.width = (pos / total) * 100 + "%";
        timeEl.textContent = clock(pos) + " / " + clock(total);
      } else if (start) {
        timeEl.textContent = clock(now - start) + " elapsed";
      }
    }

    if (timeEl) {
      tick();
      tickTimer = window.setInterval(tick, 1000);
    }
  }

  function renderCustom(data) {
    var custom = (data.activities || []).filter(function (a) {
      return a.type === 4;
    })[0];
    if (!custom) {
      el.custom.hidden = true;
      return;
    }
    var label = "";
    if (custom.emoji && custom.emoji.name && !custom.emoji.id) label += custom.emoji.name + " ";
    if (custom.state) label += custom.state;
    label = label.trim();
    if (!label) {
      el.custom.hidden = true;
      return;
    }
    el.custom.textContent = label;
    el.custom.hidden = false;
  }

  function render(data) {
    current = data;
    var user = data.discord_user || {};
    var shown = user.global_name || user.display_name || user.username || "chuds.gg";
    el.display.textContent = shown;
    el.handle.textContent = user.username ? "@" + user.username : "";
    var src = avatarUrl(user);
    if (src && el.avatar.getAttribute("src") !== src) el.avatar.src = src;
    el.status.setAttribute("data-state", data.discord_status || "offline");
    renderCustom(data);
    renderActivity(data);
  }

  function setBanner(url, color) {
    if (url) {
      var probe = new Image();
      probe.onload = function () {
        el.banner.style.backgroundImage = "url(" + url + ")";
        el.banner.classList.add("has-image");
      };
      probe.src = url;
    } else if (color) {
      el.banner.style.backgroundColor = color;
    }
  }

  function loadProfile() {
    fetch("https://discordlookup.mesalytic.moe/v1/user/" + USER_ID)
      .then(function (r) {
        if (!r.ok) throw new Error("lookup failed");
        return r.json();
      })
      .then(function (j) {
        if (j.avatar && j.avatar.link && !el.avatar.getAttribute("src")) el.avatar.src = j.avatar.link;
        var link = j.banner && j.banner.link ? j.banner.link : null;
        var color = j.banner_color || j.accent_color_hex || null;
        if (link) {
          setBanner(link, null);
        } else if (color) {
          setBanner(null, color);
        }
        if (!link) throw new Error("no banner");
      })
      .catch(function () {
        fetch("https://japi.rest/discord/v1/user/" + USER_ID)
          .then(function (r) {
            return r.json();
          })
          .then(function (j) {
            var d = j && j.data ? j.data : {};
            if (d.avatarURL && !el.avatar.getAttribute("src")) el.avatar.src = d.avatarURL;
            if (d.bannerURL) setBanner(d.bannerURL, null);
            else if (d.accentColorHex) setBanner(null, d.accentColorHex);
          })
          .catch(function () {});
      });
  }

  function loadPresenceOnce() {
    fetch("https://api.lanyard.rest/v1/users/" + USER_ID)
      .then(function (r) {
        return r.json();
      })
      .then(function (j) {
        if (j && j.success && !current) render(j.data);
        else if (!current) renderFallback();
      })
      .catch(function () {
        if (!current) renderFallback();
      });
  }

  function renderFallback() {
    el.activity.textContent = "";
    el.activity.appendChild(make("p", "idle", "discord activity unavailable"));
  }

  var socket = null;
  var heartbeat = null;
  var retry = null;

  function connect() {
    try {
      socket = new WebSocket("wss://api.lanyard.rest/socket");
    } catch (e) {
      return;
    }
    socket.onmessage = function (event) {
      var msg;
      try {
        msg = JSON.parse(event.data);
      } catch (e) {
        return;
      }
      if (msg.op === 1) {
        socket.send(JSON.stringify({ op: 2, d: { subscribe_to_id: USER_ID } }));
        window.clearInterval(heartbeat);
        heartbeat = window.setInterval(function () {
          if (socket && socket.readyState === 1) socket.send(JSON.stringify({ op: 3 }));
        }, msg.d.heartbeat_interval);
      } else if (msg.op === 0 && msg.d) {
        render(msg.d);
      }
    };
    socket.onclose = function () {
      window.clearInterval(heartbeat);
      window.clearTimeout(retry);
      retry = window.setTimeout(connect, 5000);
    };
    socket.onerror = function () {
      try {
        socket.close();
      } catch (e) {}
    };
  }

  loadProfile();
  loadPresenceOnce();
  connect();
})();
