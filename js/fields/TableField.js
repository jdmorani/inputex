(function() {
  var util = YAHOO.util,
      lang = YAHOO.lang,
      Event = util.Event,
      Dom = util.Dom;

  /**
   * Create a group of fields within a FORM tag and adds buttons
   * @class inputEx.Form
   * @extends inputEx.Group
   * @constructor
   * @param {Object} options The following options are added for Forms:
   * <ul>
   *   <li>buttons: list of button definition objects {value: 'Click Me', type: 'submit'}</li>
   *   <li>ajax: send the form through an ajax request (submit button should be present): {method: 'POST', uri: 'myScript.php', callback: same as YAHOO.util.Connect.asyncRequest callback}</li>
   *   <li>showMask: adds a mask over the form while the request is running (default is false)</li>
   * </ul>
   */
  inputEx.TableField = function(options) {
    inputEx.TableField.superclass.constructor.call(this, options);
  };

  lang.extend(inputEx.TableField, inputEx.CombineField, {

    /**
     * Adds buttons and set ajax default parameters
     * @param {Object} options Options object as passed to the constructor
     */
    setOptions: function(options) {
      inputEx.TableField.superclass.setOptions.call(this, options);

      this.options.fields = [{
        type: 'dynamictable',
        name: 'table'
      }, {
        type: 'dynamicfield',
        name: 'field'
      }]
    },

    onFieldDidChange: function(event, arg) {
      //this.fireUpdatedEvt();
    },

    onTableDidChange: function(event, arg) {
      //this.fireUpdatedEvt();
    },

    render: function() {
      // Create the div wrapper for this group
      this.divEl = inputEx.cn('div', {
        className: this.options.className
      });
      if (this.options.id) {
        this.divEl.id = this.options.id;
      }

      Dom.addClass(this.divEl, "inputEx-required");

      // Label element
      if (YAHOO.lang.isString(this.options.label)) {
        this.labelDiv = inputEx.cn('div', {
          id: this.divEl.id + '-label',
          className: 'inputEx-label',
          'for': this.divEl.id + '-field'
        });
        this.labelEl = inputEx.cn('label', null, null, this.options.label === "" ? "&nbsp;" : this.options.label);
        this.labelDiv.appendChild(this.labelEl);
        this.divEl.appendChild(this.labelDiv);
      }

      this.renderFields(this.divEl);

      if (this.options.disabled) {
        this.disable();
      }

      // Insert a float breaker
      this.divEl.appendChild(inputEx.cn('div', {
        className: "inputEx-clear-div"
      }, null, " "));
    },


    /**
     * Set the value
     * @param {Array} values [value1, value2, ...]
     * @param {boolean} [sendUpdatedEvt] (optional) Wether this setValue should fire the updatedEvt or not (default is true, pass false to NOT send the event)
     */
    setValue: function(values, sendUpdatedEvt) {
      inputEx.TableField.superclass.setValue.call(this, values, sendUpdatedEvt);
      this.inputs[0].fireTableDidChangeEvt(true);
    },

    /**
     * Instanciate one field given its parameters, type or fieldClass
     * @param {Object} fieldOptions The field properties as required by the inputEx() method
     */
    renderField: function(fieldOptions) {

      // Instanciate the field
      var fieldInstance = inputEx(fieldOptions, this);

      if (fieldOptions.type == 'dynamictable') {
        this.options.tableDidChangeEvt = fieldInstance.options.tableDidChangeEvt;
        this.options.tableDidChangeEvt.subscribe(this.onTableDidChange, this, true);
      }

      if (fieldOptions.type == 'dynamicfield') {
        fieldInstance.setTableDidChangeCallback(this.options.tableDidChangeEvt);
        fieldInstance.options.fieldDidChangeEvt.subscribe(this.onFieldDidChange, this, true);
      }

      this.inputs.push(fieldInstance);

      // Create an index to access fields by their name
      if (fieldInstance.options.name) {
        this.inputsNames[fieldInstance.options.name] = fieldInstance;
      }

      // Create the this.hasInteractions to run interactions at startup
      if (!this.hasInteractions && fieldOptions.interactions) {
        this.hasInteractions = true;
      }

      // Subscribe to the field "updated" event to send the group "updated" event
      fieldInstance.updatedEvt.subscribe(this.onChange, this, true);

      // Subscribe to the field "updated" event to send the group "updated" event
      // this.options.tableDidChangeEvt.subscribe(this.onChange, this, true);

      return fieldInstance;
    },

    /**
     * Purge all event listeners and remove the component from the dom
     */
    destroy: function() {
      // Destroy the combine field itself      
      inputEx.TableField.superclass.destroy.call(this);
    },
  });

  // Register this class as "form" type
  inputEx.registerType("tablefield", inputEx.TableField, []);

})();