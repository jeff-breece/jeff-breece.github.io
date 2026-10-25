// The stub's 404 (board #9). GitHub Pages serves 404.html at the address that was asked for, so location.pathname is the
// old path: send the visitor to the same path on Bearing Out, and point the visible link there too in case this is slow.
(function () {
  var u = 'https://bearingout.com' + location.pathname + location.search + location.hash;
  var a = document.getElementById('go');
  if (a) a.href = u;
  location.replace(u);
})();
