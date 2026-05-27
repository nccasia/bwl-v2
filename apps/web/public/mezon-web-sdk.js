(() => {
  var e = {
      d: (t, n) => {
        for (var r in n)
          e.o(n, r) && !e.o(t, r) && Object.defineProperty(t, r, { enumerable: !0, get: n[r] });
      },
      o: (e, t) => Object.prototype.hasOwnProperty.call(e, t),
      r: e => {
        'undefined' != typeof Symbol &&
          Symbol.toStringTag &&
          Object.defineProperty(e, Symbol.toStringTag, { value: 'Module' }),
          Object.defineProperty(e, '__esModule', { value: !0 });
      },
    },
    t = {};
  (() => {
    'use strict';
    e.r(t), e.d(t, { WebView: () => s });
    const n = 'https://mezon.ai';
    var r, a;
    function i(e) {
      try {
        const t = e.replace(/\+/g, '%20');
        return decodeURIComponent(t);
      } catch (t) {
        return e;
      }
    }
    !(function (e) {
      (e.ThemeChanged = 'theme_changed'),
        (e.ViewPortChanged = 'viewport_changed'),
        (e.SetCustomStyle = 'set_custom_style'),
        (e.ReloadIframe = 'reload_iframe'),
        (e.PONG = 'PONG'),
        (e.CURRENT_USER_INFO = 'CURRENT_USER_INFO'),
        (e.USER_HASH_INFO = 'USER_HASH_INFO'),
        (e.SEND_TOKEN_RESPONSE_SUCCESS = 'SEND_TOKEN_RESPONSE_SUCCESS'),
        (e.SEND_TOKEN_RESPONSE_FAILED = 'SEND_TOKEN_RESPONSE_FAILED'),
        (e.CLAN_RESPONSE = 'CLAN_RESPONSE'),
        (e.CLAN_ROLES_RESPONSE = 'CLAN_ROLES_RESPONSE'),
        (e.CLAN_USERS_RESPONSE = 'CLAN_USERS_RESPONSE'),
        (e.CHANNELS_RESPONSE = 'CHANNELS_RESPONSE'),
        (e.CHANNEL_RESPONSE = 'CHANNEL_RESPONSE'),
        (e.MICROPHONE_STATUS = 'MICROPHONE_STATUS'),
        (e.TOGGLE_MICROPHONE = 'TOGGLE_MICROPHONE');
    })(r || (r = {})),
      (function (e) {
        (e.IframeReady = 'iframe_ready'),
          (e.IframeWillReloaded = 'iframe_will_reload'),
          (e.PING = 'PING'),
          (e.SEND_BOT_ID = 'SEND_BOT_ID'),
          (e.SEND_TOKEN = 'SEND_TOKEN'),
          (e.GET_CLAN = 'GET_CLAN'),
          (e.GET_CLAN_ROLES = 'GET_CLAN_ROLES'),
          (e.GET_CLAN_USERS = 'GET_CLAN_USERS'),
          (e.GET_CHANNEL = 'GET_CHANNEL'),
          (e.GET_CHANNELS = 'GET_CHANNELS'),
          (e.CHECK_MICROPHONE_STATUS = 'CHECK_MICROPHONE_STATUS'),
          (e.TOGGLE_MICROPHONE = 'TOGGLE_MICROPHONE'),
          (e.JOIN_ROOM = 'JOIN_ROOM'),
          (e.LEAVE_ROOM = 'LEAVE_ROOM'),
          (e.CREATE_VOICE_ROOM = 'CREATE_VOICE_ROOM');
      })(a || (a = {}));
    const s = new (class {
      constructor() {
        (this.eventHandlers = {}),
          (this.locationHash = ''),
          (this.initParams = {}),
          (this.isIframe = !1),
          this.initData(),
          this.initIframe();
      }
      postEvent(e, t, r) {
        if ((r || (r = function () {}), this.isIframe))
          try {
            const a = n;
            window.parent.postMessage(JSON.stringify({ eventType: e, eventData: t }), a), r();
          } catch (e) {
            r(e);
          }
        else r({ notAvailable: !0 });
      }
      receiveEvent(e, t) {
        this.callEventCallbacks(e, function (n) {
          n(e, t);
        });
      }
      onEvent(e, t) {
        Array.isArray(this.eventHandlers[e]) || (this.eventHandlers[e] = []),
          -1 === this.eventHandlers[e].indexOf(t) && this.eventHandlers[e].push(t);
      }
      offEvent(e, t) {
        if (!Array.isArray(this.eventHandlers[e])) return;
        const n = this.eventHandlers[e].indexOf(t);
        -1 !== n && this.eventHandlers[e].splice(n, 1);
      }
      initData() {
        (this.locationHash = window.location.hash.toString()),
          (this.initParams = (function (e) {
            var t = {};
            if (!(e = e.replace(/^#/, '')).length) return t;
            if (e.indexOf('=') < 0 && e.indexOf('?') < 0) return (t._path = i(e)), t;
            var n = e.indexOf('?');
            if (n >= 0) {
              var r = e.substr(0, n);
              (t._path = i(r)), (e = e.substr(n + 1));
            }
            var a = (function (e) {
              const t = {};
              if (!e.length) return t;
              const n = e.split('&');
              let r, a, s, o;
              for (r = 0; r < n.length; r++)
                (a = n[r].split('=')),
                  (s = i(a[0])),
                  (o = null == a[1] ? null : i(a[1])),
                  (t[s] = o);
              return t;
            })(e);
            for (var s in a) t[s] = a[s];
            return t;
          })(this.locationHash));
        const e = (function () {
          try {
            const e = window.sessionStorage.getItem('__mezon__initParams');
            return e ? JSON.parse(e) : null;
          } catch (e) {}
          return null;
        })();
        if (e) for (var t in e) void 0 === this.initParams[t] && (this.initParams[t] = e[t]);
        !(function (e, t) {
          try {
            return window.sessionStorage.setItem('__mezon__initParams', JSON.stringify(t)), !0;
          } catch (e) {}
        })(0, this.initParams);
      }
      initIframe() {
        try {
          const e = this;
          if (((this.isIframe = null != window.parent && window != window.parent), !this.isIframe))
            return;
          this.handleMessage(),
            (e.iFrameStyle = document.createElement('style')),
            document.head.appendChild(e.iFrameStyle);
          try {
            window.parent.postMessage(
              JSON.stringify({ eventType: a.IframeReady, eventData: { reload_supported: !0 } }),
              '*'
            );
          } catch (e) {}
        } catch (e) {}
      }
      handleMessage() {
        const e = this;
        window.addEventListener('message', function (t) {
          if (t.source !== window.parent) return;
          let i = {};
          try {
            i = JSON.parse(t.data);
          } catch (e) {
            return;
          }
          if (i && i.eventType)
            switch (i.eventType) {
              case r.SetCustomStyle:
                t.origin === n &&
                  'string' == typeof i.eventData &&
                  (e.iFrameStyle.innerHTML = i.eventData);
                break;
              case r.ReloadIframe:
                try {
                  window.parent.postMessage(
                    JSON.stringify({ eventType: a.IframeWillReloaded }),
                    '*'
                  );
                } catch (e) {
                  console.log('error', e);
                }
                location.reload();
                break;
              default:
                e.receiveEvent(i.eventType, i.eventData);
            }
        });
      }
      callEventCallbacks(e, t) {
        const n = this.eventHandlers[e];
        if (void 0 !== n && n.length)
          for (var r = 0; r < n.length; r++)
            try {
              t(n[r]);
            } catch (e) {
              console.error(e);
            }
      }
    })();
  })();
  var n = (Mezon = 'undefined' == typeof Mezon ? {} : Mezon);
  for (var r in t) n[r] = t[r];
  t.__esModule && Object.defineProperty(n, '__esModule', { value: !0 });
})();