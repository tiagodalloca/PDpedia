function goToByScroll(id){
      // Remove "link" from the ID
    id = id.replace("link", "");
      // Scroll
    $('html,body').animate({
        scrollTop: $("#"+id).offset().top},
        'slow');
}

$("a").click(function(e) {
      // Prevent a page reload when a link is pressed
    e.preventDefault();
      // Call the scroll function
    goToByScroll(this.id);
});
