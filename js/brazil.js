var margin = 30;
var h = 388;
var w = 1038;
var subject = [];
var svg = [];


$(document).ready(function() {
  for (var i = 0; i < datasets.sectors[0].subjects.length; i++) {
    subject[i] = datasets.sectors[0].subjects[i];
    svg[i] = d3.select("#"+subject[i].table).append("svg").attr("width", w).attr("height", h);
  }

  d3.json('http://cpi.cartodb.com/api/v2/sql?q=SELECT%20*%20FROM%20'+subject[0].table+"%20order%20by%20"+subject[0].x_axis+"%20&api_key=eca1902cb724e40fdb20fd628b47489b15134d79", function(data0) {
    var x_col = subject[0].x_axis;

    var x_scale = d3.scale.linear()
      .range([margin,w-margin])
      .domain([1980,2012]);

    for (var i = 0; i < subject[0].series.length; i++) {
      // append one group per series
      var g = svg[0].append("svg:g");
      var y_col = subject[0].series[i].column;

      var y_scale = d3.scale.linear()
        .range([h-margin, margin])
        .domain(subject[0].series[i].y_extent);

      // remove null values
      var data_col = data0.rows.filter(function(d) {
        return (d[y_col] != null) && (d[y_col] != 0)
      });

      var line = d3.svg.line()
        .x(function(d){return x_scale(d[x_col])})
        .y(function(d){return y_scale(d[y_col])});

      g.append("svg:path")
        .attr("d", line(data_col));

      g.selectAll("circle")
        .data(data_col)
        .enter()
        .append("circle")
        .attr("cx", function(d){return x_scale(d[x_col])})
        .attr("cy", function(d){return y_scale(d[y_col])})
        .attr("r", 3);
    }
  });

  d3.json('http://cpi.cartodb.com/api/v2/sql?q=SELECT%20*%20FROM%20'+subject[1].table+"%20order%20by%20"+subject[1].x_axis+"%20&api_key=eca1902cb724e40fdb20fd628b47489b15134d79", function(data1) {
    var x_col = subject[1].x_axis;

    var x_scale = d3.time.scale()
      .range([margin,w-margin])
      .domain([new Date('2001-01-01T00:00:00+01:00'), new Date('2010-12-01T00:00:00+01:00')]);

    for (var i = 0; i < subject[1].series.length; i++) {
      // append one group per series
      var g = svg[1].append("svg:g");
      var y_col = subject[1].series[i].column;

      var y_scale = d3.scale.linear()
        .range([h-margin, margin])
        .domain(subject[1].series[i].y_extent);

      // remove null values
      var data_col = data1.rows.filter(function(d) {
        return (d[y_col] != null) && (d[y_col] != 0)
      });

      var line = d3.svg.line()
        .x(function(d){return x_scale(new Date(d[x_col]))})
        .y(function(d){return y_scale(d[y_col])})

      g.append("svg:path")
        .attr("d", line(data_col));

      g.selectAll("circle")
        .data(data_col)
        .enter()
        .append("circle")
        .attr("cx", function(d){return x_scale(new Date(d[x_col]))})
        .attr("cy", function(d){return y_scale(d[y_col])})
        .attr("r", 3);
    }
  });

  d3.json('http://cpi.cartodb.com/api/v2/sql?q=SELECT%20*%20FROM%20'+subject[2].table+"%20order%20by%20"+subject[2].x_axis+"%20&api_key=eca1902cb724e40fdb20fd628b47489b15134d79", function(data2) {
    var x_col = subject[2].x_axis;

    var x_scale = d3.scale.linear()
      .range([margin,w-margin])
      .domain([1980,2012]);

    for (var i = 0; i < subject[2].series.length; i++) {
      // append one group per series
      var g = svg[2].append("svg:g");
      var y_col = subject[2].series[i].column;

      var y_scale = d3.scale.linear()
        .range([h-margin, margin])
        .domain(subject[2].series[i].y_extent);

      // remove null values
      var data_col = data2.rows.filter(function(d) {
        return (d[y_col] != null) && (d[y_col] != 0)
      });

      var line = d3.svg.line()
        .x(function(d){return x_scale(d[x_col])})
        .y(function(d){return y_scale(d[y_col])})

      g.append("svg:path")
        .attr("d", line(data_col));

      g.selectAll("circle")
        .data(data_col)
        .enter()
        .append("circle")
        .attr("cx", function(d){return x_scale(d[x_col])})
        .attr("cy", function(d){return y_scale(d[y_col])})
        .attr("r", 3);
    }
  });

  d3.json('http://cpi.cartodb.com/api/v2/sql?q=SELECT%20*%20FROM%20'+subject[3].table+"%20order%20by%20"+subject[3].x_axis+"%20&api_key=eca1902cb724e40fdb20fd628b47489b15134d79", function(data3) {
    var x_col = subject[3].x_axis;

    var x_scale = d3.scale.linear()
      .range([margin,w-margin])
      .domain([1980,2012]);

    for (var i = 0; i < subject[3].series.length; i++) {
      // append one group per series
      var g = svg[3].append("svg:g");
      var y_col = subject[3].series[i].column;

      var y_scale = d3.scale.linear()
        .range([h-margin, margin])
        .domain(subject[3].series[i].y_extent);

      // remove null values
      var data_col = data3.rows.filter(function(d) {
        return (d[y_col] != null) && (d[y_col] != 0)
      });

      var line = d3.svg.line()
        .x(function(d){return x_scale(d[x_col])})
        .y(function(d){return y_scale(d[y_col])})

      g.append("svg:path")
        .attr("d", line(data_col));

      g.selectAll("circle")
        .data(data_col)
        .enter()
        .append("circle")
        .attr("cx", function(d){return x_scale(d[x_col])})
        .attr("cy", function(d){return y_scale(d[y_col])})
        .attr("r", 3);
    }
  });
});