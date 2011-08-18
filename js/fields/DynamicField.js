(function() {
  var util = YAHOO.util,
      Event = YAHOO.util.Event,
      lang = YAHOO.lang;

  /**
   * Create a table field select field
   * @class inputEx.SelectField
   * @extends inputEx.Field
   * @constructor
   * @param {Object} options Added options:
   * <ul>
   *    <li>choices: contains the list of choices configs ([{value:'usa'}, {value:'fr', label:'France'}])</li>
   * </ul>
   */
  inputEx.DynamicField = function(options) {
    inputEx.DynamicField.superclass.constructor.call(this, options);

    this.options.fieldDidChangeEvt = new util.CustomEvent('fieldDidChange', this);

    this.options.parentDynamicTable = this.retrieveParentDynamicTable(this);

    var table_key = null;
    if (typeof this.options.parentDynamicTable != 'undefined' && this.options.parentDynamicTable){
      table_key = this.options.parentDynamicTable.inputs[0].options.selectedValue;
    }
    
    this.updateFieldList(table_key);
  };

  lang.extend(inputEx.DynamicField, inputEx.SelectField, {

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
     * Fire the "tableDidChange" event
     * Escape the stack using a setTimeout
     */
    fireFieldDidChangeEvt: function() {
      // Uses setTimeout to escape the stack (that originiated in an event)
      var that = this;
      setTimeout(function() {
        that.options.fieldDidChangeEvt.fire(that.getValue(), that);
      }, 50);
    },

    /**
     * Register the tableDidChange event
     */
    setTableDidChangeCallback: function(event) {      
      this.options.tableDidChangeEvt = event;
      event.subscribe(this.onTableDidChange, this, true);
    },

    onTableDidChange: function(event, args) {
      this.clearFieldsList();
      this.updateFieldList(args[0]);
      this.setValue(this.options.selectedValue, false);
    },

    onChange: function(e) {
      this.fireFieldDidChangeEvt();
      // inputEx.DynamicField.superclass.onChange.call(this, e);
    },


    /**
     * Retrieve the list of tables to be used to populate
     * the select field
     */
    updateFieldList: function(table_key) {      
      try {
        if(table_key && table_key != ''){
          for (var i = 0; i < inputEx.TablesFields.length; i++) {
            if (inputEx.TablesFields[i].table.key == table_key) {
              for (var j = 0; j < inputEx.TablesFields[i].table.fields.length; j++) {
                this.addChoice({
                  label: inputEx.TablesFields[i].table.fields[j].name,
                  value: inputEx.TablesFields[i].table.fields[j].key
                });
              }
              break;
            }
          }
        }else{
          for(var i=0; i<inputEx.OrphanFields.length;i++){
            this.addChoice({
              label: inputEx.OrphanFields[i].field.name,
              value: inputEx.OrphanFields[i].field.key
            });
          }
        }
      } catch (err) {
        console.log("inputEx.TablesFields is undefined. - " + err)
      }

      this.fireFieldDidChangeEvt();
    },

    /**
     * Return the value
     * @return {Any} the selected value
     */
    getValue: function() {

      var choiceIndex;

      if (this.el.selectedIndex >= 0) {

        choiceIndex = inputEx.indexOf(this.el.childNodes[this.el.selectedIndex], this.choicesList, function(node, choice) {
          return node === choice.node;
        });
        return this.choicesList[choiceIndex].value;

      } else {

        return "";

      }
    },



    /**
     * Set the value
     * @param {String} value The value to set
     * @param {boolean} [sendUpdatedEvt] (optional) Wether this setValue should fire the updatedEvt or not (default is true, pass false to NOT send the event)
     */
    setValue: function(value, sendUpdatedEvt) {

      var i, length, choice, firstIndexAvailable, choiceFound = false;

      this.options.selectedValue = value;

      for (i = 0, length = this.choicesList.length; i < length; i += 1) {

        if (this.choicesList[i].visible) {

          choice = this.choicesList[i];

          if (value === choice.value) {

            choice.node.selected = "selected";
            choiceFound = true;
            break; // choice node already found
          } else if (lang.isUndefined(firstIndexAvailable)) {

            firstIndexAvailable = i;
          }

        }

      }

      // select value from first choice available when
      // value not matching any visible choice
      //
      // if no choice available (-> firstIndexAvailable is undefined), skip value setting
      if (!choiceFound && !lang.isUndefined(firstIndexAvailable)) {

        choice = this.choicesList[firstIndexAvailable];
        choice.node.selected = "selected";
        value = choice.value;

      }

      // Call Field.setValue to set class and fire updated event
      inputEx.SelectField.superclass.setValue.call(this, value, sendUpdatedEvt);
    },


    /**
     * Set the default values of the options
     * @param {Object} options Options object as passed to the constructor
     */
    setOptions: function(options) {

      var i, length;

      inputEx.SelectField.superclass.setOptions.call(this, options);

      this.options.choices = lang.isArray(options.choices) ? options.choices : [];

      // Retro-compatibility with old pattern (changed since 2010-06-30)
      if (lang.isArray(options.selectValues)) {

        for (i = 0, length = options.selectValues.length; i < length; i += 1) {

          this.options.choices.push({
            value: options.selectValues[i],
            label: "" + ((options.selectOptions && !lang.isUndefined(options.selectOptions[i])) ? options.selectOptions[i] : options.selectValues[i])
          });

        }
      }

    },

    destroy: function() {

      if(this.options.tableDidChangeEvt){
        this.options.tableDidChangeEvt.unsubscribe(this.onTableDidChange, this); 
      }

      // Unsubscribe all listeners on the fieldDidChangeEvt
      this.options.fieldDidChangeEvt.unsubscribeAll();

      // Destroy group itself      
      inputEx.DynamicField.superclass.destroy.call(this);
    },


  });


  // Augment prototype with choice mixin (functions : addChoice, removeChoice, etc.)
  lang.augmentObject(inputEx.SelectField.prototype, inputEx.mixin.choice);


  // Register this class as "select" type
  inputEx.registerType("dynamicfield", inputEx.DynamicField, [{
    type: 'list',
    name: 'choices',
    label: 'Choices',
    elementType: {
      type: 'group',
      fields: [{
        label: 'Value',
        name: 'value',
        value: ''
      }, // not required to allow '' value (which is default)
      {
        label: 'Label',
        name: 'label'
      } // optional : if left empty, label is same as value
      ]
    },
    value: [],
    required: true
  }]);

}());