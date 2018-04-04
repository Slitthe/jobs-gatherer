var buttonCreators = function (type, cls, iType) {
   var buttonHtml = '<button type="button" class="px-3 btn btn-' + type + ' ' + cls;
   buttonHtml += '"> <i class="fa fa-' + iType + '"></i></button>'

   return buttonHtml;
};

var btnGroups = function(type) {
   return {
      saved: (function () {
         return buttonCreators('danger', 'delete-btn', 'trash');
      })(),
      default: (function () {
         return buttonCreators('success', 'save-btn', 'floppy-o') + buttonCreators('danger', 'delete-btn', 'trash');
      })(),
      deleted: (function () {
         return buttonCreators('success', 'save-btn', 'floppy-o') + buttonCreators('secondary', 'restore-btn', 'undo');
      })()
   };
}();

var updateCounters = function() {
   var counters = $('.counter');
   Array.prototype.forEach.call(counters, function(counter) {
      
      var l = $(counter).parents('.list-group-item').nextAll('.list-group-item').length;
      $(counter).html(l);
      
   });
};

$.ajaxSetup({
   url: window.location.href + '?_method=PUT',
   method: 'POST'
});



// Save functionality
$('.func-btns').on('click', '.save-btn', function () {
   let id = $(this).parent().attr('data-id');
   let parent = $(this).parents('.list-group-item');
   let city = parent.parents('.list-group').attr('data-city');
   let category = parent.parents('.result-type').attr('data-category');
   $.ajax({
      data: { type: 'saved', id: id },
      success: function () {
         parent.find('.btn-group').html(btnGroups.saved);
         let target = $('[data-category="saved"]' + ' [data-city="' + city + '"]');
         target.append(parent);
         updateCounters();

      },
      error: function () {
         console.log('Saving error');
      }
   });
});

// Delete functionality
$('.func-btns').on('click', '.delete-btn', function(){
   let id = $(this).parent().attr('data-id');
   let parent = $(this).parents('.list-group-item');
   let city = parent.parents('.list-group').attr('data-city');
   let category = parent.parents('.result-type').attr('data-category');
   $.ajax({
      data: { type: 'deleted', id: id},
      success: function() { 
         parent.find('.btn-group').html(btnGroups.deleted);


         let target = $('[data-category="deleted"]' + ' [data-city="' + city + '"]');
         target.append(parent);
         updateCounters();
         
         
      },
      error: function() {
         console.log('Deletion error');
      }
   });
});




// $('.list-group-item').on('mouseover', function(evt){
//    console.log(this);
//    this.focus();
// });


// Restore
$('.func-btns').on('click', '.restore-btn', function () {
   let id = $(this).parent().attr('data-id');
   let parent = $(this).parents('.list-group-item');
   let city = parent.parents('.list-group').attr('data-city');
   let category = parent.parents('.result-type').attr('data-category');
   $.ajax({
      data: { type: 'default', id: id },
      success: function () {
         parent.find('.btn-group').html(btnGroups.default);

         let target = $('[data-category="default"]' + ' [data-city="' + city + '"]');
         target.append(parent);
         updateCounters();
         

      },
      error: function () {
      }
   });
});

// Hidden toggler
$('.toggle-hidden-next').on('click', function() {
   $(this).next().toggleClass('d-none');
});






/* 

<li class="list-group-item row position-relative">
   <a class="col-xs-8 result-item" href="https://www.ejobs.ro/user/locuri-de-munca/qa-engineer/1024800" target="_blank">
                        QA Engineer
         </a>
      <div class="position-absolute btn-group func-btns" role="group" aria-label="Basic example" data-id="5ac21ae437d7c01b02cacacd">
         <button type="button" class="px-3 btn btn-success save-btn" title="Save listing">
            <i class="fa fa-floppy-o"></i>
         </button>

         <button type="button" class="px-3 btn btn-secondary restore-btn" title="Delete listing">
            <i class="fa fa-undo"></i>
         </button>
   </div>

*/