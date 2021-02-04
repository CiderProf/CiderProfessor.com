$(function(){


$("#gradebook").click( function() {
  $(".gradebook").toggleClass("hide");
});

$("#gradebook ul").click( function(e){
  let $this = e.target.children;
  if($this && $this.length > 0){
    $(e.target.children).toggleClass("hide");    
  }
  $(this).toggleClass("hide");
});

$(".style").click( function() {
  $(this).next().children().toggleClass("hide");
  $(this).parent().toggleClass("hide");
});

$("#complit").click( function() {
  $(".complit").toggleClass("hide");
});

$("#cidreviews").click( function() {
  $(".cidreviews").toggleClass("hide");
});

$("#crgeography").click( function() {
  $(".crgeography").toggleClass("hide");
  $(this).parent().toggleClass("hide");
});


});
