// d3
var svg;
var data;
var selectedSubject = 0;
var margin = 60;
var h = 388;
var w = 1040;

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

function updateData() {
  d3.json('http://cpi.cartodb.com/api/v2/sql?q=SELECT%20*%20FROM%20'+metadata.subjects[selectedSubject].table+"%20order%20by%20"+metadata.subjects[selectedSubject].x_axis+"%20&api_key=eca1902cb724e40fdb20fd628b47489b15134d79", function(d) {
    data = d;

    drawData();
  });
}

function drawData() {
  "use strict";

  svg.selectAll("g").remove();

  var x_col = metadata.subjects[selectedSubject].x_axis;

  var x_scale = d3.scale.linear()
    .range([margin,w-margin])
    .domain([1980,2012]);

  var x_axis = d3.svg.axis().scale(x_scale);

  svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + (h-margin) + ")")
  .call(x_axis);

  for (var i = 0; i < metadata.subjects[selectedSubject].series.length; i++) {
    // append one group per series
    var g = svg.append("svg:g");
    var y_col = metadata.subjects[selectedSubject].series[i].column;

    var y_scale = d3.scale.linear()
      .range([h-margin, margin])
      .domain(metadata.subjects[selectedSubject].series[i].y_extent);

    // remove null values
    var data_col = data.rows.filter(function(d) {
      return (d[y_col] != null) && (d[y_col] != 0)
    });

    if (metadata.subjects[selectedSubject].series[i].class == "line") {
      var line = d3.svg.line()
        .x(function(d){return x_scale(d[x_col])})
        .y(function(d){return y_scale(d[y_col])})
        .interpolate("basis");

      g.append("svg:path")
        .attr("d", line(data_col))
        .attr("class","line"+i);

      g.selectAll("circle")
        .data(data_col)
        .enter()
        .append("circle")
        .attr("cx", function(d){return x_scale(d[x_col])})
        .attr("cy", function(d){return y_scale(d[y_col])})
        .attr("r", 5)
        .attr("class", "line"+i);
    }
  }
}

function changeSubject(o) {
  selectedSubject = o.value;
  updateData();
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
    $(window).scrollTo('570px', 500);
  });

  $('.scroll-top').on("click", function() {
    $(window).scrollTo('0px', 500);
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

  // d3
  svg = d3.select(".graph").append("svg").attr("width", w).attr("height", h);
  var subjectSelector = document.getElementById("subjectSelector");

  for (var i = 0; i < metadata.subjects.length; i++) {
    subjectSelector.options[subjectSelector.options.length] = new Option(metadata.subjects[i].name, i);
  }

  updateData();
});
