var Bubbles, root, texts;

root = typeof exports !== "undefined" && exports !== null ? exports : this;

Bubbles = function() {
  var chart, clear, click, collide, collisionPadding, connectEvents, data, force, gravity, hashchange, height, idValue, jitter, label, margin, maxRadius, minCollisionRadius, mouseout, mouseover, node, rScale, rValue, textValue, tick, transformData, update, updateActive, updateLabels, updateNodes, width;
  width = 980;
  height = 510;
  data = [];
  node = null;
  label = null;
  margin = {
    top: 5,
    right: 0,
    bottom: 0,
    left: 0
  };
  //largest size for the bubbles
  maxRadius = 65;
  rScale = d3.scale.sqrt().range([0, maxRadius]);

  //abstracted the data value used to size each into its own function. 
  rValue = function(d) {
    return parseInt(d.count);
  };

  //function to define the 'id' of a data element
  idValue = function(d) {
    return d.name;
  };
  //function to define what to display in each bubble
  textValue = function(d) {
    return d.name;
  };
  //constants to control how collision look and act
  collisionPadding = 4;
  minCollisionRadius = 12;

  //jitter controls the 'jumpiness' of the collisions
  jitter = 0.5;

  //function to get data in the format we need.  
  //currently just get's the count
  transformData = function(rawData) {
    rawData.forEach(function(d) {
      d.count = parseInt(d.count);
      return rawData.sort(function() {
        return 0.5 - Math.random();
      });
    });
    return rawData;
  };

  //tick callback function will be executed for every iteration of the force simulation
  //moves force nodes towards their destinations
  //deals with collisions of force nodes
  //updates visual bubbles to reflect new force node locations

  tick = function(e) {
    var dampenedAlpha;
    dampenedAlpha = e.alpha * 0.1;
    node.each(gravity(dampenedAlpha)).each(collide(jitter)).attr("transform", function(d) {
      return "translate(" + d.x + "," + d.y + ")";
    });
    return label.style("left", function(d) {
      return ((margin.left + d.x) - d.dx / 2) + "px";
    }).style("top", function(d) {
      return ((margin.top + d.y) - d.dy / 2) + "px";
    });
  };

  //The force variable is the force layout controlling the bubbles
  force = d3.layout.force().gravity(0).charge(0).size([width, height]).on("tick", tick);
  
  //Creates new chart function. This is the 'constructor' of our visualization
  chart = function(selection) {
    return selection.each(function(rawData) {
      var maxDomainValue, svg, svgEnter;

      //get data in correct format
      data = transformData(rawData);
	  
	  //setup the radius scale's domain now that
      maxDomainValue = d3.max(data, function(d) {
        return rValue(d);
      });

      rScale.domain([0, maxDomainValue]);
      //setup svg element
      svg = d3.select(this).selectAll("svg").data([data]);
      svgEnter = svg.enter().append("svg");
      svg.attr("width", width + margin.left + margin.right);
      svg.attr("height", height + margin.top + margin.bottom);

      //node will be used to group the bubbles
      node = svgEnter.append("g").attr("id", "bubble-nodes").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      //clickable background rect to clear the current selection
      node.append("rect").attr("id", "bubble-background").attr("width", width).attr("height", height).on("click", clear);
      //label is the container div for all the labels that sit on top of the bubbles
      label = d3.select(this).selectAll("#bubble-labels").data([data]).enter().append("div").attr("id", "bubble-labels");
      update();
      //see if url includes an id already 
      hashchange();
      return d3.select(window).on("hashchange", hashchange);
    });
  };

   //update starts up the force directed layout and then updates the nodes and labels
  update = function() {
    data.forEach(function(d, i) {
      return d.forceR = Math.max(minCollisionRadius, rScale(rValue(d)));
    });
    //start up the force layout
    force.nodes(data).start();
    updateNodes();
    return updateLabels();
  };

  //updateNodes creates a new bubble for each node in our dataset
  updateNodes = function() {
    node = node.selectAll(".bubble-node").data(data, function(d) {
      return idValue(d);
    });
    node.exit().remove();
    return node.enter().append("a").attr("class", "bubble-node").attr("xlink:href", function(d) {
      return "#" + (encodeURIComponent(idValue(d)));
    }).call(force.drag).call(connectEvents).append("circle").attr("r", function(d) {
      return rScale(rValue(d));
    });
  };

  //updateLabels gets the sizing to work well with the font size
  updateLabels = function() {
    var labelEnter;
    label = label.selectAll(".bubble-label").data(data, function(d) {
      return idValue(d);
    });
    label.exit().remove();

    //'abels are anchors with div's inside them
    labelEnter = label.enter().append("a").attr("class", "bubble-label").attr("href", function(d) {
      return "#" + (encodeURIComponent(idValue(d)));
    }).call(force.drag).call(connectEvents);
    labelEnter.append("div").attr("class", "bubble-label-name").text(function(d) {
      return textValue(d);
    });
    labelEnter.append("div").attr("class", "bubble-label-value").text(function(d) {
      return rValue(d);
    });
    //label font size is determined based on the size of the bubble
    //this sizing allows for a bit of overhang outside of the bubble (long words hang outside the bubbles)
    label.style("font-size", function(d) {
      return Math.max(8, rScale(rValue(d) / 2)) + "px";
    }).style("width", function(d) {
      return 2.5 * rScale(rValue(d)) + "px";
    });
    label.append("span").text(function(d) {
      return textValue(d);
    }).each(function(d) {
      return d.dx = Math.max(2.5 * rScale(rValue(d)), this.getBoundingClientRect().width);
    }).remove();
    label.style("width", function(d) {
      return d.dx + "px";
    });
    return label.each(function(d) {
      return d.dy = this.getBoundingClientRect().height;
    });
  };
  //custom gravity to skew the bubble placement
  gravity = function(alpha) {
    var ax, ay, cx, cy;
    cx = width / 2;
    cy = height / 2;
    ax = alpha / 8;
    ay = alpha;
    return function(d) {
      d.x += (cx - d.x) * ax;
      return d.y += (cy - d.y) * ay;
    };
  };
  //custom collision function to prevent nodes from touching
  collide = function(jitter) {
    return function(d) {
      return data.forEach(function(d2) {
        var distance, minDistance, moveX, moveY, x, y;
        if (d !== d2) {
          x = d.x - d2.x;
          y = d.y - d2.y;
          distance = Math.sqrt(x * x + y * y);
          minDistance = d.forceR + d2.forceR + collisionPadding;
          if (distance < minDistance) {
            distance = (distance - minDistance) / distance * jitter;
            moveX = x * distance;
            moveY = y * distance;
            d.x -= moveX;
            d.y -= moveY;
            d2.x += moveX;
            return d2.y += moveY;
          }
        }
      });
    };
  };
  //adds mouse events to element
  connectEvents = function(d) {
    d.on("click", click);
    d.on("mouseover", mouseover);
    return d.on("mouseout", mouseout);
  };
  //clears currently selected bubble
  clear = function() {
    return location.replace("#");
  };
  //changes clicked bubble by modifying url
  click = function(d) {
    location.replace("#" + encodeURIComponent(idValue(d)));
    return d3.event.preventDefault();
  };
  //called when url after the # changes
  hashchange = function() {
    var id;
    id = decodeURIComponent(location.hash.substring(1)).trim();
    return updateActive(id);
  };
  //activates new node
  updateActive = function(id) {
    node.classed("bubble-selected", function(d) {
      return id === idValue(d);
    });
    if (id.length > 0) {
      return d3.select("#status").html("<h3>The word <span class=\"active\">" + id + "</span> is now active</h3>");
    } else {
      return d3.select("#status").html("<h3>No word is active</h3>");
    }
  };
  //hover event
  mouseover = function(d) {
    return node.classed("bubble-hover", function(p) {
      return p === d;
    });
  };
  //remove hover class
  mouseout = function(d) {
    return node.classed("bubble-hover", false);
  };
  //public getter/setter for jitter variable
  chart.jitter = function(_) {
    if (!arguments.length) {
      return jitter;
    }
    jitter = _;
    force.start();
    return chart;
  };
  //public getter/setter for height variable
  chart.height = function(_) {
    if (!arguments.length) {
      return height;
    }
    height = _;
    return chart;
  };
  //public getter/setter for width variable
  chart.width = function(_) {
    if (!arguments.length) {
      return width;
    }
    width = _;
    return chart;
  };
  //public getter/setter for radius function
  chart.r = function(_) {
    if (!arguments.length) {
      return rValue;
    }
    rValue = _;
    return chart;
  };
  //return the chart function we have created
  return chart;
};
//Helper function that simplifies the calling of our chart with it's data and div selector specified
root.plotData = function(selector, data, plot) {
  return d3.select(selector).datum(data).call(plot);
};

texts = [
  {
    key: "dickinson",
    file: "top_dickinson.csv",
    name: "Emily Dickinson"
  }, 
  {
    key: "whitman",
    file: "top_whitman.csv",
    name: "Walt Whitman"
  }
];

//jQuery document ready.
$(function() {
  var display, key, plot, text;
  plot = Bubbles();
  display = function(data) {
  	//console.log(data);
    return plotData("#vis", data, plot);
  };
  key = decodeURIComponent(location.search).replace("?", "");
  text = texts.filter(function(t) {
    return t.key === key;
  })[0];
  if (!text) {
    text = texts[0];
  }
  $("#text-select").val(key);
  d3.select("#jitter").on("input", function() {
    return plot.jitter(parseFloat(this.output.value));
  });
  d3.select("#text-select").on("change", function(e) {
    key = $(this).val();
    location.replace("#");
    return location.search = encodeURIComponent(key);
  });
  d3.select("#book-title").html(text.name);
  return d3.csv("data/" + text.file, display);
});

