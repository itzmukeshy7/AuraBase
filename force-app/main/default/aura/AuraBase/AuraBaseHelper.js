({
  id: 0,
  getUID: function () {
    var h = this;
    return h.id++;
  },
  showToast: function (toastType, message, tmpParams) {
    tmpParams['type'] = toastType;
    tmpParams['message'] = message;
    var showToast = $A.get('e.force:showToast');
    if (showToast) {
      showToast.setParams(Object.assign({ mode: 'dismissible' }, tmpParams)).fire();
    }
  },
  info: function (message, params) {
    this.showToast('info', message, (params || {}));
  },
  success: function (message, params) {
    this.showToast('success', message, (params || {}));
  },
  warning: function (message, params) {
    this.showToast('warning', message, (params || {}));
  },
  error: function (message, params) {
    this.showToast('error', message, (params || {}));
  },

  tab: function (tabAPIName, isRedirect) {
    var h = this;
    h.redirect(('/one/one.app#/n/' + tabAPIName), isRedirect);
  },
  redirect: function (url, isRedirect) {
    var navigateToURL = $A.get('e.force:navigateToURL');
    if (navigateToURL) {
      navigateToURL.setParams({
        url: url,
        isredirect: (isRedirect === true)
      }).fire();
    }
  },
  navigateToComponent: function (componentNameWithNamespace, componentAttributes, isRedirect) {
    var attributes = {};
    if (Object.keys(componentAttributes || {}).length > 0) {
      attributes = componentAttributes;
    }
    var navigateToComponent = $A.get('e.force:navigateToComponent');
    if (navigateToComponent) {
      navigateToComponent.setParams({
        componentDef: componentNameWithNamespace,
        componentAttributes: attributes,
        isredirect: (isRedirect === true)
      }).fire();
    }
  },

  isValid: function (c, id) {
    var validateFields = c.find(id || 'validate');
    var isValid;
    if (validateFields) {
      isValid = [].concat(validateFields).reduce(function (validSoFar, input) {
        input.showHelpMessageIfInvalid();
        return validSoFar && input.get('v.validity').valid;
      }, true);
    }
    return isValid;
  },

  request: function (c, methodName, params, success, tmpOptions) {
    var action = c.get('c.' + methodName);
    var options = Object.assign({
      spinnerAttr: 'isProcessing',
      showSpinner: true,
      hideSpinner: true,
      handleErrors: true
    }, tmpOptions);

    if (Object.keys(params)) {
      action.setParams(params);
    }

    if (options.background) {
      action.setBackground();
    }

    if (options.storable) {
      action.setStorable();
    }

    if (options.abortable) {
      action.setAbortable();
    }

    var hideSpinner = false;
    if (options.showSpinner && options.spinnerAttr) {
      hideSpinner = true;
      c.set(('v.' + options.spinnerAttr), true);
    }

    action.setCallback(this, function (response) {
      if (options.showSpinner) {
        hideSpinner = true;
        c.set(('v.' + options.spinnerAttr), true);
      }

      switch (response.getState()) {
        case 'SUCCESS':
          success(response.getReturnValue().data || {});
          break;

        case 'ERROR':
          var errors = response.getError();
          if (options.handleErrors) {
            this.handleErrors(c, errors);
          }

          if (options.error) {
            options.error(errors);
          }
          if (hideSpinner) {
            c.set(('v.' + options.spinnerAttr), false);
          }
          break;

        default:
      }

      if (options.done) {
        options.done();
      }

      if (hideSpinner && options.hideSpinner) {
        c.set(('v.' + options.spinnerAttr), false);
      }
    });
    $A.enqueueAction(action);
  },
  handleErrors: function (c, errors) {
    var h = this;
    if (errors && $A.util.isArray(errors)) {
      var errorMessages = [];
      errors.forEach(function (error) {
        if (error.pageErrors && $A.util.isArray(error.pageErrors)) {
          error.pageErrors.forEach(function (pageError) {
            errorMessages.push(pageError.message);
          });

          if (errorMessages.length > 0) {
            h.error(errorMessages.join(', '), { title: 'Fix the error(s)' });
            errorMessages = [];
          }
        }

        if (error.fieldErrors) {
          if ($A.util.isArray(error.fieldErrors)) {
            error.fieldErrors.forEach(function (field) {
              error.fieldErrors[field].forEach(function (errorList) {
                errorMessages.push(errorList.message);
              });
            });

            if (errorMessages.length > 0) {
              h.error(errorMessages.join(', '), { title: 'Fix the error(s)' });
              errorMessages = [];
            }
          } else if (Object.keys(error.fieldErrors)) {
            Object.keys(error.fieldErrors).forEach(function (field) {
              error.fieldErrors[field].forEach(function (errorList) {
                errorMessages.push(errorList.message);
              });
            });

            if (errorMessages.length > 0) {
              h.error(errorMessages.join(', '), { title: 'Fix the error(s)' });
              errorMessages = [];
            }
          }
        }

        var message = error.message || '';
        if (message.indexOf('FIELD_CUSTOM_VALIDATION_EXCEPTION') > 0) {
          message = message.split('FIELD_CUSTOM_VALIDATION_EXCEPTION, ')[1];
          message = message.split(': ')[0];
        } else if (message.indexOf('DUPLICATE_VALUE') > 0) {
          message = message.split('DUPLICATE_VALUE, ')[1];
          message = message.split(': ')[0];
        }
        errorMessages.push(message);
      });

      if (errorMessages.length > 0) {
        h.error(errorMessages.join(', '));
      }
    } else {
      h.error('Contact Administrator!', { title: 'Something went wrong!', });
    }

    if (errors && Array.isArray(errors)) {
      var errorMessages = [];
      errors.forEach(function (error) {
        if (error.pageErrors && Array.isArray(error.pageErrors)) {
          error.pageErrors.forEach(function (pageError) {
            errorMessages.push(pageError.message);
          });

          if (errorMessages.length > 0) {
            h.warning(errorMessages.join(', '), { mode: 'sticky', title: 'Fix the errors.' });
            errorMessages = [];
          }
        }

        if (error.fieldErrors && Array.isArray(error.fieldErrors)) {
          error.fieldErrors.forEach(function (field) {
            error.fieldErrors[field].forEach(function (errorList) {
              errorMessages.push(errorList.message);
            });
          });

          if (errorMessages.length > 0) {
            h.warning(errorMessages.join(', '), { mode: 'sticky', title: 'Fix the errors.' });
            errorMessages = [];
          }
        }

        if (error.fieldErrors && Object.keys(error.fieldErrors)) {
          Object.keys(error.fieldErrors).forEach(function (field) {
            error.fieldErrors[field].forEach(function (errorList) {
              errorMessages.push(errorList.message);
            });
          });

          if (errorMessages.length > 0) {
            h.warning(errorMessages.join(', '), { mode: 'sticky', title: 'Fix the errors.' });
            errorMessages = [];
          }
        }


        var message = error.message || '';
        var statusCodes = {
          'ALL_OR_NONE_OPERATION_ROLLED_BACK': 'The bulk operation was rolled back because one of the records wasn\'t processed successfully.',
          'ALREADY_IN_PROCESS': 'You can\'t submit a record that is already in an approval process.Wait for the previous approval process to complete before resubmitting a request with this record.',
          'ASSIGNEE_TYPE_REQUIRED': 'Designate an assignee for the approval request (ProcessInstanceStep or ProcessInstanceWorkitem).',
          'BAD_CUSTOM_ENTITY_PARENT_DOMAIN': 'The changes you are trying to make can\'t be completed because changes to the associated master-detail relationship can\'t be made.',
          'BCC_NOT_ALLOWED_IF_BCC_COMPLIANCE_ENABLED': 'Your client application blind carbon-copied an email address even though the org\'s Compliance BCC Email option is enabled. This option specifies a particular email address that automatically receives a copy of all outgoing email. When this option is enabled, you can\'t BCC any other email address. To disable the option, log in to the user interface and from Setup, enter Compliance BCC Email in the Quick Find box, then select Compliance BCC Email.',
          'BCC_SELF_NOT_ALLOWED_IF_BCC_COMPLIANCE_ENABLED': 'Your client application blind carbon-copied the logged-in user\'s email address even though the org\'s BCC COMPLIANCE option is set to true. This option specifies a particular email address that automatically receives a copy of all outgoing email. When this option is enabled, you can\'t BCC any other email address. To disable the option, log in to the user interface and from Setup, enter Compliance BCC Email in the Quick Find box, then select Compliance BCC Email.',
          'CANNOT_CASCADE_PRODUCT_ACTIVE': 'An update to a product caused by a cascade can\'t be done because the associated product is active.',
          'CANNOT_CHANGE_FIELD_TYPE_OF_APEX_REFERENCED_FIELD': 'You can\'t change the type of a field that is referenced in an Apex script.',
          'CANNOT_CREATE_ANOTHER_MANAGED_PACKAGE': 'You can create only one managed package in an org.',
          'CANNOT_DEACTIVATE_DIVISION': 'You can\'t deactivate Divisions if an assignment rule references divisions or if the DefaultDivision field on a user record isn\'t set to null.',
          'CANNOT_DELETE_LAST_DATED_CONVERSION_RATE': 'If dated conversions are enabled, you must have at least one DatedConversionRate record.',
          'CANNOT_DELETE_MANAGED_OBJECT': 'You can\'t modify components that are included in a managed package.',
          'CANNOT_DISABLE_LAST_ADMIN': 'You must have at least one active administrator user.',
          'CANNOT_ENABLE_IP_RESTRICT_REQUESTS': 'If you exceed the limit of five IP ranges specified in a profile, you can\'t enable restriction of login by IP addresses. Reduce the number of specified ranges in the profile and try the request again.',
          'CANNOT_INSERT_UPDATE_ACTIVATE_ENTITY': '',
          'CANNOT_MODIFY_MANAGED_OBJECT': 'You can\'t modify components that are included in a managed package.',
          'CANNOT_RENAME_APEX_REFERENCED_FIELD': 'You can\'t rename a field that is referenced in an Apex script.',
          'CANNOT_RENAME_APEX_REFERENCED_OBJECT': 'You can\'t rename an object that is referenced in an Apex script.',
          'CANNOT_REPARENT_RECORD': 'You can\'t define a new parent record for the specified record.',
          'CANNOT_RESOLVE_NAME': 'A sendEmail() call could not resolve an object name.',
          'CANNOT_UPDATE_CONVERTED_LEAD': 'A converted lead could not be updated.',
          'CANT_DISABLE_CORP_CURRENCY': 'You can\'t disable the corporate currency for an org. To disable a currency that is set as the corporate currency, first use the user interface to change the corporate currency to a different currency. Then disable the original currency.',
          'CANT_UNSET_CORP_CURRENCY': 'You can\'t change the corporate currency for an org from the API. Use the user interface to change the corporate currency.',
          'CHILD_SHARE_FAILS_PARENT': 'If you don\'t have appropriate permissions on a parent record, you can\'t change the owner of or define sharing rules for a child record. For example, you can\'t change the owner of a contact record if you can\'t edit its parent account record.',
          'CIRCULAR_DEPENDENCY': 'You can\'t create a circular dependency between metadata objects in your org. For example, public group A can\'t include public group B, if public group B already includes public group A.',
          'COMMUNITY_NOT_ACCESSIBLE': 'You do not have permission to access the community that this entity belongs to. You must be given permission to access the community before you can access this entity.',
          'CUSTOM_CLOB_FIELD_LIMIT_EXCEEDED': 'You can\'t exceed the maximum size for a CLOB field.',
          'CUSTOM_ENTITY_OR_FIELD_LIMIT': 'You have reached the maximum number of custom objects or custom fields for your org.',
          'CUSTOM_FIELD_INDEX_LIMIT_EXCEEDED': 'You have reached the maximum number of indexes on a field for your org.',
          'CUSTOM_INDEX_EXISTS': 'You can create only one custom index per field.',
          'CUSTOM_LINK_LIMIT_EXCEEDED': 'You have reached the maximum number of custom links for your org.',
          'CUSTOM_METADATA_LIMIT_EXCEEDED': 'Your org has reached its custom metadata maximum limit.',
          'CUSTOM_SETTINGS_LIMIT_EXCEEDED': 'Your org has reached its custom settings maximum limit.',
          'CUSTOM_TAB_LIMIT_EXCEEDED': 'You have reached the maximum number of custom tabs for your org.',
          'DELETE_FAILED': 'You can\'t delete a record because it is in use by another object.',
          'DEPENDENCY_EXISTS': 'You can\'t perform the requested operation because of an existing dependency on the specified object or field.',
          'DUPLICATE_CASE_SOLUTION': 'You can\'t create a relationship between the specified case and solution because it already exists.',
          'DUPLICATE_CUSTOM_ENTITY_DEFINITION': 'Custom object or custom field IDs must be unique.',
          'DUPLICATE_CUSTOM_TAB_MOTIF': 'You can\'t create a custom object or custom field with a duplicate master name.',
          'DUPLICATE_DEVELOPER_NAME': 'You can\'t create a custom object or custom field with a duplicate developer name.',
          'DUPLICATES_DETECTED': 'Duplicate records have been detected. Used for an Error object with a data type of DuplicateError.',
          'DUPLICATE_EXTERNAL_ID': 'A user-specified external ID matches more than one record during an upsert.',
          'DUPLICATE_MASTER_LABEL': 'You can\'t create a custom object or custom field with a duplicate master name.',
          'DUPLICATE_SENDER_DISPLAY_NAME': 'A sendEmail() call could not choose between OrgWideEmailAddress.DisplayName or senderDisplayName. Define only one of the two fields.',
          'DUPLICATE_USERNAME': 'A create, update, or upsert failed because of a duplicate user name.',
          'DUPLICATE_VALUE': 'You can\'t supply a duplicate value for a field that must be unique. For example, you can\'t submit two copies of the same session ID in a invalidateSessions() call.',
          'EMAIL_ADDRESS_BOUNCED': 'Emails to one or more recipients have bounced. Check the email addresses to make sure that they are valid.',
          'EMAIL_NOT_PROCESSED_DUE_TO_PRIOR_ERROR': 'Because of an error earlier in the call, the current email was not processed.',
          'EMAIL_OPTED_OUT': 'A single email message was sent with the REJECT setting in the optOutPolicy field to recipients that have opted out from receiving email. To avoid this error, set the optOutPolicy field to another value.',
          'EMAIL_TEMPLATE_FORMULA_ERROR': 'The email template is invalid and can\'t be rendered. Check the template for incorrectly specified merge fields.',
          'EMAIL_TEMPLATE_MERGEFIELD_ACCESS_ERROR': 'You don\'t have access to one or more merge fields in this template. To request access, contact your Salesforce administrator.',
          'EMAIL_TEMPLATE_MERGEFIELD_ERROR': 'One or more merge fields don\'t exist. Check the spelling of field names.',
          'EMAIL_TEMPLATE_MERGEFIELD_VALUE_ERROR': 'One or more merge fields have no value. To provide values, update the records before sending the email.',
          'EMAIL_TEMPLATE_PROCESSING_ERROR': 'The merge fields in this email template can\'t be processed. Ensure that your template body is valid.',
          'EMPTY_SCONTROL_FILE_NAME': 'The Scontrol file name was empty, but the binary was not empty.',
          'ENTITY_FAILED_IFLASTMODIFIED_ON_UPDATE': 'If the value in a record\'s LastModifiedDate field is later than the current date, you can\'t update the record .',
          'ENTITY_IS_ARCHIVED': 'If a record has been archived, you can\'t access it.',
          'ENTITY_IS_DELETED': '',
          'ENTITY_IS_LOCKED': 'You can\'t edit a record that is locked by an approval process.',
          'ENVIRONMENT_HUB_MEMBERSHIP_CONFLICT': 'You can\'t add an org to more than one Environment Hub.',
          'ERROR_IN_MAILER': 'An email address is invalid, or another error occurred during an email-related transaction.',
          'FAILED_ACTIVATION': 'The activation of a Contract failed.',
          'FIELD_CUSTOM_VALIDATION_EXCEPTION': '',
          'FIELD_FILTER_VALIDATION_EXCEPTION': '',
          'FILTERED_LOOKUP_LIMIT_EXCEEDED': 'The creation of the lookup filter failed because it exceeds the maximum number of lookup filters allowed per object.',
          'HTML_FILE_UPLOAD_NOT_ALLOWED': 'Your attempt to upload an HTML file failed. HTML attachments and documents, including HTML attachments to a Solution, can\'t be uploaded if the Disallow HTML documents and attachments checkbox is selected on the HTML Documents and Attachments Settings page.',
          'IMAGE_TOO_LARGE': 'The image exceeds the maximum width, height, and file size.',
          'INACTIVE_OWNER_OR_USER': 'The owner of the specified item is an inactive user. To reference this item, either reactivate the owner or reassign ownership to another active user.',
          'INSERT_UPDATE_DELETE_NOT_ALLOWED_DURING_MAINTENANCE': 'Starting with version 32.0, you can\'t create, update, or delete data while the instance where your org resides is being upgraded to the latest release. Try again after the release has completed. For release schedules, see trust.salesforce.com. Before version 32.0, the code is INVALID_READ_ONLY_USER_DML.',
          'INSUFFICIENT_ACCESS_ON_CROSS_REFERENCE_ENTITY': 'An operation affects an object that is cross-referenced by the specified object, but the logged-in user doesn\'t have sufficient permissions on the cross-referenced object. For example, a logged-in user attempts to modify an account record, and the update creates a ProcessInstanceWorkitem. If the user doesn\'t have permission to approve, reject, or reassign the ProcessInstanceWorkitem, this exception occurs.',
          'INSUFFICIENT_ACCESS_OR_READONLY': 'You can\'t perform the specified action because you don\'t have sufficient permissions.',
          'INVALID_ACCESS_LEVEL': 'You can\'t define a new sharing rule that provides less access than the specified org-wide default.',
          'INVALID_ARGUMENT_TYPE': 'You supplied an argument that is of the wrong type for the operation being attempted.',
          'INVALID_ASSIGNEE_TYPE': 'You specified an assignee type that is not a valid integer between one and six.',
          'INVALID_ASSIGNMENT_RULE': 'You specified an assignment rule that is invalid or that isn\'t defined in the org.',
          'INVALID_BATCH_OPERATION': 'The specified batch operation is invalid.',
          'INVALID_CONTENT_TYPE': 'The outgoing email has anEmailFileAttachment with an invalidcontentType property. See RFC2045 - Internet Message Format.',
          'INVALID_CREDIT_CARD_INFO': 'The specified credit card information is not valid.',
          'INVALID_CROSS_REFERENCE_KEY': 'The specified value in a relationship field is not valid, or data is not of the expected type.',
          'INVALID_CROSS_REFERENCE_TYPE_FOR_FIELD': 'The specified cross-reference type is not valid for the specified field.',
          'INVALID_CURRENCY_CONV_RATE': 'Specify a positive, non-zero value for the currency conversion rate.',
          'INVALID_CURRENCY_CORP_RATE': 'You can\'t modify the corporate currency conversion rate.',
          'INVALID_CURRENCY_ISO': 'The specified currency ISO code is not valid.',
          'INVALID_EMAIL_ADDRESS': 'A specified email address is invalid.',
          'INVALID_EMPTY_KEY_OWNER': 'You can\'t set the value for owner to null.',
          'INVALID_EVENT_SUBSCRIPTION': 'Invalid parameters were specified when subscribing to an event.',
          'INVALID_FIELD': 'You specified an invalid field name when trying to update or upsert a record.',
          'INVALID_FIELD_FOR_INSERT_UPDATE': 'You can\'t combine a person account record type change with any other field update.',
          'INVALID_FIELD_WHEN_USING_TEMPLATE': 'You can\'t use an email template with an invalid field name.',
          'INVALID_FILTER_ACTION': 'The specified filter action can\'t be used with the specified object. For example, an alert is not a valid filter action for a Task.',
          'INVALID_ID_FIELD': 'The specified ID field (ID, ownerId), or cross-reference field is invalid.',
          'INVALID_INET_ADDRESS': 'A specified Inet address is not valid.',
          'INVALID_LINEITEM_CLONE_STATE': 'You can\'t clone a Pricebook2 or PricebookEntry record that isn\'t active.',
          'INVALID_MASTER_OR_TRANSLATED_SOLUTION': 'The solution is invalid. For example, this exception occurs if you try to associate a translated solution with a master solution that\'s associated with another translated solution.',
          'INVALID_MESSAGE_ID_REFERENCE': 'The outgoing email\'s References or In-Reply-To fields are invalid. These fields must contain valid Message-IDs. See RFC2822 - Internet Message Format.',
          'INVALID_OPERATION': 'There is no applicable approval process for the specified object.',
          'INVALID_OPERATOR': 'The specified operator is not applicable for the field type when used as a workflow filter.',
          'INVALID_OR_NULL_FOR_RESTRICTED_PICKLIST': 'You specified an invalid or null value for a restricted picklist.',
          'INVALID_PARTNER_NETWORK_STATUS': 'The specified partner network status is invalid for the specified template field.',
          'INVALID_PERSON_ACCOUNT_OPERATION': 'You can\'t delete a person account.',
          'INVALID_READ_ONLY_USER_DML': 'Version 31.0 and earlier: You can\'t create, update, or delete data while the instance where your org resides is being upgraded to the latest release. Try again after the release has completed. For release schedules, see trust.salesforce.com. After version 31.0, the code is INSERT_UPDATE_DELETE_NOT_ALLOWED_DURING_MAINTENANCE.',
          'INVALID_SAVE_AS_ACTIVITY_FLAG': 'Specify true or false for the saveAsActivity flag.',
          'INVALID_SESSION_ID': 'The specified sessionId is malformed (incorrect length or format) or has expired. Log in again to start a new session.',
          'INVALID_STATUS': 'The specified org status change is not valid.',
          'INVALID_TYPE': 'The specified type is not valid for the specified object.',
          'INVALID_TYPE_FOR_OPERATION': 'The specified type is not valid for the specified operation.',
          'INVALID_TYPE_ON_FIELD_IN_RECORD': 'The specified value is not valid for the specified field\'s type.',
          'IP_RANGE_LIMIT_EXCEEDED': 'The specified IP address is outside the IP range specified for the org.',
          'JIGSAW_IMPORT_LIMIT_EXCEEDED': 'The number of records you attempted to purchase from Data.com exceeds your available record addition limit.',
          'LICENSE_LIMIT_EXCEEDED': 'You have exceeded the number of licenses assigned to your org.',
          'LIGHT_PORTAL_USER_EXCEPTION': 'You attempted an action with a high-volume portal user that\'s not allowed. For example, trying to add the user to a case team.',
          'LIMIT_EXCEEDED': 'You have exceeded a limit on a field size or value, license, platform event publishing, or other component.',
          'LOGIN_CHALLENGE_ISSUED': 'An email containing a security token was sent to the user\'s email address because the user logged in from an untrusted IP address. The user can\'t log in until tthe security token is added to the end of the password.',
          'LOGIN_CHALLENGE_PENDING': 'The user logged in from an untrusted IP address, but a security token has not yet been issued.',
          'LOGIN_MUST_USE_SECURITY_TOKEN': 'The user must add a security token to the end of the password to log in.',
          'MALFORMED_ID': '',
          'MANAGER_NOT_DEFINED': 'A manager has not been defined for the specified approval process.',
          'MASSMAIL_RETRY_LIMIT_EXCEEDED': 'A mass mail retry failed because your org has exceeded its mass mail retry limit.',
          'MASS_MAIL_LIMIT_EXCEEDED': 'The org has exceeded its daily limit for mass email. Mass email messages can\'t be sent again until the next day.',
          'MAXIMUM_CCEMAILS_EXCEEDED': 'You have exceeded the maximum number of specified CC addresses in a workflow email alert.',
          'MAXIMUM_DASHBOARD_COMPONENTS_EXCEEDED': 'You have exceeded the document size limit for a dashboard.',
          'MAXIMUM_HIERARCHY_LEVELS_REACHED': 'You have reached the maximum number of levels in a hierarchy.',
          'MAXIMUM_SIZE_OF_ATTACHMENT': 'You have exceeded the maximum size of an attachment.',
          'MAXIMUM_SIZE_OF_DOCUMENT': 'You have exceeded the maximum size of a document.',
          'MAX_ACTIONS_PER_RULE_EXCEEDED': 'You have exceeded the maximum number of actions per rule.',
          'MAX_ACTIVE_RULES_EXCEEDED': 'You have exceeded the maximum number of active rules.',
          'MAX_APPROVAL_STEPS_EXCEEDED': 'You have exceeded the maximum number of approval steps for an approval process.',
          'MAX_FORMULAS_PER_RULE_EXCEEDED': 'You have exceeded the maximum number of formulas per rule.',
          'MAX_RULES_EXCEEDED': 'You have exceeded the maximum number of rules for an object.',
          'MAX_RULE_ENTRIES_EXCEEDED': 'You have exceeded the maximum number of entries for a rule.',
          'MAX_TASK_DESCRIPTION_EXCEEDED': 'The task description is too long.',
          'MAX_TM_RULES_EXCEEDED': 'You have exceeded the maximum number of rules per Territory.',
          'MAX_TM_RULE_ITEMS_EXCEEDED': 'You have exceeded the maximum number of rule criteria per rule for a Territory.',
          'MERGE_FAILED': 'A merge operation failed.',
          'MISSING_ARGUMENT': 'You did not specify a required argument.',
          'NONUNIQUE_SHIPPING_ADDRESS': 'You can\'t insert a reduction order item if the original order shipping address is different from the shipping address of other items in the reduction order.',
          'NO_APPLICABLE_PROCESS': 'A process() request failed because the record submitted does not satisfy the entry criteria of any active approval processes for which the user has permission.',
          'NO_ATTACHMENT_PERMISSION': 'Your org does not permit email attachments.',
          'NO_INACTIVE_DIVISION_MEMBERS': 'You can\'t add members to an inactive Division.',
          'NO_MASS_MAIL_PERMISSION': 'You don\'t have permission to send the email. You must have “Mass Email” to send mass mail or “Send Email” to send individual email.',
          'NUMBER_OUTSIDE_VALID_RANGE': 'The number specified is outside the valid range of values.',
          'NUM_HISTORY_FIELDS_BY_SOBJECT_EXCEEDED': 'The number of history fields specified for the sObject exceeds the allowed limit.',
          'OP_WITH_INVALID_USER_TYPE_EXCEPTION': 'The operation you attempted can\'t be performed for one or more users. For example, you can\'t add high-volume portal users to a group.',
          'OPTED_OUT_OF_MASS_MAIL': 'An email can\'t be sent because the specified User has opted out of mass mail.',
          'PACKAGE_LICENSE_REQUIRED': 'The logged-in user can\'t access an object that is in a licensed package without a license for the package.',
          'PLATFORM_EVENT_PUBLISHING_UNAVAILABLE': 'Publishing platform event messages failed due to a service being temporarily unavailable. Try again later.',
          'PORTAL_USER_ALREADY_EXISTS_FOR_CONTACT': 'A create User operation failed because you can\'t create a second portal user under a Contact.',
          'PRIVATE_CONTACT_ON_ASSET': 'You can\'t have a private contact on an asset.',
          'RECORD_IN_USE_BY_WORKFLOW': 'You can\'t access a record that\'s in use by a workflow or approval process.',
          'REQUEST_RUNNING_TOO_LONG': 'A request that has been running too long is canceled.',
          'REQUIRED_FIELD_MISSING': 'A call requires a field that was not specified.',
          'SELF_REFERENCE_FROM_TRIGGER': 'You can\'t recursively update or delete the same object from an Apex trigger. This error often occurs when: You try to update or delete an object from within its before trigger. You try to delete an object from within its after trigger. This error occurs with both direct and indirect operations. The following is an example of an indirect operation: A request is submitted to update Object A. A before update trigger on object A creates an object B. Object A is updated. An after insert trigger on object B queries object A and updates it. This update is an indirect update of object A because of the before trigger of object A, so an error is generated.',
          'SHARE_NEEDED_FOR_CHILD_OWNER': 'If a parent record has a child record that needs a sharing rule, you can\'t delete the sharing rule for the parent record.',
          'SINGLE_EMAIL_LIMIT_EXCEEDED': '(API version 18.0 and later) The org has exceeded its daily limit for individual emails. Individual email messages can\'t be sent again until the next day.',
          'STANDARD_PRICE_NOT_DEFINED': 'Custom prices can\'t be defined without corresponding standard prices.',
          'STORAGE_LIMIT_EXCEEDED': 'You have exceeded your org\'s storage limit.',
          'STRING_TOO_LONG': 'The specified string exceeds the maximum allowed length.',
          'TABSET_LIMIT_EXCEEDED': 'You have exceeded the number of tabs allowed for a tabset.',
          'TEMPLATE_NOT_ACTIVE': 'The template specified is unavailable. Specify another template or make the template available for use.',
          'TERRITORY_REALIGN_IN_PROGRESS': 'An operation can\'t be performed because a territory realignment is in progress.',
          'TEXT_DATA_OUTSIDE_SUPPORTED_CHARSET': 'The specified text uses a character set that is not supported.',
          'TOO_MANY_APEX_REQUESTS': 'Too many Apex requests have been sent. This error is transient. Resend your request after a short wait.',
          'TOO_MANY_ENUM_VALUE': 'A request failed because too many values were passed in for a multi-select picklist. You can select a maximum of 100 values for a multi-select picklist.',
          'TRANSFER_REQUIRES_READ': 'You can\'t assign the record to the specified User because the user does not have read permission.',
          'UNABLE_TO_LOCK_ROW': 'A deadlock or timeout condition has been detected. A deadlock involves at least two transactions that are attempting to update overlapping sets of objects. If the transaction involves a summary field, the parent objects are locked, making these transactions especially prone to deadlocks. To debug, check your code for deadlocks and correct. Deadlocks are generally not the result of an issue with Salesforce operations. A timeout occurs when a transaction takes too long to complete, for example, when replacing a value in a picklist or changing a custom field definition. The timeout state is temporary. No corrective action is needed. If an object in a batch can\'t be locked, the entire batch fails with this error. Errors with this status code contain the IDs of the records that couldn\'t be locked, when available, in the error message.',
          'UNAVAILABLE_RECORDTYPE_EXCEPTION': 'The appropriate default record type could not be found.',
          'UNDELETE_FAILED': 'An object could not be undeleted because it does not exist or has not been deleted.',
          'UNKNOWN_EXCEPTION': 'The system encountered an internal error. Report this problem to Salesforce. Note: Do not report this exception code to Salesforce if it results from a sendEmail() call. The sendEmail() call returns this exception code when it is used to send an email to one or more recipients who have the Email Opt Out option selected.',
          'UNSPECIFIED_EMAIL_ADDRESS': 'The specified user does not have an email address.',
          'UNSUPPORTED_APEX_TRIGGER_OPERATION': 'You can\'t save recurring events with an Apex trigger.',
          'UNVERIFIED_SENDER_ADDRESS': 'A sendEmail() call attempted to use an unverified email address defined in the OrgWideEmailAddress object.',
          'WEBLINK_SIZE_LIMIT_EXCEEDED': 'The size of a WebLink URL or JavaScript code exceeds the limit.',
          'WEBLINK_URL_INVALID': 'The WebLink URL has failed the URL string validation check.',
          'WRONG_CONTROLLER_TYPE': 'The controller type for your Visualforce email template does not match the object type being used.'
        };

        var statusKeys = Object.keys(statusCodes);
        for (var statusCode = 0, totalCodes = statusKeys.length; statusCode < totalCodes; statusCode++) {
          try {
            if (message.indexOf(statusKeys[statusCode]) > -1) {
              if (!statusCodes[statusKeys[statusCode]]) {
                message = message.split(statusKeys[statusCode] + ', ')[1];
                var messageParts = message.split(': ');
                if (messageParts.length > 1) {
                  messageParts.pop();
                }
                message = messageParts.join(': ');
              } else {
                message = statusCodes[statusKeys[statusCode]];
              }
              break;
            }
          } catch (statusCodeException) {
            break;
          }
        }
        errorMessages.push(message);
      });

      if (errorMessages.length > 0) {
        h.warning(errorMessages.join(', '), { mode: 'sticky' });
      }
    } else {
      h.warning('Something went wrong.', { mode: 'sticky', title: 'Contact System Administrator!' });
    }
  }
})