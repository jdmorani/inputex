(function() {

  var lang = YAHOO.lang,
      Event = YAHOO.util.Event,
      Dom = YAHOO.util.Dom;

  /**
   * Basic regexp field (derived from the string field)
   * @class inputEx.RegExpField
   * @extends inputEx.StringField
   * @constructor
   * @param {Object} options Added options:
   * <ul>
   *   <li>regexp: regular expression used to validate (otherwise it always validate)</li>
   *   <li>size: size attribute of the input</li>
   *   <li>maxLength: maximum size of the string field (no message display, uses the maxlength html attribute)</li>
   *   <li>minLength: minimum size of the string field (will display an error message if shorter)</li>
   *   <li>typeInvite: string displayed when the field is empty</li>
   *   <li>readonly: set the field as readonly</li>
   * </ul>
   */
  inputEx.RegExpField = function(options) {
    inputEx.RegExpField.superclass.constructor.call(this, options);

  };

  lang.extend(inputEx.RegExpField, inputEx.StringField, {
 

    escapeRegExp: function(str) {
      return str.replace(/[-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
    },


    /**
     * Return the string value
     * @param {String} The string value
     */
    getValue: function() {
      return this.el.value == '' ? '' : this.escapeRegExp(this.el.value);
    },

    /**
     * Function to set the value
     * @param {String} value The new value
     * @param {boolean} [sendUpdatedEvt] (optional) Wether this setValue should fire the updatedEvt or not (default is true, pass false to NOT send the event)
     */
    setValue: function(value, sendUpdatedEvt) {
      // + check : if Null or Undefined we put '' in the stringField
      this.el.value = (lang.isNull(value) || lang.isUndefined(value)) ? '' : value;
    }

  });


  // Register this class as "string" type
  inputEx.registerType("regexp", inputEx.RegExpField, []);

})();