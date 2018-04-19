// return the buttons for different types of results (when changing their category)

var btnGroups = function (type) {
   var buttonCreators = function (type, cls, iType, title) {
      var buttonHtml = '<button type="button" class="px-3 btn btn-' + type + ' ' + cls;
      buttonHtml += '" title="' + title + '"> <i class="fa fa-' + iType + '"></i></button>';
   
      return buttonHtml;
   };
   var titles = {
      trash: 'Move this result to the trash area.',
      save: 'Move this result to the saved area.',
      restore: 'Remove this result from the deleted area'
   };
   return {
      saved: (function () {
         return buttonCreators('danger', 'delete-btn', 'trash', titles.trash);
      })(),
      default: (function () {
         return buttonCreators('success', 'save-btn', 'floppy-o', titles.save) + buttonCreators('danger', 'delete-btn', 'trash', titles.trash);
      })(),
      deleted: (function () {
         return buttonCreators('success', 'save-btn', 'floppy-o', titles.save) + buttonCreators('secondary', 'restore-btn', 'undo', titles.restore);
      })()
   };
}();

// Update the length display for each result type and location
var updateCounters = function() {
   var counters = $('.counter');
   Array.prototype.forEach.call(counters, function(counter) {
      var l = $(counter).parents('.list-group-item').nextAll('.result').length;
      $(counter).html(l);
   });
};


// Category Change
function moveCategory(thisContext, targetType) {
   let   id = $(thisContext).parent().attr('data-id'),
         parent = $(thisContext).parents('.list-group-item'),
         location = parent.parents('.list-group').attr('data-location'),
         category = parent.parents('.result-type').attr('data-category');
   $.ajax({
      url: window.location.href + '/' + id + '?_method=PUT',
      data: { type: targetType },
      method: 'POST',
      success: function () {
         parent.find('.btn-group').html(btnGroups[targetType]);
         let target = $('[data-category="' + targetType + '"]' + ' [data-location="' + location + '"]');
         if (target.attr('data-hidden') === 'true') {
            parent.addClass('d-none');
         }
         target.append(parent);
         updateCounters();
      }
   });
}
$('.func-btns').on('click', '.save-btn', function () {
   moveCategory(this, 'saved');
});
$('.func-btns').on('click', '.delete-btn', function(){
   moveCategory(this, 'deleted');
});
$('.func-btns').on('click', '.restore-btn', function () {
   moveCategory(this, 'default');
});

// Hidden toggler
$('.toggle-hidden-next').on('click', function() {
   hideValues(this);
});

function hideValues(thisContext) {
   let parent = $(thisContext).parents('[data-hidden]');
   var hiddenValue = JSON.parse( parent.attr('data-hidden') );

   if (hiddenValue) {
      $(thisContext).parents('li').nextAll('li').removeClass('d-none');
      parent.attr('data-hidden', 'false');
   } else {
      $(thisContext).parents('li').nextAll('li').addClass('d-none');
      parent.attr('data-hidden', 'true');
   }
}