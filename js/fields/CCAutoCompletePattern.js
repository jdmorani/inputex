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
    inputEx.CCAutoCompletePattern = function(options) {
        options.datasource = new YAHOO.util.XHRDataSource("<%=CaseCenter::Application.routes.url_helpers.admin_patterns_path(:format => :json)%>?");
        inputEx.CCAutoCompletePattern.superclass.constructor.call(this, options);
    };

    lang.extend(inputEx.CCAutoCompletePattern, inputEx.CCAutoComplete, {

    });

    // Register this class as "select" type
    inputEx.registerType("autocomplete-pattern", inputEx.CCAutoCompletePattern);

}());