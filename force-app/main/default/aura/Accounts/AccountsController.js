({
  /**
   * @description init handler.
   *
   * @author  Mukesh Yadav <tmp@itzmukeshy7.dev>
   * @version 1.0
   * @since   1.0
   *
   * @param {Object} c Component reference.
   * @param {Object} e Event reference.
   * @param {Object} h Helper reference.
   */
  onInit: function(c, e, h) {
    /**
     * Fetching accounts.
     */
    h.getAccounts(c);
  },
});