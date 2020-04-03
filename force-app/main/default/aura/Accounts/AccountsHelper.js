({
  /**
   * @description Get accounts from server and update attribute.
   *
   * @author  Mukesh Yadav <tmp@itzmukeshy7.dev>
   * @version 1.0
   * @since   1.0
   *
   * @param {Object} c Component reference.
   */
  getAccounts: function(c) {
    /**
     * Helper reference,
     * we can get the helper reference inside the Helper.js using this.
     */
    const h = this;

    /**
     * Fetching data from server.
     * @see AuraBaseHelper.js->request();
     */
    h.request(c, 'getAccounts', {}, function(r) {
      c.set('v.accounts', r.accounts);
    });
  },
});