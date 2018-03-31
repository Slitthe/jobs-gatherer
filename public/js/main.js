$.ajaxSetup({
   url: window.location.href + '?_method=PUT',
   method: 'POST'
});

$('.func-btns').on('click', '.save-btn', function(){
   let id = $(this).parent().attr('data-id');
   $.ajax({
      data: {type: 'saved', id: id}
   });
});
$('.func-btns').on('click', '.delete-btn', function(){
   let id = $(this).parent().attr('data-id');
   $.ajax({
      data: { type: 'deleted', id: id}
   });
});
$('.func-btns').on('click', '.restore-btn', function(){
   let id = $(this).parent().attr('data-id');
   $.ajax({
      data: { type: 'default', id: id}
   });
});

$('.toggle-hidden-next').on('click', function() {
   $(this).toggleClass('active');
   console.log($(this).next().toggleClass('d-none'));
});
