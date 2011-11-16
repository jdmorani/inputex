(function() {
  var util = YAHOO.util,
      Event = YAHOO.util.Event,
      lang = YAHOO.lang,
      Dom = YAHOO.util.Dom;

  /**
   * Create a table field select field
   * @class inputEx.SelectField
   * @extends inputEx.Field
   * @constructor
   */
  inputEx.DynamicField = function(options) {
    inputEx.DynamicField.superclass.constructor.call(this, options);      
  };

  lang.extend(inputEx.DynamicField, inputEx.AutoComplete, {
     
    /**
     * Set the default values of the options
     * @param {Object} options Options object as passed to the constructor
     */     
    setOptions: function(options) {
      inputEx.DynamicField.superclass.setOptions.call(this, options);

      this.options.parentDynamicTable = this.retrieveParentDynamicTable(this);

      if (typeof this.options.parentDynamicTable != 'undefined' && this.options.parentDynamicTable)
        this.options.table_key = this.options.parentDynamicTable.inputs[0].options.selectedValue;
      else
        this.options.table_key = '';

      this.options.typeInvite = "Start typing a field name",

      this.options.datasourceParameters = {
        responseType: YAHOO.util.XHRDataSource.TYPE_JSARRAY,
        responseSchema: {
          fields: ["name", "key"]
        }
      };
      
      this.options.autoComp = {
        generateRequest: function(sQuery) {return "&query=" + sQuery},
        applyLocalFilter: true,
        queryMatchContains: true,
        typeAhead: false,
        animVert: false,
        forceSelection: false
      };

      this.options.datasource = new YAHOO.util.XHRDataSource("<%=CaseCenter::Application.routes.url_helpers.helper_fields_list_path(:format => :json)%>?table_key=" + this.options.table_key);

    },

     /**
      * Build the YUI autocompleter
      */
     buildAutocomplete: function() {
        // Call this function only when this.el AND this.listEl are available
        if(!this._nElementsReady) { this._nElementsReady = 0; }
        this._nElementsReady++;
        if(this._nElementsReady != 2) return;

        if(!lang.isUndefined(this.options.datasourceParameters))
        {
           for (param in this.options.datasourceParameters)
           {
              this.options.datasource[param] = this.options.datasourceParameters[param];
           }
        }

        
        // Instantiate AutoComplete
        this.oAutoComp = new YAHOO.widget.AutoComplete(this.el, this.listEl, this.options.datasource, this.options.autoComp);
        
        if(!this.oAutoComp.itemSelectEvent)
          return; //this may happen when the field is embedded in the type editor property panel because the field may be deleted right after the autocomplete event is fired.

        if(!lang.isUndefined(this.options.generateRequest))
        {
            this.oAutoComp.generateRequest = this.options.generateRequest;
        }
        // subscribe to the itemSelect event
        this.oAutoComp.itemSelectEvent.subscribe(this.itemSelectHandler, this, true);

        // subscribe to the textboxBlur event (instead of "blur" event on this.el)
        //                                    |-------------- autocompleter ----------|
        //    -> order : "blur" on this.el -> internal callback -> textboxBlur event -> this.onBlur callback
        //    -> so fired after autocomp internal "blur" callback (which would erase typeInvite...)
        this.oAutoComp.textboxBlurEvent.subscribe(this.onBlur, this, true);

        this.setClassFromState();
     },

     /**
      * itemSelect handler
      * @param {} sType
      * @param {} aArgs
      */
     itemSelectHandler: function(sType, aArgs) {
        var aData = aArgs[2];
        this.setValue(aData[0] + '@_@@_@' + aData[1]);
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
    * Render the hidden list element
    */
    renderComponent: function() {
    
     // This element wraps the input node in a float: none div
     this.wrapEl = inputEx.cn('div', {className: 'inputEx-StringField-wrapper'});

     // Attributes of the input field
     var attributes = {
       type: 'text',
       id: YAHOO.util.Dom.generateId()
     };
     if(this.options.size) attributes.size = this.options.size;
     if(this.options.readonly) attributes.readonly = 'readonly';
     if(this.options.maxLength) attributes.maxLength = this.options.maxLength;

     // Create the node
     this.el = inputEx.cn('input', attributes);

     this.linkEl = inputEx.cn('span', {className: 'inputEx-link-img'});

     // Create the hidden input
     var hiddenAttrs = {
       type: 'hidden',
       value: ''
     };
     if(this.options.name) hiddenAttrs.name = this.options.name;
     this.hiddenEl = inputEx.cn('input', hiddenAttrs);

     // Append it to the main element
     this.wrapEl.appendChild(this.el);
     this.wrapEl.appendChild(this.hiddenEl);
     this.wrapEl.appendChild(this.linkEl);
     this.fieldContainer.appendChild(this.wrapEl);

     // Render the list :
     this.listEl = inputEx.cn('div', {id: Dom.generateId() });
     this.fieldContainer.appendChild(this.listEl);

     Event.onAvailable([this.el, this.listEl], this.buildAutocomplete, this, true);
    },    

    /**
     * Register the tableDidChange event
     */
    setTableDidChangeCallback: function(event) {      
      this.options.tableDidChangeEvt = event;
      event.subscribe(this.onTableDidChange, this, true);
    },

    onChange: function(e) {
      inputEx.DynamicField.superclass.onChange.call(this, e);
    },


    destroy: function() {

      if(this.options.tableDidChangeEvt){
        this.options.tableDidChangeEvt.unsubscribe(this.onTableDidChange, this); 
      }

      // Destroy group itself      
      inputEx.DynamicField.superclass.destroy.call(this);
    },

    /**
     * Set the value
     * @param {Any} value Value to set
     * @param {boolean} [sendUpdatedEvt] (optional) Wether this setValue should fire the updatedEvt or not (default is true, pass false to NOT send the event)
     */
    setValue: function(value, sendUpdatedEvt) {      
      this.hiddenEl.value = value || "";
      this.el.value  =  value.split('@_@@_@')[0] || "";
      // "inherited" from inputex.Field :
      //    (can't inherit of inputex.StringField because would set this.el.value...)
      //
      // set corresponding style
      this.setClassFromState();

      if(sendUpdatedEvt !== false) {
        // fire update event
        this.fireUpdatedEvt();
      }
    },
    
    /**
     * Return the hidden value (stored in a hidden input)
     */
    getValue: function() {
       return this.hiddenEl.value;
    },

    /**
    * onChange event handler
    * @param {Event} e The original 'change' event
    */
    onChange: function(e) {
      this.setClassFromState();
      // Clear the field when no value 
      if (this.hiddenEl.value.split('@_@@_@')[0] != this.el.value) this.hiddenEl.value = this.el.value;
      lang.later(50, this, function() {
       if(this.el.value == "") {
        this.setValue("");
       }
      });
    },    


    onBlur: function(e){
     if (this.hiddenEl.value.split('@_@@_@')[0] != this.el.value && this.el.value != this.options.typeInvite) this.el.value = this.hiddenEl.value;
     if(this.el.value == '' && this.options.typeInvite) {
       Dom.addClass(this.divEl, "inputEx-typeInvite");
       if (this.el.value == '') this.el.value = this.options.typeInvite;
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

      // if the field is empty :
      if (this.hiddenEl.value.indexOf('@_@@_@') >= 0) {
        return 'linked';
      }

      return 'unlinked';
    }

  });

  // Register this class as "select" type
  inputEx.registerType("dynamicfield", inputEx.DynamicField, [{    
  }]);

}());