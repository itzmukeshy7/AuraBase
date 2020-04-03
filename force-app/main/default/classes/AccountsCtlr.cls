/**
 * Controller for lightning components.
 *
 * @author  Mukesh Yadav <tmp@itzmukeshy7.dev>
 * @version 1.0
 * @since   1.0
 *
 * @example
 * <aura:component controller="AccountsCtlr" >
 * </aura:component>
 */
public with sharing class AccountsCtlr {

  /**
   * Get 100 accounts.
   *
   * @author  Mukesh Yadav <tmp@itzmukeshy7.dev>
   * @version 1.0
   * @since   1.0
   *
   * @return Returns 100 accounts.
   */
  @AuraEnabled
  public static AuraBase getAccounts(){
    AuraBase r = new AuraBase('AccountsCtlr.getAccounts');

    List<Record> accounts = new List<Record>();
    for(Account a:[SELECT Name FROM Account LIMIT 100]){
      accounts.add(new Record(a));
    }
    r.data.put('accounts', accounts);

    return r;
  }

  /**
   * Account record wrapper.
   *
   * @author  Mukesh Yadav <tmp@itzmukeshy7.dev>
   * @version 1.0
   * @since   1.0
   */
  public with sharing class Record{
    @AuraEnabled
    public Id id{get;set;}
    @AuraEnabled
    public String name{get;set;}

    public Record(Account a){
      this.id = a.Id;
      this.name = a.Name;
    }
  }

}