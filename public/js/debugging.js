var checkboxes = $('.to-delete-checkbox:checked');
$(document.body).on('click', function() {
   $('.checked-count').text($('.to-delete-checkbox:checked').length );
});

var errorMessage = {
   element: $('.error-message'),
   messages: {
      unsure: 'No deletion for the unsure.',
      unselected: 'Please select some items before proceeding.',
      requestFailure: 'Deletion request failed. Please try again.'

   },
   changeMessage: function(situation) {
      this.element.text(this.messages[situation]);
   },
   clearMessage: function() {
      this.element.text('');
   }
}

// $('.data-container').on('click', function(evt) {


//    let childrenChecks = target.find('input[type="checkbox"]');
//    let valueCount = {
//       trueCount: 0,
//       falseCount: 0,
//       isBigger: function () {
//          return this.trueCount > this.falseCount ? true : false;
//       }
//    };
//    Array.prototype.forEach.call(childrenChecks, function(currentCheck) {
//       let checkStatus = $(currentCheck).prop('checked');
//       valueCount[String(checkStatus) + 'Count']++;
//    });
//    childrenChecks.prop('checked', !valueCount.isBigger());
// });



$('.destructor').on('click', function(evt) {
   var   dialogBox = $('.confirm-dialog-box'),
         confirmPhrase = 'I AM SURE',
         confirmMsj = 'Please type <span class="text-bold">"' + confirmPhrase + '"</span> to delete the selected items';
   dialogBox.removeClass('d-none');
   dialogBox.find('.dialog-text').html(confirmMsj);
});

$('.debugging-main').on('click', function(evt) {
   var target = $(evt.target);
   if(target.hasClass('individual-result') || target.parents('.individual-result').length) return;
   var elementsTarget = target.hasClass('data-container') ? target : target.parents('.data-container').first();

   var childrenChecks = elementsTarget.find('input[type="checkbox"]');
   var valueCount = {
      trueCount: 0,
      falseCount: 0,
      isBigger: function () {
         return this.trueCount > this.falseCount ? true : false;
      }
   };
   Array.prototype.forEach.call(childrenChecks, function(currentCheck) {
      var checkStatus = $(currentCheck).prop('checked');
      valueCount[String(checkStatus) + 'Count']++;
   });
   childrenChecks.prop('checked', !valueCount.isBigger());
   
});

$('.close-dialog-box button').on('click', function() {
   let dialogBox = $('.confirm-dialog-box');
   // if confirmMsj === confirmPhrase
      // true --> delete the selected items
      

      // false --> do nothing, or maybe just notify the user
});

$('.close-dialog').on('click', function () {
   $(this).parent().toggleClass('d-none');
   $(this).parent().find('input').val('');
   errorMessage.clearMessage(); 

});

$('.dialog-form').submit(function(evt) {
   var confirmPhrase = 'I AM SURE';
   evt.preventDefault();
   var inputEl = $(evt.target).find('input[type="text"]');

   if(inputEl.val() === confirmPhrase ) {
      deleteSelected();
      // deleteSelectedItems();
   } else {
      errorMessage.changeMessage('unsure');      
   }
   inputEl.val('');

});

function deleteSelected() {
   var   returnObj = {},
         childrenChecks, typeEl, typeValue,
         checkedLength = 0;
   let types = $('[data-name]');
   Array.prototype.forEach.call(types, function(type) {
      typeEl = $(type);
      typeValue = typeEl.attr('data-name');
      returnObj[typeValue] = [];
      childrenChecks = typeEl.find('input[type="checkbox"]:checked');
      Array.prototype.forEach.call(childrenChecks, function(currentCheck) {
         checkedLength++;
         returnObj[typeValue].push(currentCheck.value);
      });
   });
   if(!checkedLength) {
      errorMessage.changeMessage('unselected');  
      return;
   } else {
      $.ajax({
         url: window.location.origin + '/debugging?_method=DELETE',
         method: 'POST',
         data: {items: JSON.stringify(returnObj)},
         success: function() {
            $('.confirm-dialog-box').addClass('d-none');         
            window.location.href = window.location.href;
            errorMessage.clearMessage();
         },
         error: function() {
            errorMessage.changeMessage('requestFailure');
         }
      });
   }
};