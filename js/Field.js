(function() {
  var Dom = YAHOO.util.Dom,
      lang = YAHOO.lang,
      util = YAHOO.util;

  /** 
   * An abstract class (never instantiated) that contains the shared features for all fields.
   * @class inputEx.Field
   * @constructor
   * @param {Object} options Configuration object
   * <ul>
   *    <li>name: the name of the field</li>
   *    <li>required: boolean, the field cannot be null if true</li>
   *   <li>className: CSS class name for the div wrapper (default 'inputEx-Field')</li>
   *   <li>value: initial value</li>
   *   <li>parentEl: HTMLElement or String id, append the field to this DOM element</li>
   * </ul>
   */
  inputEx.Field = function(options) {

    // set the type
    this.type = options.type;


    // Set the default values of the options
    this.setOptions(options || {});

    // Call the render of the dom
    this.render();

    /**
     * Event fired after the user changed the value of the field.
     * @event updatedEvt
     * @param {Any} value The new value of the field
     * @desc YAHOO custom event fired when the field is "updated"<br /> subscribe with: this.updatedEvt.subscribe(function(e, params) { var value = params[0]; console.log("updated",value, this.updatedEvt); }, this, true);
     */
    this.updatedEvt = new util.CustomEvent('updated', this);


    // initialize behaviour events
    this.initEvents();

    // Set the initial value
    //   -> no initial value = no style (setClassFromState called by setValue)    
    if (!lang.isUndefined(this.options.value)) {
      this.setValue(this.options.value, false);
    }

    // append it immediatly to the parent DOM element
    if (options.parentEl) {
      if (lang.isString(options.parentEl)) {
        Dom.get(options.parentEl).appendChild(this.getEl());
      } else {
        options.parentEl.appendChild(this.getEl());
      }
    }
  };


  inputEx.Field.prototype = {

    /**
     * Set the default values of the options
     * @param {Object} options Options object as passed to the constructor
     */
    setOptions: function(options) {
      /**
       * Configuration object to set the options for this class and the parent classes. See constructor details for options added by this class.
       */
      this.options = {};

      // Basic options
      this.setParentField(options.parentField);
      this.options.name = this.parseName(options.name);
      this.options.value = options.value;      
      this.options.id = this.generateId(options);
      this.options.label = options.label;
      this.options.description = options.description;
      this.options.placeholder = options.placeholder;
      this.options.hide = lang.isUndefined(options.hide) ? false : options.hide;
      this.options.readonly = lang.isUndefined(options.readonly) ? false : options.readonly;

      // Define default messages
      this.options.messages = {};
      this.options.messages.required = (options.messages && options.messages.required) ? options.messages.required : inputEx.messages.required;
      this.options.messages.invalid = (options.messages && options.messages.invalid) ? options.messages.invalid : inputEx.messages.invalid;
      //this.options.messages.valid = (options.messages && options.messages.valid) ? options.messages.valid : inputEx.messages.valid;
      // Other options
      this.options.className = options.className ? options.className : 'inputEx-Field ' + this.options.name;
      this.options.required = lang.isUndefined(options.required) ? false : options.required;
      this.options.showMsg = lang.isUndefined(options.showMsg) ? false : options.showMsg;
      this.options.align = options.align;
      this.options.toplabel = lang.isUndefined(options.toplabel) ? false : options.toplabel;
      this.options.newline = lang.isUndefined(options.newline) ? false : options.newline;

      this.objectType = options.objectType;

    },

    /**
    * The name may include both the key and the name of the field. If this is the case
    * the name and key will be delimited with @_@@_@
    * It's a bit hacky but there is really no way around it unfortunately.
    */
    parseName: function(name){
      if(!lang.isUndefined(name) && name && name.indexOf('@_@@_@') >= 0)
        return name.split('@_@@_@')[1];
      return name;
    },

    generateId: function(options){
      
      //get the parentfield name
      var parentFieldId = null;

      if(typeof this.parentField !== 'undefined' && typeof this.parentField.options.name !== 'undefined')
        parentFieldId = this.parentField.options.id;

      //get the actual field name, making sure there is no dot in the name
      var fieldName = (!this.options.name || this.options.name == '' ? Dom.generateId() : this.options.name).replace(/\./g, "_");

      var id = parentFieldId ? parentFieldId + '-' + fieldName : fieldName;

      return (options.id || id)
    },

    /**
     * Recursively go through the chain of parents for the
     * specified field and retrieve its top parent that is
     * of type table. For any other type null will be returned
     * or if we reached the end of the chain.
     */
    isInPropertyPanel: function(field) {
      if(typeof field == 'undefined'){
        field = this;
      }
      if (field.type == 'type' && (typeof field.parentField.parentField.type != 'undefined')) return true;
      while (field.parentField && typeof field.parentField != 'undefined') {
        parentField = this.isInPropertyPanel(field.parentField, field);
        if(parentField && this.parentField != parentField) return true;
        return false;
      }
    },

    getContainerField: function(field){
      if(typeof field == 'undefined'){
        field = this;
      }
      if (field.type == 'type' && (typeof field.parentField.parentField.type != 'undefined')) return null;
      while (field.parentField && typeof field.parentField != 'undefined') {
        parentField = this.getContainerField(field.parentField, field);
        if(parentField && this.parentField != parentField) return null;
        return parentField;
      }
    },

    /**
     * Set the name of the field (or hidden field)
     */
    setFieldName: function(name) {
    },



    /**
     * Set the id of the field (or hidden field)
     */
    setFieldId: function(id) {
      this.options.id = id;
      this.divEl.id = this.options.id;
    },


    /**
     * Default render of the dom element. Create a divEl that wraps the field.
     */
    render: function() {
      // Create a DIV element to wrap the editing el and the image
      this.divEl = inputEx.cn('div', {
        className: 'inputEx-fieldWrapper ' + this.options.name + '-inputEx-fieldWrapper'
      });
      if (this.options.id) {
        this.divEl.id = this.options.id;
      }

      var containerField = this.getContainerField();

      var isTypeField = this.isInPropertyPanel();
  
      if(this.options.placeholder){
        Dom.setStyle(this.divEl, 'visibility', 'hidden');
      };

      if(this.options.align && !isTypeField){
        Dom.setStyle(this.divEl, 'float', 'left');
      }else if(this.options.align == false && !isTypeField){
        Dom.setStyle(this.divEl, 'clear', 'left');
      }

      if(this.options.newline && !isTypeField){
        Dom.setStyle(this.divEl, 'clear', 'left');
      }

      if (this.options.required) {
        Dom.addClass(this.divEl, "inputEx-required");
      }

      // Label element
      if (YAHOO.lang.isString(this.options.label)) {
        this.labelDiv = inputEx.cn('div', {
          id: this.divEl.id + '-label-wrapper',
          className: 'inputEx-label ' + this.options.name + '-inputEx-label',
          'for': this.divEl.id + '-field'
        });
        this.labelEl = inputEx.cn('label', {id: this.options.id + '-label' }, null, this.options.label === "" ? "&nbsp;" : this.options.label);
        this.labelDiv.appendChild(this.labelEl);
        this.divEl.appendChild(this.labelDiv);
      }


      if(this.options.toplabel && !isTypeField){
        Dom.setStyle(this.labelDiv, 'text-align', 'left');
        Dom.setStyle(this.labelDiv, 'float', 'left');
        Dom.setStyle(this.labelDiv, 'clear', 'left');
      }

      this.fieldContainer = inputEx.cn('div', {
        className: this.options.className
      }); // for wrapping the field and description
      // Render the component directly
      this.renderComponent();

      if(this.options.toplabel && !isTypeField){
        Dom.setStyle(this.fieldContainer, 'text-align', 'left');
        Dom.setStyle(this.fieldContainer, 'float', 'left');
        Dom.setStyle(this.fieldContainer, 'clear', 'left');
        Dom.setStyle(this.fieldContainer, 'margin-right', '10px');
      }


      // Description
      if (this.options.description) {
        this.fieldContainer.appendChild(inputEx.cn('div', {
          id: this.divEl.id + '-desc',
          className: 'inputEx-description ' + this.options.name + '-inputEx-description'
        }, null, this.options.description));
      }

      this.divEl.appendChild(this.fieldContainer);

      // Insert a float breaker
      this.divEl.appendChild(inputEx.cn('div', null, {
        clear: 'both'
      }, " "));

      if(this.options.hide)
        Dom.setStyle(this.divEl, 'display', 'none');
      else
        Dom.setStyle(this.divEl, 'display', '');

      if(this.options.readonly)
        this.disable();
      else
        this.enable();

    },

    isHidden: function(){
      return (Dom.getStyle(this.divEl, 'display') == 'none' ||  Dom.getStyle(this.fieldContainer, 'display') == 'none');
    },

    /**
     * Fire the "updated" event (only if the field validated)
     * Escape the stack using a setTimeout
     */
    fireUpdatedEvt: function() {
      // Uses setTimeout to escape the stack (that originiated in an event)
      var that = this;
      setTimeout(function() {
        that.updatedEvt.fire(that.getValue(), that);
      }, 50);
    },

    /**
     * Render the interface component into this.divEl
     */
    renderComponent: function() {
      // override me
    },

    /**
     * The default render creates a div to put in the messages
     * @return {HTMLElement} divEl The main DIV wrapper
     */
    getEl: function() {
      return this.divEl;
    },

    /**
     * Initialize events of the Input
     */
    initEvents: function() {
      // override me
    },

    /**
     * Return the value of the input
     * @return {Any} value of the field
     */
    getValue: function() {
      // override me
    },

    /**
     * Function to set the value
     * @param {Any} value The new value
     * @param {boolean} [sendUpdatedEvt] (optional) Wether this setValue should fire the updatedEvt or not (default is true, pass false to NOT send the event)
     */
    setValue: function(value, sendUpdatedEvt) {
      // to be inherited
      // set corresponding style
      this.setClassFromState();

      if (sendUpdatedEvt !== false) {
        // fire update event
        this.fireUpdatedEvt();
      }
    },

    /**
     * Set the styles for valid/invalide state
     */
    setClassFromState: function() {
      var className;
      // remove previous class
      if (this.previousState) {
        // remove invalid className for both required and invalid fields
        className = 'inputEx-' + ((this.previousState == inputEx.stateRequired) ? inputEx.stateInvalid : this.previousState);
        Dom.removeClass(this.divEl, className);
      }

      // add new class
      var state = this.getState();
      if (!(state == inputEx.stateEmpty && Dom.hasClass(this.divEl, 'inputEx-focused'))) {
        // add invalid className for both required and invalid fields
        className = 'inputEx-' + ((state == inputEx.stateRequired) ? inputEx.stateInvalid : state);
        Dom.addClass(this.divEl, className);
      }

      if (this.options.showMsg) {
        this.displayMessage(this.getStateString(state));
      }

      this.previousState = state;
    },

    /**
     * Get the string for the given state
     */
    getStateString: function(state) {
      if (state == inputEx.stateRequired) {
        return this.options.messages.required;
      } else if (state == inputEx.stateInvalid) {
        return this.options.messages.invalid;
      } else {
        return '';
      }
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
      return this.validate() ? inputEx.stateValid : inputEx.stateInvalid;
    },

    /**
     * Validation of the field
     * @return {Boolean} field validation status (true/false)
     */
    validate: function() {
      return true;
    },

    /**
     * Function called on the focus event
     * @param {Event} e The original 'focus' event
     */
    onFocus: function(e) {
      var el = this.getEl();
      Dom.removeClass(el, 'inputEx-empty');
      Dom.addClass(el, 'inputEx-focused');
    },

    /**
     * Function called on the blur event
     * @param {Event} e The original 'blur' event
     */
    onBlur: function(e) {
      Dom.removeClass(this.getEl(), 'inputEx-focused');

      // Call setClassFromState on Blur
      this.setClassFromState();
    },


    /**
     * onChange event handler
     * @param {Event} e The original 'change' event
     */
    onChange: function(e) {
      this.fireUpdatedEvt();
    },

    /**
     * Close the field and eventually opened popups...
     */
    close: function() {},

    /**
     * Disable the field
     */
    disable: function() {},

    /**
     * Enable the field
     */
    enable: function() {},

    /**
     * Check if the field is diabled
     */
    isDisabled: function() {
      return false;
    },

    /**
     * Focus the field
     */
    focus: function() {},

    /**
     * Purge all event listeners and remove the component from the dom
     */
    destroy: function() {
      var el = this.getEl();

      // Unsubscribe all listeners on the updatedEvt
      this.updatedEvt.unsubscribeAll();


      //setTimeout(function(){util.Event.purgeElement(el, true);}, 0);

      // Purge element (remove listeners on el and childNodes recursively)
      //util.Event.purgeElement(el, false);

      // Remove from DOM
      if (Dom.inDocument(el)) {
        el.parentNode.removeChild(el);
      }

    },

    /**
     * Update the message
     * @param {String} msg Message to display
     */
    displayMessage: function(msg) {
      if (!this.fieldContainer) {
        return;
      }
      if (!this.msgEl) {
        this.msgEl = inputEx.cn('div', {
          className: 'inputEx-message ' + this.options.name + '-inputEx-message'
        });
        try {
          var divElements = this.divEl.getElementsByTagName('div');
          this.divEl.insertBefore(this.msgEl, divElements[(divElements.length - 1 >= 0) ? divElements.length - 1 : 0]); //insertBefore the clear:both div
        } catch (e) {
          alert(e);
        }
      }
      this.msgEl.innerHTML = msg;
    },

    /**
     * Show the field
     */
    show: function() {
      this.divEl.style.display = '';
    },

    /**
     * Hide the field
     */
    hide: function() {
      this.divEl.style.display = 'none';
    },

    /**
     * Clear the field by setting the field value to this.options.value
     * @param {boolean} [sendUpdatedEvt] (optional) Wether this clear should fire the updatedEvt or not (default is true, pass false to NOT send the event)
     */
    clear: function(sendUpdatedEvt) {
      this.setValue(lang.isUndefined(this.options.value) ? '' : this.options.value, sendUpdatedEvt);
    },

    /**
     * Should return true if empty
     */
    isEmpty: function() {
      return this.getValue() === '';
    },

    /**
     * Set the parentField.
     * Generally use by composable fields (ie. Group,Form,ListField,CombineField,...}
     * @param {inputEx.Group|inputEx.Form|inputEx.ListField|inputEx.CombineField} parentField The parent field instance
     */
    setParentField: function(parentField) {
      this.parentField = parentField;
    },

    /**
     * Return the parent field instance
     * @return {inputEx.Group|inputEx.Form|inputEx.ListField|inputEx.CombineField}
     */
    getParentField: function() {
      return this.parentField;
    },

    getFieldType: function(ruby_field_type) {
      switch(ruby_field_type){
        case "Date":
          return "date";
        case "String":
          return "string";
        case "Integer":
          return "integer";
        case "Float":
        case "BigDecimal":
        case "Money":
          return "number";
        default:
          return "string";
      }
    }    

  };

  inputEx.Field.groupOptions = [{
    type: "autocomplete-field",
    label: "Field",
    name: "name",    
    required: true
  }, {
    type: "string",
    label: "Label",
    name: "label",
    value: ''
  }, {
    type: "string",
    label: "Description",
    name: "description",
    value: ''
  }, {
    type: "boolean",
    label: "Required?",
    name: "required",
    value: false
  }, {
    type: "boolean",
    label: "Show messages",
    name: "showMsg",
    value: false
  }, {
    type: "boolean",
    label: "On same line?",
    name: "align",
    value: false
  }, {
    type: "boolean",
    label: "On new line?",
    name: "newline",
    value: false
  },{
    type: "boolean",
    label: "Label on top?",
    name: "toplabel",
    value: false
  },{
    type: "boolean",
    label: "Placeholder?",
    name: "placeholder",
    value: false
  },{
    type: "boolean",
    label: "Hide?",
    name: "hide",
    value: false
  },{
    type: "boolean",
    label: "readonly?",
    name: "readonly",
    value: false
  },  
  ];

})();