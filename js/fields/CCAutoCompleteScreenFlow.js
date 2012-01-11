(function() {
  var util = YAHOO.util,
      Event = YAHOO.util.Event,
      lang = YAHOO.lang,
      Dom = YAHOO.util.Dom;

  /**
   * Create an autocomplete field to select a screen flow
   * @class inputEx.AutoComplete
   * @extends inputEx.Field
   * @constructor
   */
  inputEx.CCAutoCompleteScreenFlow = function(options) {
    options.datasource = new YAHOO.util.XHRDataSource("<%=CaseCenter::Application.routes.url_helpers.admin_screen_flows_path(:format => :json)%>?");
    inputEx.CCAutoCompleteScreenFlow.superclass.constructor.call(this, options);      
  };

  lang.extend(inputEx.CCAutoCompleteScreenFlow, inputEx.CCAutoComplete, {

  });

  // Register this class as "select" type
  inputEx.registerType("autocomplete-screen-flow", inputEx.CCAutoCompleteScreenFlow);

}());