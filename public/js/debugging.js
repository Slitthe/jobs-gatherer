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


$('.confirm-dialog-box button').on('click', function(evt) {
   evt.preventDefault();
   var target = $(this.target);
   target.find()
   var inputValue = target.find('input[type="text"]').val();
   dialogConfirm(inputValue);
});

$('.destructor').on('click', function(evt) {
   let confirmPhrase = 'I AM SURE';
   let confirmMsj = 'Please type <span class="text-bold">"' + confirmPhrase + '"</span> to delete the selected items';
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
});

