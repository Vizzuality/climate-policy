//= require modernizr-2.6.2.min
//= require jquery
//= require jquery-migrate-min
//= require jquery_ujs
//= require jquery.qtip


$(document).ready(function() {
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
        adjust: { y: -20 }
      },
      show: {
        event: e.type,
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