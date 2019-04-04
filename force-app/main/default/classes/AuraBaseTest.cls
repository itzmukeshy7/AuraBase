@IsTest
private class AuraBaseTest {

  @IsTest
  static void allTests() {

    AuraBase r = new AuraBase('AuraBaseTest.positiveTests');

    Test.startTest();
    r.errors.add('Some error message');
    try {
      r.handleErrors();
      String s;
      Boolean c = s.contains('abc');
    } catch (Exception e) {
      r.handleException(e);
    }

    r = AuraBase.getNamespace();
    System.assert(r.data.get('namespace') != null);
    Test.stopTest();
  }

}