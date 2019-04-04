({
  getAccounts: function (c) {
    var h = this;
    h.request(c, 'getAccounts', {}, function (r) {
      c.set('v.accounts', r.accounts);
    });
  }
})