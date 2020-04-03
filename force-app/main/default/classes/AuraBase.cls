/**
 * Base class to handle the exceptions, send lighting response as object with errors and exceptions.
 *
 * @author  Mukesh Yadav <tmp@itzmukeshy7.dev>
 * @version 1.0
 * @since   1.0
 *
 * @example
 * AuraBase r = new AuraBase();
 * r.errors.add('Error message');
 * r.handleErrors();
 *
 * AuraBase r = new AuraBase();
 * try{
 *  Integer anError = 1/0;
 * }catch(Exception e){
 *   r.handleException(e);
 * }
 */
public with sharing class AuraBase {

  private String scope { get; set; }

  public List<String> errors { get; set; }

  @AuraEnabled
  public Map<String, Object> data { get; set; }

  public AuraBase(String scope) {
    this.init(scope);
  }

  public AuraBase() {
    this.init('');
  }

  private void init(String scope) {
    this.scope = scope;
    this.errors = new List<String>();
    this.data = new Map<String, Object>();
  }

  public void handleException(Exception e) {
    System.debug('handleException: ' + this.scope + ' -::- ' + e.getMessage());
    handleException(e, true);
  }

  public void handleException(Exception e, Boolean throwAura) {
    //@todo implement the logic to email/save the exception(this.scope, e) into database.
    if (throwAura) {
      this.sendAuraException(e.getMessage());
    }
  }

  public void handleErrors() {
    if (!this.errors.isEmpty()) {
      //@todo implement the logic to email/save the errors(this.scope, errors) into database.
      System.debug('handleErrors: ' + this.scope + ' -::- ' + this.errors);
      this.sendAuraException(String.join(this.errors, ', ') + '.');
    }
  }

  private void sendAuraException(String message) {
    if (!Test.isRunningTest()) {
      throw new AuraHandledException(message);
    }
  }

  @AuraEnabled
  public static AuraBase getNamespace() {
    AuraBase r = new AuraBase('AuraBase.getNamespace');
    r.data.put('namespace', getNamespacePrefix());
    return r;
  }

  public static String getOrgOrPkgNamespace() {
    ApexClass ac =[SELECT NamespacePrefix FROM ApexClass WHERE Name = 'AuraBase'];
    return ac.NamespacePrefix;
  }

  public static String getNamespacePrefix() {
    String nameSpacePrefix = getOrgOrPkgNamespace();
    if(String.isNotBlank(nameSpacePrefix)) {
      nameSpacePrefix += '__';
    } else {
      nameSpacePrefix = '';
    }
    return namespacePrefix;
  }
}