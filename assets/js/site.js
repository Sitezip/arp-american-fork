/* ARP Recovery in American Fork — renders shared header/footer and data-driven sections.
   Content lives in /data/*.json (see CONTENT-EDITING.md). No tracking, no third-party code. */
(function () {
  "use strict";
  var DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function getJSON(url) {
    return fetch(url, { cache: "no-cache" }).then(function (r) {
      if (!r.ok) throw new Error(url + " " + r.status);
      return r.json();
    });
  }
  function ext(href) { return /^https?:\/\//.test(href); }
  function linkAttrs(href) { return ext(href) ? ' target="_blank" rel="noopener"' : ""; }
  function todayName() {
    try {
      return new Intl.DateTimeFormat("en-US", { weekday: "long", timeZone: "America/Denver" }).format(new Date());
    } catch (e) { return DAYS[new Date().getDay()]; }
  }
  function fmtDate(iso) {
    var p = String(iso).split("-");
    if (p.length !== 3) return iso;
    var d = new Date(Date.UTC(+p[0], +p[1] - 1, +p[2]));
    return d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" });
  }
  function fmtTime(raw) {
    var t = String(raw || "").trim();
    if (/^noon$/i.test(t)) return "Noon";
    var m = t.match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)?$/i);
    if (!m) return t;
    return m[1] + ":" + (m[2] || "00") + (m[3] ? " " + m[3].toUpperCase() : "");
  }

  /* ---------- Header & footer ---------- */
  function renderChrome(site) {
    var path = location.pathname.replace(/index\.html$/, "");
    var header = document.getElementById("site-header");
    if (header) {
      var items = site.nav.map(function (n) {
        var cur = (n.href === path || (n.href !== "/" && path === n.href.replace(/\.html$/, ""))) ? ' aria-current="page"' : "";
        return '<li><a href="' + esc(n.href) + '"' + cur + ">" + esc(n.label) + "</a></li>";
      }).join("");
      items += '<li class="sep" aria-hidden="true">Church resources</li>' + site.church_links.map(function (n) {
        return '<li class="ext-item"><a class="ext" href="' + esc(n.href) + '" target="_blank" rel="noopener">' + esc(n.label) + " ↗</a></li>";
      }).join("");
      header.innerHTML = '<div class="wrap"><a class="brand" href="/">' + esc(site.site_name) +
        "<small>Addiction Recovery Program · American Fork, Utah</small></a>" +
        '<button class="nav-toggle" aria-expanded="false" aria-controls="site-nav">Menu</button>' +
        '<nav class="site-nav" id="site-nav" aria-label="Main"><ul>' + items + "</ul></nav></div>";
      var btn = header.querySelector(".nav-toggle"), nav = header.querySelector(".site-nav");
      btn.addEventListener("click", function () {
        var open = nav.classList.toggle("open");
        btn.setAttribute("aria-expanded", open ? "true" : "false");
        btn.textContent = open ? "Close" : "Menu";
      });
    }
    var banner = document.getElementById("announcement");
    if (banner && site.announcement) {
      banner.innerHTML = '<div class="wrap"><p class="note" role="status">' + esc(site.announcement) + "</p></div>";
    }
    var footer = document.getElementById("site-footer");
    if (footer) {
      var links = site.nav.concat(site.church_links).map(function (n) {
        return '<li><a href="' + esc(n.href) + '"' + linkAttrs(n.href) + ">" + esc(n.label) + "</a></li>";
      }).join("");
      footer.innerHTML = '<div class="wrap"><ul>' + links + "</ul><p>" + esc(site.footer_note) +
        ' <a href="' + esc(site.official_site) + '" target="_blank" rel="noopener">Official site ↗</a></p>' +
        '<p class="fine">' + esc(site.media_credit) + "</p></div>";
    }
    document.querySelectorAll("[data-church-links]").forEach(function (el) {
      el.innerHTML = site.church_links.map(function (n) {
        return '<li><a href="' + esc(n.href) + '" target="_blank" rel="noopener">' + esc(n.label) + "</a></li>";
      }).join("");
    });
  }

  /* ---------- Schedule ---------- */
  function renderSchedule(el, data, site) {
    var meetings = data.meetings.slice();
    var today = todayName();
    var state = { day: "all", type: "all", audience: "all", format: "all" };
    var params = new URLSearchParams(location.search);
    ["day", "type", "audience", "format"].forEach(function (k) { if (params.get(k)) state[k] = params.get(k); });
    if (state.day !== "all" && state.day !== "today" && DAYS.indexOf(state.day) < 0) state.day = "all";

    function uniq(key) {
      var seen = [];
      meetings.forEach(function (m) { if (m[key] && seen.indexOf(m[key]) < 0) seen.push(m[key]); });
      return seen;
    }
    function options(list, cur, allLabel) {
      return '<option value="all">' + allLabel + "</option>" + list.map(function (v) {
        return '<option value="' + esc(v) + '"' + (v === cur ? " selected" : "") + ">" + esc(v) + "</option>";
      }).join("");
    }
    var dayChips = ["all", "today"].concat(DAYS).map(function (d) {
      var label = d === "all" ? "All days" : d === "today" ? "Today (" + today.slice(0, 3) + ")" : d.slice(0, 3);
      return '<button type="button" class="chip" data-day="' + d + '" aria-label="' + (d === "all" ? "All days" : d === "today" ? "Today, " + today : d) + '">' + label + "</button>";
    }).join("");

    el.innerHTML =
      '<form class="filters" aria-label="Filter meetings" onsubmit="return false">' +
      '<fieldset><legend>Day</legend><div class="chips" role="group">' + dayChips + "</div></fieldset>" +
      '<div class="selects">' +
      '<div><label for="f-type">Meeting type</label><select id="f-type">' + options(uniq("type"), state.type, "All types") + "</select></div>" +
      '<div><label for="f-aud">Who it\'s for</label><select id="f-aud">' + options(uniq("audience"), state.audience, "Everyone") + "</select></div>" +
      '<div><label for="f-fmt">In person or Zoom</label><select id="f-fmt">' +
      '<option value="all">In person &amp; Zoom</option><option value="in-person">In person</option><option value="zoom">Zoom / phone</option></select></div>' +
      "</div>" +
      '<div class="result-bar"><p id="count" class="muted" aria-live="polite" style="margin:0"></p>' +
      '<button type="button" class="linkbtn" id="f-reset">Show all meetings</button></div>' +
      "</form><div id=\"meeting-list\"></div>";

    var list = el.querySelector("#meeting-list");
    el.querySelector("#f-fmt").value = state.format;

    function card(m) {
      var tags = '<ul class="tags"><li>' + esc(m.type) + "</li>" +
        '<li class="aud">' + esc(m.audience) + "</li>" +
        '<li class="' + (m.format === "zoom" ? "fmt-zoom" : "") + '">' + (m.format === "zoom" ? "Zoom / phone" : "In person") + "</li></ul>";
      var body = "";
      if (m.format === "zoom") {
        // Zoom codes are never published; details are shared on request.
        body += '<p class="zoom-details">Zoom details are shared on request. <a href="/contact">Contact a coordinator</a>.</p>';
      } else {
        body += '<p class="where">' + esc(m.location) + "</p>" +
          '<div class="btn-row"><a class="btn secondary" href="' + esc(m.map_url) + '" target="_blank" rel="noopener" aria-label="Map: ' + esc(m.location) + '">Open in Google Maps</a></div>';
      }
      if (site.show_group_leaders && m.group_leaders) body += '<p class="small muted">Group leaders: ' + esc(m.group_leaders) + "</p>";
      if (m.notes) body += '<p class="small">' + esc(m.notes) + "</p>";
      return '<article class="card meeting" id="' + esc(m.id) + '"><div class="time">' + esc(fmtTime(m.time)) +
        "<small>" + esc(m.day) + "</small></div><div><h3>" + esc(m.name.replace(/ZOOM\/Phone-In\s*/i, "ZOOM/Phone-In – ")) + "</h3>" + tags + body + "</div></article>";
    }

    function draw() {
      el.querySelectorAll(".chip").forEach(function (c) {
        c.setAttribute("aria-pressed", c.getAttribute("data-day") === state.day ? "true" : "false");
      });
      var dayWanted = state.day === "today" ? today : state.day;
      var shown = meetings.filter(function (m) {
        return (dayWanted === "all" || m.day === dayWanted) &&
          (state.type === "all" || m.type === state.type) &&
          (state.audience === "all" || m.audience === state.audience) &&
          (state.format === "all" || m.format === state.format);
      });
      var html = "";
      DAYS.forEach(function (d) {
        var ms = shown.filter(function (m) { return m.day === d; }).sort(function (a, b) {
          return (a.time_sort || "99").localeCompare(b.time_sort || "99") || a.name.localeCompare(b.name);
        });
        if (!ms.length) return;
        html += '<section class="day-group" aria-labelledby="day-' + d + '"><h2 id="day-' + d + '">' + d +
          (d === today ? ' <span class="today-badge">Today</span>' : "") + "</h2>" + ms.map(card).join("") + "</section>";
      });
      list.innerHTML = html || '<div class="card empty"><p>No meetings match these filters.</p><button type="button" class="btn" id="empty-reset">Show all meetings</button></div>';
      var er = list.querySelector("#empty-reset");
      if (er) er.addEventListener("click", reset);
      el.querySelector("#count").textContent = "Showing " + shown.length + " of " + meetings.length + " meetings";
    }
    function reset() {
      state = { day: "all", type: "all", audience: "all", format: "all" };
      el.querySelector("#f-type").value = "all"; el.querySelector("#f-aud").value = "all"; el.querySelector("#f-fmt").value = "all";
      draw();
    }
    el.querySelectorAll(".chip").forEach(function (c) {
      c.addEventListener("click", function () {
        state.day = c.getAttribute("data-day");
        draw();
      });
    });
    el.querySelector("#f-type").addEventListener("change", function (e) { state.type = e.target.value; draw(); });
    el.querySelector("#f-aud").addEventListener("change", function (e) { state.audience = e.target.value; draw(); });
    el.querySelector("#f-fmt").addEventListener("change", function (e) { state.format = e.target.value; draw(); });
    el.querySelector("#f-reset").addEventListener("click", reset);
    draw();
  }

  /* ---------- Contacts ---------- */
  function renderContacts(el, data) {
    el.innerHTML = data.contacts.map(function (c) {
      var rows = c.people.map(function (p) {
        return "<dt>" + esc(p.label) + "</dt><dd>" + (p.phone
          ? '<a href="tel:' + esc(p.phone.replace(/[^\d+]/g, "")) + '">' + esc(p.phone) + "</a>"
          : '<span class="placeholder">Phone coming soon</span>') + "</dd>";
      }).join("");
      rows += "<dt>Email</dt><dd>" + (c.email
        ? '<a href="mailto:' + esc(c.email) + '">' + esc(c.email) + "</a>"
        : '<span class="placeholder">Email coming soon</span>') + "</dd>";
      return '<article class="card contact-card"><h2 style="margin-top:0">' + esc(c.names) + '</h2><p class="muted" style="margin:0">' +
        esc(c.role) + "</p><dl>" + rows + "</dl></article>";
    }).join("");
  }

  /* ---------- Resources ---------- */
  function renderResources(el, data) {
    el.innerHTML = data.groups.map(function (g) {
      return '<section class="card" id="' + esc(g.id) + '"><h2 style="margin-top:0">' + esc(g.title) + "</h2><p>" + esc(g.intro) +
        '</p><ul class="link-list">' + g.links.map(function (l) {
          return '<li><a href="' + esc(l.href) + '" target="_blank" rel="noopener">' + esc(l.label) + "</a></li>";
        }).join("") + "</ul></section>";
    }).join("");
  }
  function renderVideos(el, data) {
    el.innerHTML = data.videos.map(function (v) {
      return '<a class="card video-card" href="' + esc(v.href) + '" target="_blank" rel="noopener"><img src="' + esc(v.image) +
        '" alt="' + esc(v.alt) + '" width="768" height="432" loading="lazy"><span>' + esc(v.title) + " ↗</span></a>";
    }).join("");
  }

  /* ---------- Boot ---------- */
  getJSON("/data/site.json").then(function (site) {
    renderChrome(site);
    var sched = document.getElementById("schedule-app");
    var upd = document.querySelectorAll("[data-schedule-updated]");
    var cnt = document.querySelectorAll("[data-meeting-count]");
    if (sched || upd.length || cnt.length) {
      getJSON("/data/meetings.json").then(function (data) {
        upd.forEach(function (u) { u.textContent = fmtDate(data.schedule_updated); });
        cnt.forEach(function (u) { u.textContent = data.meetings.length; });
        if (sched) renderSchedule(sched, data, site);
      }).catch(function () {
        if (sched) sched.innerHTML = '<p class="note">The schedule could not be loaded. Please refresh, or use the <a href="https://addictionrecovery.churchofjesuschrist.org/">official meeting finder</a>.</p>';
      });
    }
    var c = document.getElementById("contacts");
    if (c) getJSON("/data/contacts.json").then(function (d) { renderContacts(c, d); });
    var r = document.getElementById("resources"), v = document.getElementById("videos");
    if (r || v) getJSON("/data/resources.json").then(function (d) { if (r) renderResources(r, d); if (v) renderVideos(v, d); });
  });
})();
