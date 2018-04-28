// general error message
var errorMessage = 'There was an error while submitting the form, please try again.';

// error alert button hider
$('.close').on('click', function () {
   $(this).parent().toggleClass('d-none');
});

// AJAX form request
$('form').submit(function(evt) {
   evt.preventDefault();
   var valuesList = [];
   // get the checkbox elements (what items to use)
   var valuesEls = $(evt.target).find('input[type="checkbox"]');
   Array.prototype.forEach.call(valuesEls, function(valueEl) {
      // add the checked ones to the list
      if( $(valueEl).prop('checked') ) {
         valuesList.push(valueEl.value);
      }
   });
   $.ajax({
      url: window.location.origin + '/start',
      method: 'POST',
      data: { sites: valuesList }, // send that list
      success: function(res) {
         // redirect to app running home if succesful
         window.location.href = window.location.origin;
      },
      error: function(res) {
         // show error message if not succesful
         $('.error-container').removeClass('d-none');
         $('.error-message').text(errorMessage);
      }
   });
});