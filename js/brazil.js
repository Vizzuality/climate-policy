var margin = 30;
var h = 388;
var w = 1038;
var subject = [];
var svg = [];

var LINE_DOT_R = 4;
var STD_DOMAIN = [new Date('1980'),new Date('2012')];


$(document).ready(function() {
  for (var i = 0; i < datasets.sectors[0].subjects.length; i++) {
    subject[i] = datasets.sectors[0].subjects[i];
    svg[i] = d3.select("#"+subject[i].table).append("svg").attr("width", w).attr("height", h);
  }

  console.log(subject);
  drawLineChart(0,STD_DOMAIN);

  function drawLineChart(index,domain){

    d3.json('http://cpi.cartodb.com/api/v2/sql?q=SELECT%20*%20FROM%20'+subject[index].table+"%20order%20by%20"+subject[index].x_axis+"%20&api_key=eca1902cb724e40fdb20fd628b47489b15134d79", function(data) {
    
    var _data = data;

      //AVOID UNNECESSARY CALLS WHEN DOMAIN IS DEFINED & FIX STD_DOMAIN
      d3.json('http://cpi.cartodb.com/api/v2/sql?q=SELECT%20min(date_processed)%20as%20min,%20max(date_processed)%20as%20max%20FROM%20'+subject[index].table+'&api_key=eca1902cb724e40fdb20fd628b47489b15134d79', function(data) {
        if(domain === undefined){
          _domain = [new Date(data.rows[0].min),new Date(data.rows[0].max)];
        }else{
          _domain = domain;
        }

        var x_col = subject[index].x_axis;

        var x_scale = d3.scale.linear()
          .range([margin,w-margin])
          .domain(_domain);
          

        for (var i = 0; i < subject[index].series.length; i++) {
          // append one group per series
          var g = svg[index].append("svg:g");
          var y_col = subject[index].series[i].column;

          var y_scale = d3.scale.linear()
            .range([h-margin, margin])
            .domain(subject[index].series[i].y_extent);

          // remove null values
          var data_col = _data.rows.filter(function(d) {
            return (d[y_col] != null) && (d[y_col] != 0)
          });

          var line = d3.svg.line()
            .x(function(d){return x_scale(new Date(d[x_col]))})
            .y(function(d){return y_scale(d[y_col])});

          g.append("svg:path")
            .attr("d", line(data_col))
            .attr("class", 'lineStyle');

          g.selectAll("circle")
            .data(data_col)
            .enter()
            .append("circle")
            .attr("class", 'linedot')
            .attr("cx", function(d){return x_scale(new Date(d[x_col]))})
            .attr("cy", function(d){return y_scale(d[y_col])})
            .attr("r", LINE_DOT_R);
        }
      });
    });
  }

  drawLineChart(1);
  drawLineChart(2, STD_DOMAIN);
  drawLineChart(3, STD_DOMAIN);

});