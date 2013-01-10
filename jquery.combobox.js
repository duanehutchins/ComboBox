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
        selectItem: function( item) {
          this.listBox.children().removeClass("highlighted");
          
          // If the sent item actually exists, then highlight it and set the select value.
          if($(item,this.listBox).length !== 0) {
            item = $(item).addClass("highlighted");
            
            // Set and highlight selection
            this.selectedItem = item;
            $("option",selectBox).filter(function() {
              return this.text == item.text(); 
            }).attr('selected', true);
            
            this.textBox.focus()
                        .val(item.text());
            
          // If the item doesn't exist, clear the select value
          } else {
            // Place cursor at tail of text box if it's already blurred
            if(!this.textBox.is(':focus')) {
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
        	
        	// Show all options if box is empty and then place cursor in text box
        	if(!searchText) showAll = true;
        	if(showAll) this.selectItem(this.selectedItem);
        	
        	// Second dropdown click will minimize
        	if(showAll && $('li:hidden',listBox).length == 0) {
          	if(this.selectedItem) {
            	this.collapse();
            	return this;
          	}
          	showAll = false;
        	}
        	  
        	// Prepare
          $('li',listBox).show();
        	this.expand();
        	if(showAll) return this;
        	
        	// Show matching results
        	var that = null;
      		$.each($('li',listBox).hide(), function() {
        		var item_text = $(this).text().toLowerCase();
        		
        		// Skip if name isn't found or short name isn't at the beginning
        		var n = item_text.search(searchText);
            if(n<0) return; // Not found
        		if(searchText.length <= 2 && n>0) return; // Short string search not found at beginning of text
        		
        		// Show item which was found
        		$(this).show();
          	
          	//Auto-highlight item if it's the right text
          	if(searchText && searchText === item_text) {
          	  that = this;
        	  }
        	});
        	
        	// Select a match which matches exactly (case insensitive)
        	this.selectItem(that);
          
        	return this;
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
      
      // Populate listBox
      var opts = [];
      var selection = null
    	$.each($('option',selectBox), function() {
      	var text = $.trim($(this).text());
      	var val = $(this).val();
      	// Ignore empties
      	if(typeof val === 'undefined' || val === null || !text) return;
      	
      	// Append to list
        if($(this).prop('selected')) {
      	  opts.push('<li class="highlighted">'+text+'</li>');
        } else {
      	  opts.push('<li>'+text+'</li>');
    	  }
        
      });
      this.listBox.append(opts.join(''));
      
      // Set initial selection without changing focus
      this.selectItem($('li.highlighted',this.listBox));
      
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
          
        //ignore keys under 48 (numeric) except for backspace, space, and delete
        if(keynum < 48 && keynum != 8 && keynum != 32 && keynum != 46)
          return;
        
        ComboBox.selectItem(null)
                .showList()
                .listBox.scrollTop(0);
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
    	this.listBox.on("click.ComboBox","li",function(){
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