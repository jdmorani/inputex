(function() {

  var lang = YAHOO.lang,
      Dom = YAHOO.util.Dom,
      Event = YAHOO.util.Event;

  /**
   * Handle a table of fields
   * @class inputEx.Table
   * @extends inputEx.Group
   * @constructor
   * @param {Object} options The following options are added for Tables and subclasses:
   * <ul>
   *   <li>fields: Array of input fields declared like { label: 'Enter the value:' , type: 'text' or fieldClass: inputEx.Field, optional: true/false, ... }</li>
   *   <li>legend: The legend for the fieldset (default is an empty string)</li>
   *   <li>collapsible: Boolean to make the table collapsible (default is false)</li>
   *   <li>collapsed: If collapsible only, will be collapsed at creation (default is false)</li>
   *   <li>flatten:</li>
   * </ul>
   */
  inputEx.Table = function(options) {
    inputEx.Table.superclass.constructor.call(this, options);

    // Run default field interactions (if setValue has not been called before)
    if (!this.options.value) {
      this.runFieldsInteractions();
    }
  };

  lang.extend(inputEx.Table, inputEx.Group, {

    /**
     * Adds some options: legend, collapsible, fields...
     * @param {Object} options Options object as passed to the constructor
     */
    setOptions: function(options) {
      inputEx.Table.superclass.setOptions.call(this, options);

      this.options.className = options.className || 'inputEx-Group';

      this.options.fields = options.fields;

      this.options.flatten = options.flatten;

      this.options.legend = options.legend || '';

      this.options.collapsible = lang.isUndefined(options.collapsible) ? false : options.collapsible;
      this.options.collapsed = lang.isUndefined(options.collapsed) ? false : options.collapsed;

      this.options.disabled = lang.isUndefined(options.disabled) ? false : options.disabled;

      // Array containing the list of the field instances
      this.inputs = [];

      // Associative array containing the field instances by names
      this.inputsNames = {};

      // associate the table with the initial fields list
      if (typeof this.options.fields !== 'undefined' && this.options.fields.length == 0 && this.numberOfFieldsInTable() > 0) {
        this.updateFieldList();
      }
      
      this.subscribeToTableDidChangeEvent();
    },

    subscribeToTableDidChangeEvent: function() {
      if (this.parentField && this.parentField.group && this.parentField.group.type == 'table') {
        for (var i = 0; i < this.parentField.group.inputs.length; i++) {
          if (this.parentField.group.inputs[i].type == 'dynamictable') {
            // subscribe to the parent field tableDidChangeEvent
            this.options.parentTableDidChange = this.parentField.group.inputs[i].options.tableDidChangeEvt;
            this.options.parentTableDidChange.subscribe(this.onTableDidChange, this, true);
          }
        }
      }
    },

    onTableDidChange: function(e, args) {
      this.options.name = args[0];
      this.updateFieldList();
    },

    numberOfFieldsInTable: function(){
      if(typeof inputEx.TablesFields === 'undefined'){
        return 0;
      }
      for (var i = 0; i < inputEx.TablesFields.length; i++) {
        if (inputEx.TablesFields[i].table.key == this.options.name){
          return(inputEx.TablesFields[i].table.fields.length);
        }
      }
    },

    /**
     * Retrieve the list of tables to be used to populate
     * the select field
     */
    updateFieldList: function() {
      try {
        var fields = [];
        this.setFieldsList(this.parentField.group, []);
        for (var i = 0; i < inputEx.TablesFields.length; i++) {
          if (inputEx.TablesFields[i].table.key == this.options.name) {
            for (var j = 0; j < inputEx.TablesFields[i].table.fields.length; j++) {

              fields.push({
                label: inputEx.TablesFields[i].table.fields[j].name,
                name: inputEx.TablesFields[i].table.fields[j].key,
                type: this.getFieldType(inputEx.TablesFields[i].table.fields[j].field_type),
              });
            }
            break;
          }
        }
        if (fields.length > 0) this.setFieldsList(this.parentField.group, fields);
      } catch (err) {
        console.log("inputEx.TablesFields is undefined. - " + err)
      }
    },

    addField: function(fieldOptions) {      
      var field = this.renderField(fieldOptions);
      this.fieldset.appendChild(field.getEl());
    },

    destroy: function() {
      if (this.options.parentTableDidChange) this.options.parentTableDidChange.unsubscribe(this.onTableDidChange, this);

      // Destroy group itself      
      inputEx.Table.superclass.destroy.call(this);

    },

    setFieldsList: function(group, fields) {
      for (var i = 0; i < group.inputs.length; i++) {
        if (group.inputs[i].type == 'list') {
          group.inputs[i].setValue(fields);
        }
      }
    },


  });


  // Register this class as "table" type
  inputEx.registerType("table", inputEx.Table, [{
    type: "dynamictable",
    label: "Name",
    name: "name",
    choices: [],
    required: true
  }, {
    type: 'string',
    label: 'Legend',
    name: 'legend'
  }, {
    type: 'boolean',
    label: 'Collapsible',
    name: 'collapsible',
    value: false
  }, {
    type: 'boolean',
    label: 'Collapsed',
    name: 'collapsed',
    value: false
  }, {
    type: 'list',
    label: 'Fields',
    name: 'fields',
    elementType: {
      type: 'type'
    }
  }], true);


})();