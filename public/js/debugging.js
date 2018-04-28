
// error messages and their methods to change/clear them
var errorMessage = {
   element: $('.error-message'),
   messages: {
      unsure: 'No deletion for the unsure.',
      unselected: 'Please select some items before proceeding.',
      requestFailure: 'Deletion request failed. Please try again.',
      payloadLarge: 'Too many items were selected for deletion. Please select fewer and try again'

   },
   changeMessage: function (situation) {
      this.element.text(this.messages[situation]);
   },
   clearMessage: function () {
      this.element.text('');
   }
};

// sends the request to delete the selected items
var deleteSelected = function() {
   var   returnObj = {},
         childrenChecks, typeEl, typeValue, types;
         checkedLength = 0;

   types = $('[data-name]');

   // splits the checked items by their corresponding DB model
   Array.prototype.forEach.call(types, function(type) {
      typeEl = $(type);
      typeValue = typeEl.attr('data-name');
      returnObj[typeValue] = [];
      childrenChecks = typeEl.find('input[type="checkbox"]:checked');
      // run through the checked elements & store them in their 'type' property
      Array.prototype.forEach.call(childrenChecks, function(currentCheck) {
         checkedLength++; // keep track of the checked elements length
         returnObj[typeValue].push(currentCheck.value);
      });
   });
   // don't request when 0 elements are checked
   if(!checkedLength) {
      errorMessage.changeMessage('unselected');  
      return;
   } else {
      $.ajax({
         url: window.location.origin + '/debugging?_method=DELETE',
         method: 'POST',
         data: {items: JSON.stringify(returnObj)}, // send the checked items in their type container
         success: function() {
            // refresh page on succesful req
            window.location.href = window.location.href;
         },
         error: function (err) {// close dialog button
            if(err.status && err.status === 413) {
               // specific HTTP code 413 message (data sent is too large)
               errorMessage.changeMessage('payloadLarge');
               return;               
            }
            // general request failure message
            errorMessage.changeMessage('requestFailure');
         }
      });
   }
};



// update checked elements count
$(document.body).on('click', function () {
   $('.checked-count').text($('.to-delete-checkbox:checked').length);
});



// check all of the children of a container which contains the checkable elements
$('.debugging-main').on('click', function(evt) {
   var target = $(evt.target),
       elementsTarget, childrenChecks, valueCount, checkStatus;
       // don't continue if the target is a single item
   if(target.hasClass('individual-result') || target.parents('.individual-result').length) return;
   // get the nearest container in the parents tree (or if the target itself is that container)
   elementsTarget = target.hasClass('data-container') ? target : target.parents('.data-container').first();
   childrenChecks = elementsTarget.find('input[type="checkbox"]');
      
   // keep track of the checked/unchecked elements in that container
   valueCount = {
      trueCount: 0,
      falseCount: 0,
      isBigger: function () {
         return this.trueCount > this.falseCount ? true : false;
      }
   };
   // checks all their checkable children && their previous checked status
   Array.prototype.forEach.call(childrenChecks, function(currentCheck) {
      checkStatus = $(currentCheck).prop('checked');
      valueCount[String(checkStatus) + 'Count']++;
   });
   // the check state is the minority of the checked/unchecked elements
   childrenChecks.prop('checked', !valueCount.isBigger());
   
});

// DIALOG & DELETE request
   // Show the dialog box
$('.destructor').on('click', function (evt) {
   var dialogBox = $('.confirm-dialog-box'),
      confirmPhrase = 'I AM SURE',
      confirmMsj = 'Please type <span class="text-bold">"' + confirmPhrase + '"</span> to delete the selected items';
   dialogBox.removeClass('d-none');
   dialogBox.find('.dialog-text').html(confirmMsj);
});

// close the dialog box
$('.close-dialog').on('click', function () {
   $(this).parent().toggleClass('d-none');
   $(this).parent().find('input').val('');
   errorMessage.clearMessage(); 
});

// check the confirm dialog and continue if the input value matches the desired value
$('.dialog-form').submit(function(evt) {
   var confirmPhrase = 'I AM SURE';
   var inputEl = $(evt.target).find('input[type="text"]');
   evt.preventDefault();

   if(inputEl.val() === confirmPhrase ) {
      deleteSelected(); // call the DELETE request on matching phrase
   } else {
      errorMessage.changeMessage('unsure');      
   }
   inputEl.val('');
});