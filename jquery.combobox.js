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
      var visibleList;
        
      $.extend(this,{
        listArray: [],
        
        listBox: $('<ul>'),
        
        selectBox: selectBox,
        
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
        
        // Search Parameter
        prevSearch: "",
        
        /* SELECT ITEM */
        selectItem: function( item) {
          var itemIndex;
          this.listBox.children().removeClass("highlighted");
          
          if(typeof item == "number") {
            itemIndex = item;
            item = this.listBox.children().eq(item);
          } else {
            item = $(item).eq(0);
            itemIndex = item.index();
          }
          
          // If the sent item actually exists, then highlight it and set the select value.
          if(item && this.listBox.is(item.closest('ul'))) {
            
            // Set and highlight selection
            this.selectedItem = item.addClass("highlighted");
            this.selectBox.prop("selectedIndex",itemIndex).prop('disabled',false);
            this.textBox.focus().val(item.text());
            
          // If the item doesn't exist, clear the select value
          } else {
            // Place cursor at tail of text box if it's already blurred
            if(!this.textBox.is(':focus')) {
              this.textBox.focus();
              this.textBox.val(this.textBox.val());
            }
            
            this.selectedItem = null;
            selectBox.val(null).prop('disabled',true);
          }
          return this;
        },
        
        /* SHOW LIST */
        showList: function( showAll ) {
        	var listBox = this.listBox;
        	var searchText = this.textBox.val().toLowerCase();
        	var quickSearch = (visibleList && this.prevSearch.length > 2 && searchText.indexOf(this.prevSearch)==0);
        	
        	// Show options if box is empty or the button is clicked
        	if(showAll || !searchText) {
          	
          	// Place cursor in text box
          	this.selectItem(this.selectedItem);
          	
        	  // Second dropdown click will minimize
          	if(listBox.is(":visible")) {
            	return this.collapse();
            	
          	} else if(!this.selectedItem && searchText) {
            	return this.expand();
            	
        	  } else {
          	  $('li',listBox).show();
            	return this.expand();
          	}
        	  
        	// Show matching results
          } else {
        	  this.prevSearch = searchText;
            if(!quickSearch) {
              visibleList = $('li',listBox);
            }
            
            // Update list search results and show them
            visibleList = visibleList.hide()
                            .filter(function(index) {
                              var pos = this.innerText.toLowerCase().indexOf(searchText);
                              if(pos < 0)
                                return false;
                              else if(pos == 0)
                                return true;
                              else if(searchText.length > 2)
                                return true;
                            })
                            .show();
            // Check for an exact match
            var that = $.inArray(searchText,this.listArray);
            if(that < 0) that = null;
            
            if(visibleList.length > 0) {
        	    this.expand();
            } else {
              this.collapse();
            }
            return this.selectItem(that);
        	}
        },
        
        collapse: function(event) {
          ComboBox.listBox.hide();
          return this;
        },
        
        expand: function(event) {
          ComboBox.listBox.show();
          return this;
        }
      });
      
      // Hide original select box and add new elements to DOM
      selectBox.hide().after(this.container.append(
        this.textBox,
        this.selectArrow,
        this.listBox
      ));
      
      // Generate array list of options
      var textToappend = "";
      this.listArray = $.map($('option',selectBox), function(option, i) {
        var text = $.trim($(option).text()) || "";
        textToappend += '<li name="'+text+'">'+text+'</li>';
        return text.toLowerCase();
      });
      
      // Populate listBox
      if(textToappend) {
        this.listBox.append(textToappend);
        textToappend = null;
      
        // Set initial selection without changing focus
        if(selectBox.prop("selectedIndex") >= 0) {
          this.selectItem(selectBox.prop("selectedIndex"));
        }
      
        // Set all options to the longest width and then the correct position
        var boxwidth = Math.max(this.listBox.get(0).scrollWidth, this.textBox.width());
        $('li',this.listBox).width(boxwidth);
        
        // Minimum list height
        var min_height = $('li',this.listBox).outerHeight();
        
        var text_border_width = this.textBox.css('border-width');
        
        // Match widths of input box and combo dropdown list
        this.listBox.width(this.textBox.innerWidth())
                    .css("overflow",'')
                    .css("top",this.textBox.outerHeight())
                    .css("min-height",min_height);
        
        // Adjust for IE not adjusting for scrollbars
        if($.browser.msie && boxwidth > this.textBox.width()) {
          this.listBox.css("padding-bottom",min_height);
        }
        
        // This is so IE sizes the box right
      	$('li',this.listBox).hide()
    	}
    	this.collapse();
      
      // This blur is needed for the pseudo placeholder in IE
      this.textBox.blur()
      
      /* TextBox KeyBindings */
      // Navigate option list using up/down keys
      .on('keydown.ComboBox', function(event) {
        var keynum = event.keyCode || event.which;
        if(!(keynum == 38 || keynum == 40)) return;
        
        var item = ComboBox.selectedItem;
        var visibility = ComboBox.listBox.is(":visible")? ':visible':null;
        
        if(keynum == 38) {  //UP
          if(item) item = item.prevAll(visibility).first();
          else item = ComboBox.listBox.children(visibility).last();
        } else if(keynum == 40) { //DOWN
          if(item) item = item.nextAll(visibility).first();
          else item = ComboBox.listBox.children(visibility).first();
        }
        
        event.preventDefault();
        ComboBox.selectItem(item);
        
        // Clear text if no items exist
        if(!ComboBox.selectedItem) {
          ComboBox.textBox.val('');
        } else {
          var scrollto = (item.prevAll(visibility).length-1) * item.outerHeight();
          ComboBox.listBox.scrollTop(scrollto);
        }
        return;
      })
        
      // Update option list as user types in combobox
      .on('keyup.ComboBox', function(event){
        var keynum = event.keyCode || event.which;
          
        // Ignore keys under 48 (numeric) except for backspace, space, and delete
        if(keynum < 48 && keynum != 8 && keynum != 32 && keynum != 46)
          return;
        
        // Fast Typing
        if(ComboBox.prevSearch && ComboBox.prevSearch == ComboBox.textBox.val().toLowerCase()) return;
        
        ComboBox.selectItem(null)
                .showList()
                .listBox.scrollTop(0);
                  
      })
      
      // Input Click -- stop propagation to body
      .on('click.ComboBox', function(event){
          event.stopPropagation();
      })
      
      .on('dblclick.ComboBox', function(event){
          if(!$(event.target).val()) ComboBox.showList(true);
      });
      
      // SelectArrow Click
      this.selectArrow.on('click.ComboBox', function(event){ 
          ComboBox.showList(true);
          event.stopPropagation();
      });
      
      // Option Click
    	this.listBox.on("click.ComboBox","li",function(){
      	ComboBox.selectItem(this);
      });
      
      // Select box is removed from form if there is no selection
      var formHandler = function(event) {
        selectBox.prop('disabled',!ComboBox.selectedItem);
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
        selectBox.prop('disabled',false).show();
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
    
  // Case-insensitive text search
  $.expr[":"].containsi = $.expr.createPseudo(function(arg) {
    return function( elem ) {
        return $(elem).text().toUpperCase().indexOf(arg.toUpperCase()) >= 0;
    };
  });
  
})( jQuery );