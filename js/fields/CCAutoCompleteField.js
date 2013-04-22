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
  inputEx.CCAutoCompleteField = function(options) {
    inputEx.CCAutoCompleteScreenFlow.superclass.constructor.call(this, options);      
  };

  lang.extend(inputEx.CCAutoCompleteField, inputEx.CCAutoComplete, {
    /**
     * Set the default values of the options
     * @param {Object} options Options object as passed to the constructor
     */     
    setOptions: function(options) {
      inputEx.CCAutoCompleteField.superclass.setOptions.call(this, options);

      this.options.parentDynamicTable = this.retrieveParentDynamicTable(this);

      this.options.include_all_tables = options.include_all_tables || false;

      if (typeof this.options.parentDynamicTable != 'undefined' && this.options.parentDynamicTable)
        this.options.table_key = this.options.parentDynamicTable.inputs[0].options.selectedValue;
      else
        this.options.table_key = '';

      this.options.datasource = new YAHOO.util.XHRDataSource("<%=CaseCenter::Application.routes.url_helpers.admin_fields_path(:format => :json)%>?include_all_tables=" + this.options.include_all_tables +"&table_key=" + this.options.table_key + "&");
    },

    /**
     * Recursively go through the chain of parents for the
     * specified field and retrieve its top parent that is
     * of type table. For any other type null will be returned
     * or if we reached the end of the chain.
     */
    retrieveParentDynamicTable: function(table) {
      if (table.type == 'table') return table;
      while (table.parentField && typeof table.parentField != 'undefined') {
        parentTable = this.retrieveParentDynamicTable(table.parentField, table);
        if(parentTable && this.parentField != parentTable) return parentTable;
        return null;
      }
    },

    /**
     * Register the tableDidChange event
     */
    setTableDidChangeCallback: function(event) {      
      this.options.tableDidChangeEvt = event;
      event.subscribe(this.onTableDidChange, this, true);
    },

    onChange: function(e) {
      inputEx.CCAutoCompleteField.superclass.onChange.call(this, e);
    },


    destroy: function() {

      if(this.options.tableDidChangeEvt){
        this.options.tableDidChangeEvt.unsubscribe(this.onTableDidChange, this); 
      }

      // Destroy group itself      
      inputEx.CCAutoCompleteField.superclass.destroy.call(this);
    },
    
    /**
     * Returns the current state (given its value)
     * @return {String} One of the following states: 'empty', 'required', 'valid' or 'invalid'
     */
    getState: function() {
      // if the field is empty :
      if (this.isEmpty()) {
        return this.options.required ? inputEx.stateRequired : inputEx.stateEmpty;
      }

      if(this.parentField.type != 'multifield'){
        // if the field is empty :
        if (this.hiddenEl.value.indexOf('@_@@_@') >= 0) {
          return 'linked';
        }

        return 'unlinked';
      }
    }

  });


  // Register this class as "autocomplete-field" type
  inputEx.registerType("autocomplete-field", inputEx.CCAutoCompleteField, [{
      type: "boolean",
      label: I18n.t('form.field.autocomplete.include_all_tables'),
      name: "include_all_tables"
    }
  ], false);

}());