(function() {
  var util = YAHOO.util
  var Event = YAHOO.util.Event,
      lang = YAHOO.lang;

  /**
   * Create a table select field
   * @class inputEx.SelectField
   * @extends inputEx.Field
   * @constructor
   * @param {Object} options Added options:
   * <ul>
   *    <li>choices: contains the list of choices configs ([{value:'usa'}, {value:'fr', label:'France'}])</li>
   * </ul>
   */
  inputEx.DynamicTable = function(options) {
    /**
     * Event fired after the table got populated or after the user changed the selected field
     * @event tableDidChange
     * @param {Any} value The new value of the field
     * @desc YAHOO custom event fired when the field is "updated"<br /> subscribe with: this.updatedEvt.subscribe(function(e, params) { var value = params[0]; console.log("updated",value, this.updatedEvt); }, this, true);
     */
    inputEx.DynamicTable.superclass.constructor.call(this, options);

    this.options.tableDidChangeEvt = new util.CustomEvent('tableDidChange', this);

    this.options.selectedValue = null;

    //this.parentField.parentField because we want to skip the first group/table/dynamic_table in the hierarchy
    this.options.parentDynamicTable = this.retrieveParentDynamicTable(this.parentField.parentField);

    this.subscribeToParentFieldTableDidChangeEvent();

    this.updateTableList();

  };

  lang.extend(inputEx.DynamicTable, inputEx.SelectField, {

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

    subscribeToParentFieldTableDidChangeEvent: function(){
      if(this.options.parentDynamicTable){
        for(var i = 0; i < this.options.parentDynamicTable.inputs.length; i++){
          if(this.options.parentDynamicTable.inputs[i].type == 'dynamictable'){
            // subscribe to the parent field tableDidChangeEvent            
            this.options.parentTableDidChangeEvt = this.options.parentDynamicTable.inputs[i].options.tableDidChangeEvt;
            this.options.parentTableDidChangeEvt.subscribe(this.onParentTableDidChange, this, true);
          }
        }
      }
    },

    onParentTableDidChange: function(event, args){
      //this.clearFieldsList();
      this.updateTableList();
    },

    /**
     * Fire the "tableDidChange" event
     * Escape the stack using a setTimeout
     */
    fireTableDidChangeEvt: function(force) {
      // Uses setTimeout to escape the stack (that originiated in an event)      
      var that = this;
      setTimeout(function() {
        if(force == true || that.options.selectedValue != that.getValue()){
          that.options.selectedValue = that.getValue();
          that.options.tableDidChangeEvt.fire(that.getValue(), that);
        }
      }, 50);
    },

    getFieldsList: function(){
      var fieldsToAdd = inputEx.TablesFields;
      var parentField = this.options.parentDynamicTable;
      if (parentField){
        fieldsToAdd = [];
        for (var i = 0; i < parentField.inputs.length; i++) {
          if (parentField.inputs[i].type == 'dynamictable') {
            for(var j = 0; j < inputEx.TablesFields.length;j++){
              if(inputEx.TablesFields[j].table.key == parentField.inputs[i].options.selectedValue){
                for(var k = 0; k < inputEx.TablesFields[j].table.children.length;k++){                  
                  fieldsToAdd.push({'table' : inputEx.TablesFields[j].table.children[k]});
                }
              }
            }
            break;
          }
        }
      } else {
        fieldsToAdd = []
        for (var i = 0; i < inputEx.TablesFields.length; i++) {
          if(inputEx.TablesFields[i].table.parents.length == 0){
            fieldsToAdd.push(inputEx.TablesFields[i]);
          }
        }
      }

      return fieldsToAdd;
    },

    /**
     * Retrieve the list of tables to be used to populate
     * the select field
     */
    updateTableList: function() {
      try {
        this.clearFieldsList();
        var fieldsList = this.getFieldsList(this.options.parentField);
        if(fieldsList.length > 0){
          this.addChoice({
            label: "",
            value: ""
          });
        }
        for (var i = 0; i < fieldsList.length; i++) {
          this.addChoice({
            label: fieldsList[i].table.name,
            value: fieldsList[i].table.key
          });
        }
        this.fireTableDidChangeEvt();
      } catch (err) {
        console.log("inputEx.TablesFields is undefined. - " + err)
      }
    },

    /**
     * Set the default values of the options
     * @param {Object} options Options object as passed to the constructor
     */
    setOptions: function(options) {

      var i, length;

      inputEx.DynamicTable.superclass.setOptions.call(this, options);

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

    /**
     * Build a select tag with options
     */
    renderComponent: function() {

      var i, length;

      // create DOM <select> node
      this.el = inputEx.cn('select', {

        id: this.divEl.id ? this.divEl.id + '-field' : YAHOO.util.Dom.generateId(),
        name: this.options.name || ''

      });

      // list of choices (e.g. [{ label: "France", value:"fr", node:<DOM-node>, visible:true }, {...}, ...])
      this.choicesList = [];

      // add choices
      for (i = 0, length = this.options.choices.length; i < length; i += 1) {
        this.addChoice(this.options.choices[i]);
      }

      // append <select> to DOM tree
      this.fieldContainer.appendChild(this.el);
    },

    /**
     * Register the "change" event
     */
    initEvents: function() {
      Event.addListener(this.el, "change", this.onChange, this, true);
      Event.addFocusListener(this.el, this.onFocus, this, true);
      Event.addBlurListener(this.el, this.onBlur, this, true);
    },

    onChange: function(e) {
      this.fireTableDidChangeEvt();
    },

    /**
     * Set the value
     * @param {String} value The value to set
     * @param {boolean} [sendUpdatedEvt] (optional) Wether this setValue should fire the updatedEvt or not (default is true, pass false to NOT send the event)
     */
    setValue: function(value, sendUpdatedEvt) {
      var i, length, choice, firstIndexAvailable, choiceFound = false;      

      for (i = 0, length = this.choicesList.length; i < length; i += 1) {

        if (this.choicesList[i].visible) {
          choice = this.choicesList[i];

          if (value === choice.value) {

            choice.node.selected = "selected";
            choiceFound = true;
            this.options.selectedValue = value;
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
      inputEx.DynamicTable.superclass.setValue.call(this, value, sendUpdatedEvt);
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
     * Disable the field
     */
    disable: function() {
      this.el.disabled = true;
    },

    /**
     * Enable the field
     */
    enable: function() {
      this.el.disabled = false;
    },

    createChoiceNode: function(choice) {

      return inputEx.cn('option', {
        value: choice.value
      }, null, choice.label);

    },

    removeChoiceNode: function(node) {

      // remove from selector
      // 
      //   -> style.display = 'none' would work only on FF (when node is an <option>)
      //   -> other browsers (IE, Chrome...) require to remove <option> node from DOM
      //
      this.el.removeChild(node);

    },

    disableChoiceNode: function(node) {

      node.disabled = "disabled";

    },

    enableChoiceNode: function(node) {

      node.removeAttribute("disabled");

    },

    destroy: function(){      
      // Unsubscribe all listeners on the tableDidChangeEvt
      this.options.tableDidChangeEvt.unsubscribeAll();

      if(this.options.parentTableDidChangeEvt){
        this.options.parentTableDidChangeEvt.unsubscribe(this.onParentTableDidChange, this);
      }
            
      // Destroy group itself      
      inputEx.DynamicTable.superclass.destroy.call(this);
    },

    /**
     * Attach an <option> node to the <select> at the specified position
     * @param {HTMLElement} node The <option> node to attach to the <select>
     * @param {Int} position The position of the choice in choicesList (may not be the "real" position in DOM)
     */
    appendChoiceNode: function(node, position) {

      var domPosition, i;

      // Compute real DOM position (since previous choices in choicesList may be hidden)
      domPosition = 0;

      for (i = 0; i < position; i += 1) {

        if (this.choicesList[i].visible) {

          domPosition += 1;

        }

      }

      // Insert in DOM
      if (domPosition < this.el.childNodes.length) {

        YAHOO.util.Dom.insertBefore(node, this.el.childNodes[domPosition]);

      } else {

        this.el.appendChild(node);

      }
    }

  });

  // Augment prototype with choice mixin (functions : addChoice, removeChoice, etc.)
  lang.augmentObject(inputEx.SelectField.prototype, inputEx.mixin.choice);


  // Register this class as "select" type
  inputEx.registerType("dynamictable", inputEx.DynamicTable, [{
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