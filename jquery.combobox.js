/*
 * SELECT CONVERT TO COMBOBOX PLUGIN
 * $('select.combobox').ComboBox();
 */

(function( $ ) {
  $.fn.ComboBox = function( options ){
    var ComboBox = function(selectBox, options)
    {
      // Create ComboBox local reference
      var ComboBox = this;
        
      $.extend(this,{
        listBox: $('<ul>'),
        
        selectArrow: $('<div>', { 
                      'class': "combobox-arrow"
                    }),
        
        textBox: $('<input type="text">').attr({
                      name: selectBox.prop('name')+'_combobox',
                      'class': selectBox.prop('class'),
                      placeholder: selectBox.attr('placeholder'),
                      autocomplete: "off"
                    }),
        
        container: $('<span />',{ 'class': 'combobox-container'}),
        
        // jQuery element of selected Item
        selectedItem: null,
        
        /* SELECT ITEM */
        selectItem: function( item, nofocus) {
          this.listBox.children().removeClass("highlighted");
          
          // If the sent item actually exists, then highlight it and set the select value.
          if($(item,this.listBox).length !== 0) {
            item = $(item).addClass("highlighted");
              
            this.selectedItem = item;
            selectBox.val(item.data('value'));
            if(!nofocus) this.textBox.focus();
            this.textBox.val(item.text());
            
          // If the item doesn't exist, clear the select value
          } else {
            // Place cursor at tail of text box if it's already blurred
            if(!nofocus && !this.textBox.is(':focus')) {
              this.textBox.focus();
              this.textBox.val(this.textBox.val());
            }
            
            this.selectedItem = null;
            selectBox.val(null);
          }
          return this;
        },
        
        /* SHOW LIST */
        showList: function( showAll ) {
        	var listBox = this.listBox;
        	var searchText = this.textBox.val().toLowerCase();
        	
        	// Second dropdown click will minimize
        	if(showAll && $('div:hidden',listBox).length == 0) {
          	if(this.selectedItem) {
            	this.selectItem(this.selectedItem);
            	this.collapse();
            	return;
          	}
          	showAll = false;
        	}
        	  
        	// Prepare
      		var resultFound = false;
          this.collapse();
        	
        	// Param check
        	if($('.option',listBox).length < 1 || !(searchText || showAll)) return;
        	
        	var that = null;
      		$.each($('.option',listBox), function() {
        		var item_text = $(this).text().toLowerCase();
        		$(this).hide();
        		
        		// Skip if name isn't found or short name isn't at the beginning
        		if(!showAll) {
          		var n = item_text.search(searchText);
              if(n<0) return; // Not found
          		if(searchText.length <= 2 && n>0) return; // Short string search not found at beginning of text
        		}
        		
        		// Show item which was found
        		$(this).show();
        		resultFound = true;
          	
          	//Auto-highlight item if it's the right text
          	if(searchText && searchText === item_text) {
          	  that = this;
        	  }
        	});
        	
        	if(resultFound) this.expand();
          this.selectItem(that);
        	return this;
        },
        
        collapse: function(event) {
          ComboBox.listBox.hide();
        },
        
        expand: function(event) {
          ComboBox.listBox.show();
        }
      });
      
      // Hide original select box and add new elements to DOM
      selectBox.hide().after(this.container.append(
        this.textBox,
        this.selectArrow,
        this.listBox
      ));
        
      // Populate listBox
      var longestOption = 0;
    	$.each($('option',selectBox), function() {
      	var text = $.trim($(this).text());
      	var val = $(this).val();
      	
      	// Ignore empties
      	if(typeof val === 'undefined' || val === null || !text) return;
      	
      	// Append option to list
      	var option = $('<li>',{
        	      'class': 'option',
        	      data: { 
          	      value: $(this).val(),
          	      text: text
          	    }
        	    })
        		  .appendTo(ComboBox.listBox)
        		  .append($('<div>', {text: text}));
      	
      	// Obtain the longest option width
      	if($('div:first',option).innerWidth() > longestOption) {
        	longestOption = $('div:first',option).innerWidth();
        }
        
        // Set initial selection without changing focus
        if($(this).prop('selected')) {
          ComboBox.selectItem(option, true);
        }
      });
      
      // Set all options to the longest width and then the correct position
      $('.option div',this.listBox).width(longestOption).css('position','absolute');
      
      // Match widths of input box and combo dropdown list
      this.listBox.width(this.textBox.innerWidth()).hide();
      
      // This blur is needed for the pseudo placeholder in IE
      this.textBox.blur()
      
      /* TextBox KeyBindings */
      // Navigate option list using up/down keys
      .on('keydown.ComboBox', function(event) {
        var keynum = event.keyCode || event.which;
        var item = ComboBox.selectedItem;
        var visibility = ComboBox.listBox.is(":visible")? ':visible':null;
        
        if(keynum == 38) {  //UP
          if(item) item = item.prevAll(visibility).first();
          else item = ComboBox.listBox.children(visibility).last();
        } else if(keynum == 40) { //DOWN
          if(item) item = item.nextAll(visibility).first();
          else item = ComboBox.listBox.children(visibility).first();
        } else
          return;
        
        event.preventDefault();
        ComboBox.selectItem(item);
        
        // Clear text if no items exist
        if(!ComboBox.selectedItem) ComboBox.textBox.val('');
        return;
      })
        
      // Update option list as user types in combobox
      .on('keyup.ComboBox', function(event){
        var keynum = event.keyCode || event.which;
          
        //ignore keys under 48 (numeric) except for backspace, space, and delete
        if(keynum < 48 && keynum != 8 && keynum != 32 && keynum != 46)
          return;
        
        ComboBox.showList(); 
      })
      
      // Input Click -- stop propagation to body
      .on('click.ComboBox', function(event){
          event.stopPropagation();
      });
      
      // SelectArrow Click
      this.selectArrow.on('click.ComboBox', function(event){ 
          ComboBox.showList(true);
          event.stopPropagation();
      });
      
      // Option Click
    	this.listBox.on("click.ComboBox",".option",function(){
      	ComboBox.selectItem(this);
      });
      
      // Select box is removed from form if there is no selection
      var formHandler = function(event) {
        if(!ComboBox.selectedItem) 
          selectBox.prop('disabled',true);
      };
      selectBox.closest('form').on('submit.ComboBox',formHandler);
      
      // Body Click
      $(document).on("click.ComboBox", this.collapse);
      
      this.destroy = function( ) {
        // Remove triggers
        selectBox.off('.ComboBox');
        selectBox.closest('form').off('.ComboBox',formHandler);
        $(document).off('.ComboBox', this.collapse);
        
        // Remove created DOM elements and everything inside them
        this.textBox.remove();
        this.listBox.remove();
        this.selectArrow.remove();
        this.container.remove();
        
        // Remove select to combo association
        selectBox.removeData('ComboBox');
        
        // Unhide select field
        selectBox.show();
        
        // Delete self
        delete this;
      };
    };
  
    return this.each(function()
    {
      var selectBox = $(this);
      
      // Return early if this element already has a plugin instance
      if(selectBox.data('ComboBox')) return;
      
      // Pass options to constructor and
      // Store ComboBox in this element's data
      selectBox.data('ComboBox', new ComboBox(selectBox, options));
    });

  };
})( jQuery );