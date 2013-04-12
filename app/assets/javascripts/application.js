//= require modernizr-2.6.2.min
//= require jquery
//= require jquery-migrate-1.1.1
//= require jquery_ujs
//= require jquery_ujs
//= require underscore
//= require jquery.scrollTo
//= require jquery.qtip
//= require d3.v3


function animateSliders() {
  // Adjusting decades description height on load
  $('.slides').animate({
    height: $("#slide1").height()+80,
  });
}

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
  // animate sliders
  animateSliders();

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

  // nav links
  $('body').on('ajax:success', 'a[data-remote=true]', function(e, data){
    window.history.pushState('', '', $(e.target).attr('href'));
    $($(this).data('replace')).html(data);

    // animate sliders
    animateSliders();

    if($(window).scrollTop() != '570') {
      $(window).scrollTo('570px', 500, {axis:'y'}); 
    }
  });

  // nav links
  $('body').on('click', '.scroll-nav .scroll-controls, .menu-item a', function(){
    var tab = "#"+$(this).attr('data-rel');
    console.log(!$(tab).hasClass('selected'));

    if(!$(tab).hasClass('selected')) {
      $(".menu-item a").removeClass('selected')
      $(tab).addClass('selected')
    }

    $(window).scrollTo('570px', 500, {axis:'y'});
  });

  $('body').on('click', '.scroll-top, .nav-link', function(){
    $(window).scrollTo('570px', 500, {axis:'y'});
  });

  $('body').on('click', '.nav-title a', function(e){
    e.preventDefault();

    $(window).scrollTo('0px', 500, {axis:'y'});
  });

  // graph dropdowns
  $('body').on('click', '.graph-link', function(e) {
    e.preventDefault();

    var self = $(this);

    self.qtip({
      overwrite: false,
      content: {
        text: $(this).closest(".graph-selector").find('.graph_dropdown')
      },
      position: {
        my: 'top left',
        at: 'top left',
        adjust: { y: -6, x: -20 }
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

  $('body').on('click', '.graph_dropdown a', function(e) {
    var graph = $('#'+$(this).attr('data-rel'));
    var desc = $('.'+$(this).attr('data-rel'));

    e.preventDefault();
    $('.graph_tooltip_dropdown').hide();

    if(graph.not(':visible')) {
      graph.siblings('.graph-selector').find('.graph-link').text(this.text);
      graph.siblings('.graph-canvas').hide();
      graph.fadeIn();

      if(graph.is('.graph-canvas-bars')) {
        graph.closest('.graph').removeClass('graph-line');
        graph.closest('.graph').addClass('graph-bars');
        graph.siblings('.graph-selector').removeClass('graph-selector-line');
        graph.siblings('.graph-selector').addClass('graph-selector-bars');
      } else {
        graph.closest('.graph').addClass('graph-line');
        graph.closest('.graph').removeClass('graph-bars');
        graph.siblings('.graph-selector').addClass('graph-selector-line');
        graph.siblings('.graph-selector').removeClass('graph-selector-bars');
      }

      //Overlay
      d3.selectAll(".graph-selector-line")
        .on("mouseover", function() {
          d3.selectAll(".overlay-line").style("visibility", "visible");
          d3.selectAll(".year_marker").style("visibility", "visible");
        })
        .on("mousemove", moveOverlayLine)
        .on("mouseout", function() {
          d3.selectAll(".overlay-line").style("visibility", "hidden");
          d3.selectAll(".year_marker").style("visibility", "hidden");
        })

      d3.selectAll(".graph-line")
        .on("mouseover", function() {
          d3.selectAll(".overlay-line").style("visibility", "visible");
          d3.selectAll(".year_marker").style("visibility", "visible");
        })
        .on("mousemove", moveOverlayLine)
        .on("mouseout", function() {
          d3.selectAll(".overlay-line").style("visibility", "hidden");
          d3.selectAll(".year_marker").style("visibility", "hidden");
        })

      d3.selectAll(".graph-selector-bars")
        .on("mouseover", function() {
          d3.selectAll(".overlay-line").style("visibility", "hidden");
          d3.selectAll(".year_marker").style("visibility", "hidden");
        })
        .on("mousemove", function() {
          d3.selectAll(".overlay-line").style("visibility", "hidden");
          d3.selectAll(".year_marker").style("visibility", "hidden");
        })

      d3.selectAll(".graph-bars")
        .on("mouseover", function() {
          d3.selectAll(".overlay-line").style("visibility", "hidden");
          d3.selectAll(".year_marker").style("visibility", "hidden");
        })
        .on("mousemove", function() {
          d3.selectAll(".overlay-line").style("visibility", "hidden");
          d3.selectAll(".year_marker").style("visibility", "hidden");
        })

      if(desc.text() != desc.siblings('.graph-description:visible').text()) {
        desc.siblings('.graph-description').hide();
        desc.fadeIn();
      }
    }
  });

  // decades description slider
  $('body').on('click', '.tabs a', function(e) {
    var slide = "#"+$(this).attr('data-rel');
    e.preventDefault();

    if(!$(this).hasClass('selected')) {
      $(this).closest('li')
        .addClass('selected')
        .siblings().removeClass('selected');

      $('.slides').animate({
        height: $(slide).height()+80,
        scrollLeft: $(slide).index() * ($(slide).width()+80)
      });
    }
  });
});