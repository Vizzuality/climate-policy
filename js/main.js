function positionScroll() {
  // stuck scroll link to bottom of viewport or header
  if($(window).scrollTop() + $(window).height() > $(".header").height()) {
    $(".scroll").css("position", "absolute");
  } else {
    $(".scroll").css("position", "fixed");
  }

  // if scrolledup remove stuck header before
  if($(".header").hasClass("scrolledup")){
    if($(window).scrollTop() >= 480){
      $(".header").addClass("stuck");
    } else {
      $(".header").removeClass("stuck");
    }
  } else {
    if($(window).scrollTop() >= 570){
      $(".header").addClass("stuck");
    } else {
      $(".header").removeClass("stuck");
    }
  }
}

$(document).ready(function() {
  // position scroll link on load
  positionScroll();

  // detect scroll direction
  var previousScroll = $(window).scrollTop();
  $(window).scroll(function() {
    var currentScroll = $(window).scrollTop();
    if(currentScroll < previousScroll) {
      // if stuck header and prevent bounce in the bottom
      if($(window).scrollTop() >= 570 && ($(window).scrollTop() + $(window).height() < $(document).height())) {
        $(".header").addClass("scrolledup");
      }
    } else {
      $(".header").removeClass("scrolledup");
    }
    previousScroll = currentScroll;
  });

  // position scroll link on scroll and resize
  $(window)
    .scroll(positionScroll)
    .resize(positionScroll)

  $('.nav-link').on("click", function() {
    $(window).scrollTo('570px', 500, {axis:'y'});
  });

  $('.scroll-top').on("click", function() {
    $(window).scrollTo('0px', 500, {axis:'y'});
  });

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
          $(this).show().css('opacity', '0').animate({ opacity: 1, "top": "-=10px" }, { duration: 100 });
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

  // graph dropdowns
  $('.graph-link').on('click', function(e) {
    e.preventDefault();

    var self = $(this);

    self.qtip({
      overwrite: false,
      content: {
        text: $(this).closest(".graph-legend").find('.graph_dropdown')
      },
      position: {
        my: 'top left',
        at: 'top left',
        adjust: { y: -8, x: -20 }
      },
      show: {
        event: event.type,
        ready: true,
        effect: function() {
          $(this).show().css('opacity', '0').animate({ opacity: 1, "top": "-=10px" }, { duration: 100 });
        }
      },
      hide: {
        event: 'unfocus click',
        effect: function() {
          $(this).animate({ opacity: 0, "top": "+=10px" }, { duration: 100 });
        }
      },
      style: {
        classes: 'graph_tooltip_dropdown',
        tip: false
      }
    });
  });

  $('.graph_dropdown').on('click', 'a', function(e) {
    var graph = $('#'+$(this).attr('data-rel'));

    e.preventDefault();

    if(graph.not(':visible')) {
      graph.siblings('.graph-canvas').hide();
      graph.show();
    }
  });

  // slider
  $('.tabs').on('click', 'a', function(e) {
    var slide = "#"+$(this).attr('data-rel');

    e.preventDefault();

    if(!$(this).hasClass('selected')) {
      $(this).closest('li')
        .addClass('selected')
        .siblings().removeClass('selected');

      $('.slides').scrollTo(slide, 500, {axis:'x'});
    }
  });
});
