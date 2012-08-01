ComboBox
========

Jquery module which converts Select HTML fields into Comboboxes

A ComboBox consists of a free-form text field and a Select box tied together.

See index.html for an example of use.

To start, use jQuery selector to get the select element.  Then use .ComboBox() to initialize.
This will automatically do the conversion from Select to ComboBox.

As the user types, the results will filter.  
The Up/Down arrow keys can be used to navigate the results.
The arrow next to the text field will show/hide all results when clicked.
Any option can be selected by clicking it or navigating or typing the matching text.

When submitting, the select value will be sent as normal with the normal field name.
Additionally, the textual value will be sent with the select field name appended with "_combobox"
If there is no matching Select value to the Text field, the select field will be disabled upon form submission and will not be in the values sent by the form

To manage the ComboBox object yourself, you can retrieve it like this:
var combobox = $("select.combobox").data("ComboBox");

You can then manipulate the listBox or textBox as needed.
var listBox = combobox.listBox;
var textBox = combobox.textBox;

The combobox can be unconverted back to select by using the destroy method:
combobox.destroy();