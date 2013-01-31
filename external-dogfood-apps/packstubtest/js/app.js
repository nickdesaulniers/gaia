window.addEventListener('localized', function localized() {
  var $ = document.getElementById.bind(document),
      l10n = document.webL10n,
      progressBar = $('progressBar'),
      updateCheck = $('updateCheck'),
      errors = $('errors'),
      localeText = function localeText(localeKey, interObject) {
        return document.createTextNode(l10n.get(localeKey, interObject));
      },
      getSelfCheckUpdate = function getSelfCheckUpdate () {
        var getSelf = navigator.mozApps.getSelf();
          getSelf.onsuccess = function getSelfOnSuccess() {
            var self = getSelf.result,
                checkUpdate = self.checkForUpdate();

            checkUpdate.onsuccess = function checkUpdateOnSuccess() {
              if (self.downloadAvailable) {
                errors.innerHTML = '';
                progressBar.setAttribute('max', self.downloadSize);
                $('updateSize').appendChild(localeText('updateSize',
                  { numBytes: self.downloadSize }));
                $('updateButton').addEventListener('click', self.download.bind(self));
                $('checking').style.display = 'none';
                $('notifications').style.display = 'block';

                self.onprogress = function selfOnProgress() {
                  progressBar.setAttribute('value',
                    self.progress < self.downloadSize ? self.progress : self.downloadSize);
                };

                self.ondownloadsuccess = function selfOnDownloadSuccess() {
                  alert(l10n.get('closeWindow'));
                  window.close();
                };

                self.ondownloaderror = function selfOnDownloadError() {
                  error();
                };
              } else {
                error(l10n.get('noUpdate'));
              }
            };

            checkUpdate.onerror = function checkUpdateOnError() {
              error(checkUpdate.error.name === 'NETWORK_ERROR' ?
                l10n.get('noInternet') : null);
            };
          };

          getSelf.onerror = error;
      },
      error = function error(message) {
        var p = document.createElement('p'),
            button = document.createElement('button');
        message = message || l10n.get('failedFetch');
        p.setAttribute('class', 'center red');
        p.appendChild(document.createTextNode(message));
        $('checking').style.display = 'none';
        errors.innerHTML = '';
        button.appendChild(localeText('recheck'));
        button.onclick = getSelfCheckUpdate;
        errors.appendChild(p);
        errors.appendChild(button);
      };

  window.removeEventListener('localized', localized);
  document.documentElement.lang = l10n.getLanguage();
  document.documentElement.dir = l10n.getDirection();

  $('updateButton').appendChild(localeText('updateButton'));
  $('updateRequired').appendChild(localeText('updateRequired'));
  updateCheck.insertBefore(localeText('updateCheck'), updateCheck.firstChild);
  getSelfCheckUpdate();
});