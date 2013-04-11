//= require modernizr-2.6.2.min
//= require jquery
//= require jquery-migrate-1.1.1
//= require jquery_ujs
//= require jquery_ujs
//= require underscore
//= require jquery.scrollTo
//= require jquery.qtip
//= require d3.v3


function positionScroll() {
  // stuck scroll link to bottom of viewport or header
  if($(window).scrollTop() + $(window).height() > $(".header").height()) {
    $(".scroll").css("position", "absolute");
  } else {
    $(".scroll").css("position", "fixed");
  }

  // if scrolledup remove stuck header before
  if($(window).scrollTop() >= 570){
    $(".wrapper").addClass("stuck");
  } else {
    $(".wrapper").removeClass("stuck");
  }
}

$(document).ready(function() {
  // position scroll link on load
  positionScroll();

  // position scroll link on scroll and resize
  $(window)
    .scroll(positionScroll)
    .resize(positionScroll)

  // dropdowns
  $('.dropdown_link').on('click', function(e) {
    e.preventDefault();

    var self = $(this);

    self.qtip({
      overwrite: false,
      content: {
        text: self.next('.navbar_dropdown')
      },
      position: {
        my: 'top center',
        at: 'bottom center',
        adjust: { y: -10 }
      },
      show: {
        event: event.type,
        ready: true,
        effect: function() {
          $(this).show().css('opacity', '0').animate({ opacity: 1 }, { duration: 100 });
        }
      },
      hide: {
        event: 'unfocus click',
        effect: function() {
          $(this).animate({ opacity: 0, "top": "+=10px" }, { duration: 100 });
        }
      },
      style: {
        classes: 'tooltip_dropdown',
        tip: { width: 14, height: 6, corner: 'top center',  mimic: 'center' }
      }
    });
  });
});