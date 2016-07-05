/**
 * Created by lucian.crasovan on 15/1/16.
 */
'use strict';

/**
 * helper classes for plotting and logging
 */

function D3Plotter() {

    this.plotTitle = function(solution) {

        var svg = d3.select('body')
            .append('h2');

        var title = 'Solution for SUM = ' + solution.sum + ' // Central number = ' + solution.centralNumber;

        svg.append("text")
            .text(title);
    };

    this.plotHexagon = function (id) {

        var data = [
            {x: 220, y: 50, position: 'A', color: 'white'},
            {x: 320, y: 50, position: 'B', color: 'gray'},
            {x: 420, y: 50, position: 'C', color: 'white'},
            {x: 170, y: 150, position: 'D', color: 'gray'},
            {x: 270, y: 150, position: 'E', color: 'pink'},
            {x: 370, y: 150, position: 'F', color: 'pink'},
            {x: 470, y: 150, position: 'G', color: 'gray'},
            {x: 120, y: 250, position: 'H', color: 'white'},
            {x: 220, y: 250, position: 'I', color: 'pink'},
            {x: 320, y: 250, position: 'J', color: 'yellow'},
            {x: 420, y: 250, position: 'K', color: 'pink'},
            {x: 520, y: 250, position: 'L', color: 'white'},
            {x: 170, y: 350, position: 'M', color: 'gray'},
            {x: 270, y: 350, position: 'N', color: 'pink'},
            {x: 370, y: 350, position: 'O', color: 'pink'},
            {x: 470, y: 350, position: 'P', color: 'gray'},
            {x: 220, y: 450, position: 'Q', color: 'white'},
            {x: 320, y: 450, position: 'R', color: 'gray'},
            {x: 420, y: 450, position: 'S', color: 'white'}
        ];

        var width = 600;
        var height = 600;

        d3.select("body")
            .append(id)
            .append('svg:svg')
            .attr("width", width)
            .attr("height", height)
            .selectAll('.circle')
            .data(data)
            .enter()
            .append("circle")
            .attr("cx", function (d) {
                return d.x;
            })
            .attr("cy", function (d) {
                return d.y;
            })
            .attr("r", 25)
            .style("stroke", "black")
            .style("fill", function(d) {
                return d.color;
            });
    };

    this.plotSolution = function (solution) {
        d3.select("svg")
            .selectAll('text')
            .data(solution)
            .enter()
            .append("text")
            .attr("x", function (d) {
                return d.value > 9 ? d.x - 12 : d.x - 5;
            })
            .attr("y", function (d) {
                return d.y + 6;
            })
            .text(function (d) {
                return d.value;
            })
            .attr("font-family", "sans-serif")
            .attr("font-size", "0px")
            .attr("fill", "blue");

        d3.select("svg")
            .selectAll("text")
            .data(solution)
            .transition()  // Transition from old to new
            .duration(1000)// Length of animation
            .delay(500)
            .each("start", function () {  // Start animation
                d3.select(this)// 'this' means the current element
                    .attr("fill", "red")  // Change color
                    .attr("font-size", 20);  // Change size
            });
    };

    this.formatForPlotting = function(solution){

        /*********************************************
         *
         * vertices: positions 0, 2, 11, 18, 16, 7
         * middle-edges: 1, 6, 15, 17, 12, 3
         * middle-radii: 4, 5, 10, 14, 13, 8
         * center: 9
         *
         ********************************************/

        var vertices = solution.vertices;
        var sum = solution.sum;
        var centralNumber = solution.centralNumber;
        var middleEdgeNumbers = [];
        var firstVertex = vertices[0];
        for(var i=0; i <= vertices.length - 1; i++) {
            if (i != vertices.length - 1) {
                middleEdgeNumbers.push(sum - vertices[i] - vertices[i + 1]);
            } else {
                middleEdgeNumbers.push(sum - vertices[i] - firstVertex);
            }
        }
        var middleRadii = _.map(vertices, function(vertex) {return sum - vertex - centralNumber;});

        return [
            vertices[0],
            middleEdgeNumbers[0],
            vertices[1],
            middleEdgeNumbers[5],
            middleRadii[0],
            middleRadii[1],
            middleEdgeNumbers[1],
            vertices[5],
            middleRadii[5],
            centralNumber,
            middleRadii[2],
            vertices[2],
            middleEdgeNumbers[4],
            middleRadii[4],
            middleRadii[3],
            middleEdgeNumbers[2],
            vertices[4],
            middleEdgeNumbers[3],
            vertices[3]
        ];

    };

    this.plotSolutionWithCenterAndVertices = function (solution, id) {

        var mappedSolution = this.formatForPlotting(solution);

        var hexagonPositions = [
            {x: 220, y: 50, value: 1},
            {x: 320, y: 50, value: 2},
            {x: 420, y: 50, value: 3},
            {x: 170, y: 150, value: 4},
            {x: 270, y: 150, value: 5},
            {x: 370, y: 150, value: 6},
            {x: 470, y: 150, value: 7},
            {x: 120, y: 250, value: 8},
            {x: 220, y: 250, value: 9},
            {x: 320, y: 250, value: 10},
            {x: 420, y: 250, value: 11},
            {x: 520, y: 250, value: 12},
            {x: 170, y: 350, value: 13},
            {x: 270, y: 350, value: 14},
            {x: 370, y: 350, value: 15},
            {x: 470, y: 350, value: 16},
            {x: 220, y: 450, value: 17},
            {x: 320, y: 450, value: 18},
            {x: 420, y: 450, value: 19}
        ];

        _.each(hexagonPositions, function(position, key) {
            position.value = mappedSolution[key];
        });

        d3.select(id).select('svg')
            .selectAll('text')
            .data(hexagonPositions)
            .enter()
            .append("text")
            .attr("x", function (d) {
                return d.value > 9 ? d.x - 12 : d.x - 5;
            })
            .attr("y", function (d) {
                return d.y + 6;
            })
            .text(function (d) {
                return d.value;
            })
            .attr("font-family", "sans-serif")
            .attr("font-size", "20px")
            .attr("fill", "blue");

    };
    
    return this;
}

function Logger() {

    this.logArrayOfObjects = function (data) {

        console.log('Array length:' + data.length);

        _.each(data, function (value) {
            console.log(value);
        })
    };

    this.logArrayOfArrays = function (data) {

        _.each(data, function (value) {
            console.log(value);
        })
    };

    return this;

}

function MathHelper() {

    this.factorials = [];
    this.arrangements = {};

    this.factorial = function (n) {
        if (n == 0 || n == 1) {
            return 1;
        }

        if (this.factorials[n] > 0) {
            return this.factorials[n];
        }

        return this.factorials[n] = this.factorial(n - 1) * n;
    };

    this.getArrangements = function (n, m) {
        var key = '' + n + '_' + m;

        if (m == 1) {
            return this.arrangements[key] = _.map(_.range(0, n), function (val) {
                return [val];
            });
        }

        if (!_.isEmpty(this.arrangements[key])) {
            return this.arrangements[key];
        }

        var newArrangements = [];

        _.each(this.getArrangements(n, m - 1), function (arrangement) {
            var possibleCompletingValues = _.difference(_.range(0, n), arrangement);
            _.each(possibleCompletingValues, function (val) {
                newArrangements.push(_.union(arrangement, [val]));
            });
        });

        return this.arrangements[key] = newArrangements;
    };

    return this;
}