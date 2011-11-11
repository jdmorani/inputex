(function () {
     var util = YAHOO.util, lang = YAHOO.lang, Event = util.Event, Dom = util.Dom;
     
/**
 * Create a slider using YUI widgets
 * @class inputEx.SliderField
 * @extends inputEx.Field
 * @constructor
 * @param {Object} options inputEx.Field options object
 */
inputEx.ButtonField = function(options) {
   inputEx.ButtonField.superclass.constructor.call(this,options);
};

YAHOO.lang.extend(inputEx.ButtonField, inputEx.Field, {
   /**
    * Set the classname to 'inputEx-SliderField'
    * @param {Object} options Options object as passed to the constructor
    */
   setOptions: function(options) {
      inputEx.ButtonField.superclass.setOptions.call(this, options);
      
      this.options.xsl = options.xsl;
      this.options.action = options.action;
      this.options.name = options.name;
      this.options.id = this.generateId(options);
      this.options.className = options.className || "inputEx-ButtonField";
      if(this.options.action == 'transform'){
         this.options.className += " inputEx-ButtonField-Action-Transform";
      }
      this.options.parentEl = lang.isString(options.parentEl) ? Dom.get(options.parentEl) : options.parentEl;
      
      // default type === "submit"
      this.options.type = (options.type === "link" || options.type === "javascript" || options.type === "next" || options.type === "previous") ? options.type : "submit";
      
      // value is the text displayed inside the button (<input type="submit" value="Submit" /> convention...)
      this.options.value = options.value;
      
      this.options.disabled = !!options.disabled;
      
      if (lang.isFunction(options.onClick)) {
         this.options.onClick = {fn: options.onClick, scope:this};
         
      } else if (lang.isObject(options.onClick)) {
         this.options.onClick = {fn: options.onClick.fn, scope: options.onClick.scope || this};
      }

   },

   /**
    * render of the dom element. Create a divEl that wraps the field.
    */
   render: function() {
     // Create a DIV element to wrap the editing el and the image
     this.divEl = inputEx.cn('div', {
       className: 'inputEx-fieldWrapper'
     });
     if (this.options.id) {
       this.divEl.id = this.options.id;
     }

     var containerField = this.getContainerField();

     var isTypeField = this.isInPropertyPanel();
  
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


     this.fieldContainer = inputEx.cn('div', {
       className: this.options.className
     }); // for wrapping the field and description
     // Render the component directly
     this.renderComponent();


     // Description
     if (this.options.description) {
       this.fieldContainer.appendChild(inputEx.cn('div', {
         id: this.divEl.id + '-desc',
         className: 'inputEx-description'
       }, null, this.options.description));
     }

     this.divEl.appendChild(this.fieldContainer);

     // Insert a float breaker
     this.divEl.appendChild(inputEx.cn('div', null, {
       clear: 'both'
     }, " "));

   },   
      
   /**
    * render a slider widget
    */
   renderComponent: function() {
      this.el = inputEx.cn('input', {type: "button", name: this.options.key, value: this.options.label, className: this.options.className, id:this.options.id + '-button', 'data-xsl': this.options.xsl});
      
      Dom.addClass(this.el,"inputEx-Button");
      
      this.fieldContainer.appendChild(this.el);      
      
      this.initEvents();
      
   },
   

   setFieldName: function(name){
      this.el.name = name;
   },

   setValue: function(){
      
   },

   getValue: function(path){
      this.setFieldName(path);
      return path;
   }
   
});

// Register this class as "slider" type
inputEx.registerType("button", inputEx.ButtonField, [{
    type: "dynamicfield",
    label: "Field",
    name: "name",
    choices: [],
    required: true
  }, {
    type: "string",
    label: "Label",
    name: "label",
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
    type: "select",
    label: "Action",
    name: "action",
    choices: ['','transform'],
    required: false
  },{
    type: "string",
    label: "XSL",
    name: "xsl",
    required: false
  }  
], true);

})();
