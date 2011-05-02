(function () { 
	var util = YAHOO.util, Event = YAHOO.util.Event, lang = YAHOO.lang;

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
	inputEx.DynamicField = function (options) {
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
        },50);
  	},
		
    /**
     * Register the tableDidChange event
     */
    setTableDidChangeCallback: function(event){
      event.subscribe(this.onTableDidChange, this, true);
    },
    				
		onTableDidChange: function(event, args){
      this.updateFieldList(args[0])
		},

		onChange: function(e){
		  this.fireFieldDidChangeEvt();
		  inputEx.DynamicField.superclass.onChange.call(this, e);
		},
		
    clearFieldsList: function(){
    	for (i = 0, length = this.choicesList.length; i < length; i += 1) {
				this.hideChoice({ position: i }, false); // no updatedEvt in case of clear (because multiple clear could happen...)
			}
    },
		
		/**
		 * We successfully retrieve the list of tables
		 */
		didReceiveFields: function(o){
		  this.clearFieldsList();
		  var fieldList = YAHOO.lang.JSON.parse(o.responseText);
		  for(var i=0; i<fieldList.length; i++){
		    this.addChoice(fieldList[i]);
		  }
		  
		  this.fireFieldDidChangeEvt();
    },

		/**
		 * We did not receive the list of tables (an error occured)
		 */
    didNotReceiveFields: function(o){
    },
		
		/**
		 * Retrieve the list of tables to be used to populate
		 * the select field
		 */
     updateFieldList: function(dynamic_table_id){
       var tableList = [];
       var callback = {
         success: this.didReceiveFields,
         failure: this.didNotReceiveFields,
         scope: this
       }
       try{         
         YAHOO.util.Connect.asyncRequest('GET', inputExOptions.DynamicField.url + "?dynamic_table_id=" + dynamic_table_id, callback, null)
       }
       catch(err){
         console.log("inputExOptions is undefined. Please define inputExOptions (ex: var inputExOptions = {DynamicField : {url: '../../dynamic_fields.json'}};)")
       }
     },	

 		/**
 		 * Return the value
 		 * @return {Any} the selected value
 		 */
 		getValue: function () {

 			var choiceIndex;

 			if (this.el.selectedIndex >= 0) {

 				choiceIndex = inputEx.indexOf(this.el.childNodes[this.el.selectedIndex], this.choicesList, function (node, choice) {
 					return node === choice.node;
 				});
 				return this.choicesList[choiceIndex].label;

 			} else {

 				return "";

 			}
 		},		
		
		/**
 		 * Set the default values of the options
 		 * @param {Object} options Options object as passed to the constructor
 		 */
 		setOptions: function (options) {

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
		
	});
	
	// Augment prototype with choice mixin (functions : addChoice, removeChoice, etc.)
	lang.augmentObject(inputEx.SelectField.prototype, inputEx.mixin.choice);
	
	
	// Register this class as "select" type
	inputEx.registerType("dynamicfield", inputEx.DynamicField, [
		{
			type: 'list',
			name: 'choices',
			label: 'Choices',
			elementType: {
				type: 'group',
				fields: [
					{ label: 'Value', name: 'value', value: '' }, // not required to allow '' value (which is default)
					{ label: 'Label', name: 'label' } // optional : if left empty, label is same as value
				]
			},
			value: [],
			required: true
		}
	]);

}());