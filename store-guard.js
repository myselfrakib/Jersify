/**
 * JERSIFY — Store Status Guard
 * Directs visitors to the Relaunch Countdown Page when the store is marked Closed by Admin.
 * Admin pages and countdown.html are never redirected.
 */
(function () {
  var path = (window.location.pathname || '').toLowerCase();
  var isCountdown = path.indexOf('countdown.html') !== -1;
  var isAdmin = path.indexOf('admin-') !== -1 || path.indexOf('admin.html') !== -1;
  var isPreview = (window.location.search || '').indexOf('preview=true') !== -1;

  if (isCountdown || isAdmin || isPreview) {
    return;
  }

  // Fast check from session cache for instant redirect
  try {
    if (sessionStorage.getItem('jersify_store_closed') === 'true') {
      window.location.replace('countdown.html');
      return;
    }
  } catch (e) {}

  // Fetch live store status from Firebase Realtime Database
  var statusUrl = 'https://jersify-f9b5e-default-rtdb.firebaseio.com/settings/storeStatus.json';
  fetch(statusUrl)
    .then(function (res) { return res.json(); })
    .then(function (data) {
      if (data && data.isOpen === false) {
        try { sessionStorage.setItem('jersify_store_closed', 'true'); } catch (e) {}
        window.location.replace('countdown.html');
      } else {
        try { sessionStorage.removeItem('jersify_store_closed'); } catch (e) {}
      }
    })
    .catch(function () {});
})();
