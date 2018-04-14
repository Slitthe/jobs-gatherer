// =========== Server Sent events =================
var es = new EventSource(window.location.origin + '/ssedemo');

es.addEventListener('update', function (evt) {
   var data = evt.data ? JSON.parse(evt.data) : null;
   updateData(data);
});

// handles the live status update 
function updateData(data) {
   var target = $('[data-site="' + data.site + '"]'); // find the site's container
   var targets = [ // the values for the live status for that site
      [target.find('[data-status="keyword"]'), data.query],
      [target.find('[data-status="location"]'), data.place],
      [target.find('[data-status="page"]'), data.page],
   ];

   targets.forEach(function (target) {
      if (target[0].text() !== target[1]) { // only flash/update changed values
         target[0].text(target[1]); // change the actual Text value
         target[0].css('background', 'rgba(173, 173, 255, 0.4)'); // change the background of changes content
         setTimeout(function () { // fade that after a period
            target[0].css('background', 'transparent');
         }, 2000);
      }
   });
}

// running state status update upong recieving a Server Sent Event 'stoppedStatus'
es.addEventListener('stoppedStatus', function (evt) {
   if (evt.data === 'true') {
      $('.state-display .state-text').text('Stopped');
      $('.state-display').removeClass('led-green');
      $('.state-display').addClass('led-red');

   } else {
      $('.state-display .state-text').text('Running');
      $('.state-display').removeClass('led-red');
      $('.state-display').addClass('led-green');
   }
});
// ==================== End of Server Sent Events & Related



// =========== Run state & Input disabling ==========
function disableInputs() { // disables the inputs related to data change when the search service is running
   if (runState.isRunning) {
      $('input, button:not(.close), select').prop('disabled', 'true');
      $('.start-stop  button').prop('disabled', '');

   } else {
      $('input, button, select').prop('disabled', '');
   }
}



// getter and setter for the runState
Object.defineProperty(runState, 'isRunning', {
   get: function () {
      return this.value;
   },
   set: function (value) {
      this.value = value;
      return disableInputs(); // disable/re-enables the input on state change
   }
});
// ======== End of Run state & Input disabling ===============


// ======== DATA modifying add/remove =====================
// add or remove data
function modifyData(thisContext, type, value, add, evt) {
   evt.preventDefault();
   var parent = $(thisContext).parent();
   var sentData = {
      type: type,
      value: value
   };
   let condition = add ? true : !add && window.confirm('Are you sure you want to delete ' + value + 'from the list?') ? true : false;
   if (condition) {
      $.ajax({
         url: window.location.origin + '/update?_method=PUT&add=' + add,
         method: 'POST',
         data: sentData,
         success: function () {
            // if add
            // if delete

            if (add) {
               let appendTarget = $('#' + type),
                  copy = $(appendTarget.children('li').last()[0].outerHTML);

               copy.attr('data-item', value);
               copy.find('.item-text').text(value);
               appendTarget.append(copy);
               $('#value').val('');
            } else {
               parent.remove();
            }

            // do this no matter what
            $('.error-container').addClass('d-none');
         },
         error: function (err) {
            $('.error-container').removeClass('d-none');
            let errorText = {
               alredyRunning: 'The search service must be stopped before making any changes.',
               wrongRequest: 'There was a problem with the request being made.',
               lastItem: 'You cannot delete the last item.'
            };
            if (err.responseText) {
               $('.error-message').text(errorText[err.responseText]);
            }
         }
      });
   }
}

// add
$('.modify-form').submit(function (evt) {
   var type = $(this).find('#name').val();
   var value = $(this).find('#value').val();
   modifyData(
      this,
      type,
      value,
      true,
      evt
   );
});
// remove
$('ul').on('click', '.remove-item', function (evt) {
   var parent = $(this).parent();
   var type = parent.parents('ul').attr('id');
   var value = parent.attr('data-item');
   modifyData(
      this,
      type,
      value,
      false,
      evt
   );
});
// ======== End of -- >DATA modifying add/remove ===========



// starts or stops the search service
function runAction(action) {
   if (action === 'start' || action === 'stop') {
      $.ajax({
         url: window.location.origin + '/runAction',
         type: 'POST',
         data: {
            action: action
         },
         success: function () {
            window.runState.isRunning = action === 'start' ? true : false;
            if (action === 'stop') {
               $('.stop').addClass('active');
               $('.start').removeClass('active');

            } else if (action === 'start') {
               $('.stop').removeClass('active');
               $('.start').addClass('active');
            }
         }
      });
   }
};

// triggers the service stop/start action
$('.stop').on('click', function () {
   runAction('stop');
});
$('.start').on('click', function () {
   runAction('start');
});

// error alert toggler
$('.close').on('click', function () {
   $(this).parent().toggleClass('d-none');
});

disableInputs();