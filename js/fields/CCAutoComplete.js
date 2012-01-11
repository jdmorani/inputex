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
  inputEx.CCAutoComplete = function(options) {
    inputEx.CCAutoComplete.superclass.constructor.call(this, options);      
  };

  lang.extend(inputEx.CCAutoComplete, inputEx.AutoComplete, {
     
    /**
     * Set the default values of the options
     * @param {Object} options Options object as passed to the constructor
     */     
    setOptions: function(options) {
      inputEx.CCAutoComplete.superclass.setOptions.call(this, options);

      this.options.typeInvite = options.typeInvite;

      this.options.datasourceParameters = {
        responseType: YAHOO.util.XHRDataSource.TYPE_JSARRAY,
        responseSchema: {
          fields: ["name", "key"]
        }
      };
      
      this.options.autoComp = {
        generateRequest: function(sQuery) {return "query=" + sQuery},
        applyLocalFilter: true,
        queryMatchContains: true,
        typeAhead: false,
        animVert: false,
        forceSelection: false
      };

      this.options.datasource = options.datasource;

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



    onChange: function(e) {
      inputEx.CCAutoComplete.superclass.onChange.call(this, e);
    },

    destroy: function() {
      // Destroy group itself      
      inputEx.CCAutoComplete.superclass.destroy.call(this);
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
    }

  });

}());