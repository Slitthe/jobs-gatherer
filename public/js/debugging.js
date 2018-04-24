$('.data-container').on('click', function(evt) {
   
   if(evt.target !== evt.currentTarget) return;
   let target = $(evt.target);
   let childrenChecks = target.find('input[type="checkbox"]');
   let valueCount = {
      trueCount: 0,
      falseCount: 0,
      isBigger: function () {
         return this.trueCount > this.falseCount ? true : false;
      }
   };
   Array.prototype.forEach.call(childrenChecks, function(currentCheck) {
      let checkStatus = $(currentCheck).prop('checked');
      valueCount[String(checkStatus) + 'Count']++;
   });
   childrenChecks.prop('checked', !valueCount.isBigger());
});



$('.destructor').on('click', function(evt) {
   var   dialogBox = $('.confirm-dialog-box'),
         confirmPhrase = 'I AM SURE',
         confirmMsj = 'Please type <span class="text-bold">"' + confirmPhrase + '"</span> to delete the selected items';
   dialogBox.removeClass('d-none');
   dialogBox.find('.dialog-text').html(confirmMsj);
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

});

$('.dialog-form').submit(function(evt) {
   var confirmPhrase = 'I AM SURE';
   console.log('yay');
   evt.preventDefault();
   var inputEl = $(evt.target).find('input[type="text"]');

   if(inputEl.val() === confirmPhrase ) {
      $('.confirm-dialog-box').addClass('d-none');
      // deleteSelectedItems();
   } else {
      console.log('Its not a match');
   }
   inputEl.val('');
   deleteSelected();

});

function deleteSelected() {
   var returnObj = {};
   let types = $('[data-name]');
   Array.prototype.forEach.call(types, function(type) {
      let typeEl = $(type);
      let typeValue = typeEl.attr('data-name');
      returnObj[typeValue] = [];
      let childrenChecks = typeEl.find('input[type="checkbox"]:checked');
      Array.prototype.forEach.call(childrenChecks, function(currentCheck) {
         returnObj[typeValue].push(currentCheck.value);
      });

   });
   $.ajax({
      url: window.location.origin + '/debugging?_method=DELETE',
      method: 'POST',
      data: {deleteList: returnObj},
      success: function() {
         window.location.href = window.location.href;
      },
      error: function() {
         console.log('Something went wrong');
      }
   });
};