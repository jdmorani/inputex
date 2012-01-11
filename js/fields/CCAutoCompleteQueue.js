(function() {
  var util = YAHOO.util,
      Event = YAHOO.util.Event,
      lang = YAHOO.lang,
      Dom = YAHOO.util.Dom;

  /**
   * Create an autocomplete field to select a queue
   * @class inputEx.AutoComplete
   * @extends inputEx.Field
   * @constructor
   */
  inputEx.CCAutoCompleteQueue = function(options) {
    options.datasource = new YAHOO.util.XHRDataSource("<%=CaseCenter::Application.routes.url_helpers.admin_filters_path(:format => :json)%>?");
    inputEx.CCAutoCompleteQueue.superclass.constructor.call(this, options);      
  };

  lang.extend(inputEx.CCAutoCompleteQueue, inputEx.CCAutoComplete, {

  });

  // Register this class as "select" type
  inputEx.registerType("autocomplete-queue", inputEx.CCAutoCompleteQueue);

}());