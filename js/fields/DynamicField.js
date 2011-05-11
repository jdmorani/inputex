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
  };

  lang.extend(inputEx.DynamicField, inputEx.SelectField, {

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
    updateFieldList: function(dynamic_table_id) {
      try {
        for (var i = 0; i < inputExTableField.length; i++) {
          if (inputExTableField[i].dynamic_table.id == dynamic_table_id) {
            for (var j = 0; j < inputExTableField[i].dynamic_table.dynamic_fields.length; j++) {
              this.addChoice({
                label: inputExTableField[i].dynamic_table.dynamic_fields[j].name,
                value: inputExTableField[i].dynamic_table.dynamic_fields[j].id
              });
            }
            break;
          }
        }
      } catch (err) {
        console.log("inputExTableField is undefined. - " + err)
      }
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