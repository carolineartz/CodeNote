YUI.add('cn-code-note-popup', function (Y) {

  var POPUP_TEMPLATE    = chrome.extension.getURL('resources/templates/popup.html'),    
    TAG_TEMPLATE    = '<button class="btn btn-small btn-white btn-outline cn-tag">{tag}</button>',
    MESSSAGE_TEMPLATE = '<div id="codenote">' + 
    '<div class="code-note-message"><h4 class="cn-head"><strong>{message}</strong></h4></div></div>';

  Y.namespace('CN').Popup = Y.Base.create('cn-code-note-popup', Y.Base, [], {

    _panel      : null,
    _select     : null,
    _btnSave    : null,
    _inputTitle : null,
    _inputSearch: null,
    _inputTags  : null,
    _blockTags  : null,
    _btnClear   : null,
    _btnCancel  : null,

    initializer: function (config) {
      var self = this,
          callback = config.callback;

      if (callback) {
        self.set('callback', callback);
      }
      
      Y.io(POPUP_TEMPLATE, {
        on: {
          success: function (transactionid, response) {
            var html = Y.one('html'),
              panel = Y.Node.create(response.responseText);

            self._panel     = panel;
            self._select    = panel.one('#cn-notebook');
            self._btnSave     = panel.one('#cn-save-btn');
            self._inputTitle  = panel.one('#cn-title');
            self._inputSearch = panel.one('#cn-search');
            self._blockTags   = panel.one('#cn-selected-tags');
            self._inputTags   = panel.one('#cn-tags');
            self._btnClear    = panel.one('#cn-clear-search');
            self._btnCancel   = panel.one('#cn-cancel-btn');

            panel.hide();
            html.appendChild(panel);

            if (Y.Lang.isFunction(callback)) {
              self._btnCancel.on('click', function (event) {
                callback();
              });
            }
          }
        }
      });
    },

    initUI: function (credentials, codeBlocks) {
      var self = this,
        evernoteStorage,
        _error = function (err) {
          self.showErrorMessage(err);
        };

      if (Y.Lang.isValue(self._panel) && Y.Lang.isString(credentials.oauth_token)) {
        evernoteStorage = new Y.CN.Evernote.Storage({ noteStoreURL: credentials.note_store_url, authenticationToken: credentials.oauth_token });

        self._initTags(evernoteStorage);

        evernoteStorage.notebooksPromise().then(function (list) {
          Y.Array.each(list, function (item) {
            var guid = item.guid,
              name = item.name,
              option = Y.Node.create(Y.Lang.sub('<option value="{guid}">{name}</option>', { guid: guid, name: name }));

            if (item.defaultNotebook) {
              evernoteStorage.setNotebook(guid);
              option.set('selected', 'selected');
            }
              
            self._select.appendChild(option);
          });
        }, _error);

        self._select.on('change', function (event) {
          var guid = event.target.get('value');

          evernoteStorage.setNotebook(guid);  
        });

        self._inputSearch.plug(Y.Plugin.AutoComplete, {
          resultHighlighter: 'phraseMatch',
          // resultFilters: 'phraseMatch',
          resultTextLocator: 'title',
          source: function (query, callback) {
            evernoteStorage.searchNotesPromise(query).then(callback, _error);
          },
          on: {
            select: function (event) {
              var selectedNote = event.result.raw;
              evernoteStorage.setNotePromise(selectedNote.guid).then(function (note) {
                self._inputTitle.set('value', note.title);
                self._inputTags.setAttribute('disabled', 'disabled');
                self._select.setAttribute('disabled', 'disabled');
              }, _error);
            }
          }
        });

        self._btnClear.on('click', function (event) {
          evernoteStorage.clearNote();
          self._inputTitle.set('value', '');
          self._inputSearch.set('value', '');
          self._inputTags.removeAttribute('disabled');
          self._select.removeAttribute('disabled');
        });

        self._inputTitle.on('change', function (event) {
          var title = event.target.get('value');

          evernoteStorage.setTitle(title);
        });

        self._btnSave.on('click', function (event) {
          self._doSave(evernoteStorage, codeBlocks);
        });
      }
    },

    _initTags: function (evernoteStorage) {
      var self = this;

      evernoteStorage.tagsPromise().then(function (list) {
        var tags = [],
          selectedTags = {};

        Y.Array.each(list, function (tag) {
          tags.push(tag);
        });

        self._inputTags.plug(Y.Plugin.AutoComplete, {
          resultHighlighter: 'phraseMatch',
          resultFilters: 'phraseMatch',
          resultTextLocator: 'name',
          source: function (query, callback) {
            var newTags = [],
              i;
            
            for (i = 0; i < tags.length; i++) {
              if (!(tags[i].guid in selectedTags)) {
                newTags.push(tags[i]);
              }
            }

            callback(newTags);
          },
          on: {
            select: function (event) {
              var eTag = event.result.raw,
                tagButton = Y.Node.create(Y.Lang.sub(TAG_TEMPLATE, {tag: eTag.name}));

              selectedTags[eTag.guid] = eTag.name;
              evernoteStorage.addTag(eTag.guid);
              
              self._blockTags.appendChild(tagButton);
              tagButton.on('click', function (event) {
                delete selectedTags[eTag.guid];
                evernoteStorage.removeTag(eTag.guid);
                self._blockTags.removeChild(this);
              }, tagButton);
            }
          }
        });
      }, function (err) {
        self.showErrorMessage(err);
      });
    },

    _doSave: function (evernoteStorage, codeBlocks) {
      var self = this,
        callback = this.get('callback'),
        selectedBlocks = codeBlocks.filter('.cn-selected'),
        note = Y.Node.create('<div></div>'),
        pack;

      selectedBlocks.each(function (node) {
        var cloneNode = node.cloneNode(true);

        Y.CN.CSSInliner.toInline(cloneNode);
        cloneNode.removeAttribute('selected');
        note.appendChild(cloneNode);
      });

      evernoteStorage.savePromise(note.getHTML()).then(function (note) {
        Y.log(note);
        self.showOkMessage();
      }, function (err) {
        self.showErrorMessage(err);
      });
      
      if (Y.Lang.isFunction (callback)) {
        callback();
      }
    },

    _hideMessage: function (panel) {
      Y.later(3 * 1000, this, function () {
                var anim = new Y.Anim({
                    node    : panel,
                    duration: 2,
                    to      : {
                        opacity: 0
                    },
                    after   : {
                        end: function (event) {
                            panel.remove(true);
                        }
                    }
                });
                anim.run();
            });
    },

    showOkMessage: function () {
      var html = Y.one('html'),
        panel = Y.Node.create(Y.Lang.sub(MESSSAGE_TEMPLATE, { message: 'Success!' }));
      html.appendChild(panel);    
      
      this._hideMessage(panel);
    },

    showErrorMessage: function (error) {
      var html = Y.one('html'),
        panel = Y.Node.create(Y.Lang.sub(MESSSAGE_TEMPLATE, { message: 'Error! code: ' + (error.code || '') }));
      html.appendChild(panel);
      
      this._hideMessage(panel);
    },

    show: function () {
      if (Y.Lang.isValue(this._panel)) {
        this._panel.show();
      }
    },

    hide: function () {
      if (Y.Lang.isValue(this._panel)) {
        this._panel.hide();
      }
    },

    reset: function () {
      if (Y.Lang.isValue(this._panel)) {
        // select field
        this._select.removeAttribute('disabled');
        this._select.empty();
        
        // input search field
        this._inputSearch.set('value', '');
        this._inputSearch.unplug(Y.Plugin.AutoComplete);
        this._inputSearch.detach();
        
        // input title field
        this._inputTitle.set('value', '');
        
        // input tags field
        this._inputTags.removeAttribute('disabled');
        this._inputTags.set('value', '');
        this._inputTags.unplug(Y.Plugin.AutoComplete);
        this._inputTags.detach();
        this._blockTags.empty();

        // buttons
        this._btnClear.detach();
        this._btnSave.detach();
      }
    }

  }, {
    ATTRS: {
      callback: {
        value: null,
        validator: Y.Lang.isFunction
      }
    }
  });

}, '1.0', {
  requires: [
    'node',
    'anim-base',
    'io-base',
    'autocomplete',
    'autocomplete-highlighters',
    'autocomplete-filters',
    'cn-evernote-storage',
    'cn-css-inliner'
  ]
});