@echo off
rem  - Concatenate all js files into build\inputex.js
rem  - minify it using YUI compressor to build\inputex-min.js
rem  - minify the CSS file to build\inputex-min.css
 
echo "Starting"
 
set CURRENT_PATH=%~dp0.
set BUILD_PATH=%CURRENT_PATH%\..\build
set SRC_PATH=%CURRENT_PATH%\..\js
set YUIcompressorJar=%CURRENT_PATH%\yuicompressor-2.4.2.jar
 
rem remove previous files
del /s /f /q %BUILD_PATH%\*.*
 
rem Concatenate all the js files

copy /b %CURRENT_PATH%\..\license.txt + %SRC_PATH%\inputex.js + %SRC_PATH%\Visus.js + %SRC_PATH%\json-schema.js + %SRC_PATH%\mixins\choice.js + %SRC_PATH%\Field.js + %SRC_PATH%\Group.js + %SRC_PATH%\widgets\Button.js + %SRC_PATH%\Form.js + %SRC_PATH%\fields\CombineField.js + %SRC_PATH%\fields\StringField.js + %SRC_PATH%\fields\AutoComplete.js + %SRC_PATH%\fields\CheckBox.js + %SRC_PATH%\fields\ColorField.js + %SRC_PATH%\fields\FileField.js + %SRC_PATH%\fields\DateField.js + %SRC_PATH%\fields\DateSplitField.js + %SRC_PATH%\fields\DatePickerField.js + %SRC_PATH%\fields\EmailField.js + %SRC_PATH%\fields\HiddenField.js + %SRC_PATH%\fields\InPlaceEdit.js + %SRC_PATH%\fields\IntegerField.js + %SRC_PATH%\fields\ListField.js + %SRC_PATH%\fields\NumberField.js + %SRC_PATH%\fields\PasswordField.js + %SRC_PATH%\fields\RadioField.js + %SRC_PATH%\fields\RTEField.js + %SRC_PATH%\fields\SelectField.js + %SRC_PATH%\fields\Textarea.js + %SRC_PATH%\fields\TimeField.js + %SRC_PATH%\fields\DateTimeField.js + %SRC_PATH%\fields\UneditableField.js + %SRC_PATH%\fields\UrlField.js + %SRC_PATH%\widgets\ddlist.js + %SRC_PATH%\fields\MultiSelectField.js + %SRC_PATH%\fields\AutoComplete.js + %SRC_PATH%\fields\MultiAutoComplete.js + %SRC_PATH%\fields\UneditableField.js + %SRC_PATH%\fields\SliderField.js + %SRC_PATH%\fields\DynamicField.js + %SRC_PATH%\fields\DynamicTable.js + %SRC_PATH%\fields\TableField.js + %SRC_PATH%\table.js %BUILD_PATH%\inputex.js
 
rem Minify using yui compressor
java -jar %YUIcompressorJar% %BUILD_PATH%\inputex.js -o %BUILD_PATH%\inputex-temp-min.js --charset utf8
 
rem Minify CSS using yui compressor
java -jar %YUIcompressorJar% %CURRENT_PATH%\..\css\inputEx.css -o %BUILD_PATH%\inputex-temp-min.css --charset utf8
 
rem Add the license
copy /b %CURRENT_PATH%\..\license.txt + %BUILD_PATH%\inputex-temp-min.js %BUILD_PATH%\inputex-min.js
del / f %BUILD_PATH%\inputex-temp-min.js
 
copy /b cat %CURRENT_PATH%\..\license.txt %BUILD_PATH%\inputex-temp-min.css > %BUILD_PATH%\inputex-min.css=
del /f %BUILD_PATH%\inputex-temp-min.css
 
rem cp $BUILD_PATH/inputex-min.js "/Volumes/Data/Users/jdmorani/Code/github/case_center/public/javascripts/lib/inputex/"
rem cp $BUILD_PATH/inputex.js "/Users/jdmorani/Code/github/case_center/public/javascripts/lib/inputex/inputex-min.js"
 
echo "done!"