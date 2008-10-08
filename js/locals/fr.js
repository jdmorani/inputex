/**
 * InputEx French localization
 */
(function() {
   
   var msgs = YAHOO.inputEx.messages;

   msgs.required = "Ce champ est obligatoire";
   msgs.invalid = "Ce champ n'est pas valide";
   msgs.valid = "Ce champ est valide";
   msgs.invalidEmail = "Email non valide; ex: michel.dupont@fai.fr";
   msgs.selectColor = "S&eacute;lectionnez une couleur :";
   msgs.invalidPassword = ["Le mot de passe doit contenir au moins "," caract&egrave;res (lettres ou chiffres)"];
   msgs.invalidPasswordConfirmation = "Les mots de passe entrés ne sont pas identiques !";
   msgs.capslockWarning = "Attention: touche majuscule activée";
   msgs.invalidDate = "Date non valide; ex: 25/01/2007";
   msgs.defaultDateFormat = "d/m/Y";
   msgs.shortMonths = ["Jan", "Fév", "Mars", "Avril", "Mai", "Juin", "Juil", "Août", "Sept", "Oct", "Nov", "Déc"];
   msgs.months = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];
   msgs.weekdays1char =  ["D", "L", "M", "M", "J", "V", "S"];
   msgs.shortWeekdays = ["Di","Lu","Ma","Me","Je","Ve","Sa"];
   msgs.selectMonth = "- Choisissez -";
   msgs.dayTypeInvite = "Jour";
   msgs.yearTypeInvite = "Année";
   msgs.cancelEditor = "annuler";
   msgs.okEditor = "Ok";
   msgs.defautCalendarOpts = {
      navigator: {
               strings : {
                   month: "Choisissez un mois",
                   year: "Entrez une année",
                   submit: "Ok",
                   cancel: "Annuler",
                   invalidYear: "Année non valide"
               }
      },
      start_weekday: 1 // la semaine commence un lundi
   };
   
})();