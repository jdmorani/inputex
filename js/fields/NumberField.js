/**
 * options: maxDigits, comma-separated,
 *
 */
(function() {

   var inputEx = YAHOO.inputEx, Event = YAHOO.util.Event, lang = YAHOO.lang;

/**
 * @class A field limited to number inputs (floating)
 * @extends inputEx.IntegerField
 * @constructor
 * @param {Object} options inputEx.Field options object
 */
inputEx.NumberField = function(options) {
   inputEx.NumberField.superclass.constructor.call(this,options);
};
YAHOO.lang.extend(inputEx.NumberField, inputEx.StringField, 
/**
 * @scope inputEx.NumberField.prototype   
 */
{
   /**
    * Return a parsed float (javascript type number)
    */
   getValue: function() {
      return parseFloat(this.el.value);
   },
   
   /**
    * Check if the entered number is a float
    */
   validate: function() { 
      var v = this.getValue();
      if(isNaN(v)) return false;
      var s = String(v);
	   return s.match(/^(\+?((([0-9]+(\.)?)|([0-9]*\.[0-9]+))([eE][+-]?[0-9]+)?))$/);
   }

});



/**
 * Register this class as "number" type
 */
inputEx.registerType("number", inputEx.NumberField);

})();