(function () {

    var Event = YAHOO.util.Event, lang = YAHOO.lang, Dom = YAHOO.util.Dom;

    /**
     * A currency field type
     * @class inputEx.CurrencyField
     * @extends inputEx.StringField
     * @constructor
     * @param {Object} options inputEx.Field options object
     */
    inputEx.CurrencyField = function (options) {
        inputEx.CurrencyField.superclass.constructor.call(this, options);
    };
    YAHOO.lang.extend(inputEx.CurrencyField, inputEx.StringField, {

        setOptions:function (options) {
            inputEx.CurrencyField.superclass.setOptions.call(this, options);
            this.options.hidecurrency = options.hidecurrency;
            this.options.region = options.region;
            this.options.decimal = options.decimal;
        },

        renderComponent:function () {
            inputEx.CurrencyField.superclass.renderComponent.call(this);
            Dom.addClass(this.divEl, "inputEx-currency-field");

            $j(this.el).blur({options: this.options}, function(event)
            {
                if($j(this).val() != '')
                    $j(this).formatCurrency({'roundToDecimalPlace': event.data.options.decimal , 'region': event.data.options.region, 'hideSymbol': event.data.options.hidecurrency});
            });
        },

        setValue:function (value, sendUpdatedEvt) {
            if(value !== '' && value !== undefined){
                inputEx.CurrencyField.superclass.setValue.call(this, value, sendUpdatedEvt);
                $j('input', this.divEl).formatCurrency({'roundToDecimalPlace': this.options.decimal , 'region': this.options.region, 'hideSymbol': this.options.hidecurrency});
            }
        },

        /**
         * Return a parsed float (javascript type number)
         * @return {Number} The parsed float
         */
        getValue:function () {
            if($j('input', this.divEl).val() != '')
                return $j('input', this.divEl).asNumber({'region': this.options.region});
            else
                return ""
        },

        validate: function() {
            if(this.isHidden()) return true;

            var v = this.getValue(), str_value = inputEx.CurrencyField.superclass.getValue.call(this);

            // empty field
            if (v === '') {
                // validate only if not required
                return !this.options.required;
            }

            if (isNaN(v)) {
                return false;
            }

            return true;
        }

    });

// Register this class as "number" type
    inputEx.registerType("currency", inputEx.CurrencyField, [
    {
        type: "select",
        label: I18n.t('form.currency.region'),
        name: "region",
        choices: ['en-US', 'af-ZA', 'am-ET', 'ar-AE', 'ar-BH', 'ar-DZ', 'ar-EG', 'ar-IQ', 'ar-JO', 'ar-KW', 'ar-LB', 'ar-LY', 'ar-MA', 'arn-CL', 'ar-OM', 'ar-QA', 'ar-SA', 'ar-SY', 'ar-TN', 'ar-YE', 'as-IN', 'az-Cyrl-AZ', 'az-Latn-AZ', 'ba-RU', 'be-BY', 'bg-BG', 'bn-BD', 'bn-IN', 'bo-CN', 'br-FR', 'bs-Cyrl-BA', 'bs-Latn-BA', 'ca-ES', 'co-FR', 'cs-CZ', 'cy-GB', 'da-DK', 'de-AT', 'de-CH', 'de-DE', 'de-LI', 'de-LU', 'dsb-DE', 'dv-MV', 'el-GR', 'en-029', 'en-AU', 'en-BZ', 'en-CA', 'en-GB', 'en-IE', 'en-IN', 'en-JM', 'en-MY', 'en-NZ', 'en-PH', 'en-SG', 'en-TT', 'en-ZA', 'en-ZW', 'es-AR', 'es-BO', 'es-CL', 'es-CO', 'es-CR', 'es-DO', 'es-EC', 'es-ES', 'es-GT', 'es-HN', 'es-MX', 'es-NI', 'es-PA', 'es-PE', 'es-PR', 'es-PY', 'es-SV', 'es-US', 'es-UY', 'es-VE', 'et-EE', 'eu-ES', 'fa-IR', 'fi-FI', 'fil-PH', 'fo-FO', 'fr-BE', 'fr-CA', 'fr-CH', 'fr-FR', 'fr-LU', 'fr-MC', 'fy-NL', 'ga-IE', 'gl-ES', 'gsw-FR', 'gu-IN', 'ha-Latn-NG', 'he-IL', 'hi-IN', 'hr-BA', 'hr-HR', 'hsb-DE', 'hu-HU', 'hy-AM', 'id-ID', 'ig-NG', 'ii-CN', 'is-IS', 'it-CH', 'it-IT', 'iu-Cans-CA', 'iu-Latn-CA', 'ja-JP', 'ka-GE', 'kk-KZ', 'kl-GL', 'km-KH', 'kn-IN', 'kok-IN', 'ko-KR', 'ky-KG', 'lb-LU', 'lo-LA', 'lt-LT', 'lv-LV', 'mi-NZ', 'mk-MK', 'ml-IN', 'mn-MN', 'mn-Mong-CN', 'moh-CA', 'mr-IN', 'ms-BN', 'ms-MY', 'mt-MT', 'nb-NO', 'ne-NP', 'nl-BE', 'nl-NL', 'nn-NO', 'nso-ZA', 'oc-FR', 'or-IN', 'pa-IN', 'pl-PL', 'prs-AF', 'ps-AF', 'pt-BR', 'pt-PT', 'qut-GT', 'quz-BO', 'quz-EC', 'quz-PE', 'rm-CH', 'ro-RO', 'ru-RU', 'rw-RW', 'sah-RU', 'sa-IN', 'se-FI', 'se-NO', 'se-SE', 'si-LK', 'sk-SK', 'sl-SI', 'sma-NO', 'sma-SE', 'smj-NO', 'smj-SE', 'smn-FI', 'sms-FI', 'sq-AL', 'sr-Cyrl-BA', 'sr-Cyrl-CS', 'sr-Latn-BA', 'sr-Latn-CS', 'sv-FI', 'sv-SE', 'sw-KE', 'syr-SY', 'ta-IN', 'te-IN', 'tg-Cyrl-TJ', 'th-TH', 'tk-TM', 'tn-ZA', 'tr-TR', 'tt-RU', 'tzm-Latn-DZ', 'ug-CN', 'uk-UA', 'ur-PK', 'uz-Cyrl-UZ', 'uz-Latn-UZ', 'vi-VN', 'wo-SN', 'xh-ZA', 'yo-NG', 'zh-CN', 'zh-HK', 'zh-MO', 'zh-SG', 'zh-TW', 'zu-ZA'],
        required: true
    },
    {
        type: "boolean",    
        label: I18n.t('form.currency.hide_currency'),
        name: "hidecurrency",
        value: false
    },
    {
        type: "integer",
        label: I18n.t('form.currency.decimal'),
        name: "decimal",
        negative: true,
        value: 2
    }
    ]);

})();