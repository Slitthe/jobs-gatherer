// creates appropiate buttons depending on the item's category ('saved', 'default', 'deleted')
var btnGroups = function (type) {
   // single button 'template'
   var buttonCreators = function (type, cls, iType, title) {
      var buttonHtml = '<button type="button" class="px-3 btn btn-' + type + ' ' + cls;
      buttonHtml += '" title="' + title + '"> <i class="fa fa-' + iType + '"></i></button>';

      return buttonHtml;
   };

   // HTML 'title' attributes
   var titles = {
      trash: 'Move this result to the trash area.',
      save: 'Move this result to the saved area.',
      restore: 'Remove this result from the deleted area'
   };

   // combine the above variables to create the inner contents of a button group
   return {
      saved: buttonCreators('danger', 'delete-btn', 'trash', titles.trash),
      default: buttonCreators('success', 'save-btn', 'floppy-o', titles.save) + buttonCreators('danger', 'delete-btn', 'trash', titles.trash),
      deleted: buttonCreators('success', 'save-btn', 'floppy-o', titles.save) + buttonCreators('secondary', 'restore-btn', 'undo', titles.restore)
   };
}();

//  =====================  Location/Category items length update
var updateCounters = function() {
   var counters = $('.counter');
   Array.prototype.forEach.call(counters, function(counter) {
      // gets the length of all proceeding list items of the counter list item
      var l = $(counter).parents('.list-group-item').nextAll('.result').length;
      $(counter).html(l);
   });
};


// ===================== Category Change
function moveCategory(thisContext, targetType) {
   // get data about the item
   let   id = $(thisContext).parent().attr('data-id'),
         parent = $(thisContext).parents('.list-group-item'),
         location = parent.parents('.list-group').attr('data-location'),
         category = parent.parents('.result-type').attr('data-category');
   $.ajax({
      url: window.location.href + '/' + id + '?_method=PUT',
      data: { type: targetType }, // use that data in the request
      method: 'POST',
      success: function () {
         // move the item to the target element, but only the request has returned succesful
         parent.find('.btn-group').html(btnGroups[targetType]);
         let target = $('[data-category="' + targetType + '"]' + ' [data-location="' + location + '"]');
         if (target.attr('data-hidden') === 'true') { // hide the newly added item if the target also has its elements hidden
            parent.addClass('d-none');
         }
         target.append(parent);
         updateCounters();
      }
   });
}
   // use the move category function in the event listeners for the three category types
$('.func-btns').on('click', '.save-btn', function () {
   moveCategory(this, 'saved');
});
$('.func-btns').on('click', '.delete-btn', function(){
   moveCategory(this, 'deleted');
});
$('.func-btns').on('click', '.restore-btn', function () {
   moveCategory(this, 'default');
});

// ===================== Hidden toggler
   // items show/hide toggler
function hideValues(thisContext) {
   let parent = $(thisContext).parents('[data-hidden]');
   var hiddenValue = JSON.parse(parent.attr('data-hidden'));

   if (hiddenValue) {
      $(thisContext).parents('li').nextAll('li').removeClass('d-none');
      parent.attr('data-hidden', 'false');
   } else {
      $(thisContext).parents('li').nextAll('li').addClass('d-none');
      parent.attr('data-hidden', 'true');
   }
}

$('.toggle-hidden-next').on('click', function() {
   hideValues(this);
});

