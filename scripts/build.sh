#!/bin/sh
#
#  - Concatenate all js files into build/inputex.js
#  - minify it using YUI compressor to build/inputex-min.js
#  - minify the CSS file to build/inputex-min.css
 
echo "Starting"
 
CURRENT_PATH="$(dirname "$(readlink ${BASH_SOURCE[0]})")"
BUILD_PATH=$CURRENT_PATH/../build
SRC_PATH=$CURRENT_PATH/../js
YUIcompressorJar=$CURRENT_PATH/yuicompressor-2.4.2.jar
 
# Remove previous files
rm -f $BUILD_PATH/*
 
# Concatenate all the js files
cat $CURRENT_PATH/../license.txt $SRC_PATH/inputex.js $SRC_PATH/Visus.js $SRC_PATH/json-schema.js $SRC_PATH/mixins/choice.js $SRC_PATH/Field.js $SRC_PATH/Group.js $SRC_PATH/widgets/Button.js $SRC_PATH/Form.js $SRC_PATH/fields/CombineField.js $SRC_PATH/fields/StringField.js $SRC_PATH/fields/AutoComplete.js $SRC_PATH/fields/CheckBox.js $SRC_PATH/fields/ColorField.js $SRC_PATH/fields/DateField.js $SRC_PATH/fields/DateSplitField.js $SRC_PATH/fields/DatePickerField.js $SRC_PATH/fields/EmailField.js $SRC_PATH/fields/HiddenField.js $SRC_PATH/fields/InPlaceEdit.js $SRC_PATH/fields/IntegerField.js $SRC_PATH/fields/ListField.js $SRC_PATH/fields/NumberField.js $SRC_PATH/fields/PasswordField.js $SRC_PATH/fields/RadioField.js $SRC_PATH/fields/RTEField.js $SRC_PATH/fields/SelectField.js $SRC_PATH/fields/Textarea.js $SRC_PATH/fields/TimeField.js $SRC_PATH/fields/DateTimeField.js $SRC_PATH/fields/UneditableField.js $SRC_PATH/fields/UrlField.js $SRC_PATH/widgets/ddlist.js $SRC_PATH/fields/MultiSelectField.js $SRC_PATH/fields/AutoComplete.js $SRC_PATH/fields/MultiAutoComplete.js $SRC_PATH/fields/UneditableField.js $SRC_PATH/fields/SliderField.js $SRC_PATH/fields/DynamicField.js $SRC_PATH/fields/DynamicTable.js $SRC_PATH/fields/TableField.js $SRC_PATH/table.js > $BUILD_PATH/inputex.js
 
# Minify using yui compressor
java -jar $YUIcompressorJar $BUILD_PATH/inputex.js -o $BUILD_PATH/inputex-temp-min.js --charset utf8
 
# Minify CSS using yui compressor
java -jar $YUIcompressorJar $CURRENT_PATH/../css/inputEx.css -o $BUILD_PATH/inputex-temp-min.css --charset utf8
 
# Add the license
cat $CURRENT_PATH/../license.txt $BUILD_PATH/inputex-temp-min.js > $BUILD_PATH/inputex-min.js
rm -f $BUILD_PATH/inputex-temp-min.js
 
cat $CURRENT_PATH/../license.txt $BUILD_PATH/inputex-temp-min.css > $BUILD_PATH/inputex-min.css
rm -f $BUILD_PATH/inputex-temp-min.css
 
#cp $BUILD_PATH/inputex-min.js "/Volumes/Data/Users/jdmorani/Code/github/case_center/public/javascripts/lib/inputex/"
cp $BUILD_PATH/inputex.js "/Users/jdmorani/Code/github/case_center/public/javascripts/lib/inputex/inputex-min.js"
 
echo "done!"