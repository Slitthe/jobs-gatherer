var errorMessage = 'There was an error while submitting the form, please try again.';
// error alert button hider
$('.close').on('click', function () {
   $(this).parent().toggleClass('d-none');
});

// AJAX form request
$('form').submit(function(evt) {
   evt.preventDefault();
   var valuesList = [];
   // get the checkbox elements
   var valuesEls = $(evt.target).find('input[type="checkbox"]');
   Array.prototype.forEach.call(valuesEls, function(valueEl) {
      // loop and add them only if they are checked
      if($(valueEl).prop('checked')) {
         valuesList.push(valueEl.value);
      }
   });
   $.ajax({
      url: window.location.origin + '/start',
      method: 'POST',
      data: {
         sites: valuesList
      },
      success: function(res) {
         // redirect to home if succesful
         window.location.href = window.location.origin;
      },
      error: function(res) {
         // show error message if not succesful
         $('.error-container').removeClass('d-none');
         $('.error-message').text(errorMessage);
      }
   });
});