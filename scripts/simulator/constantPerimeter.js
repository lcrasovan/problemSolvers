/**
 * Created by lucian.crasovan on 15/1/16.
 */
'use strict';

function TwelveStickSolver(stickNumber) {

    this.stickNumber = stickNumber;
    this.points = [];
    this.directions = [];
    this.sum = {sx: 0, sy: 0};
    this.moves = 0;
    this.solutions = [];
    this.solutionGroups = {};
    this.vectors = {
        1: {x: 0, y: -1},
        2: {x: 1, y: 0},
        3: {x: 0, y: 1},
        4: {x: -1, y: 0}
    };
    this.startingPoint = {x: 12, y: 12};

    this.getFirstPoint = function () {
        var nx = this.startingPoint.x;
        var ny = this.startingPoint.y - 1;
        return {x: nx, y: ny};
    };

    this.points.push(this.startingPoint);
    var firstPoint = this.getFirstPoint();
    this.points.push(firstPoint);

    this.directions.push(1);

    this.init = function () {
        this.numberSolutions = 0;
    };

    this.calculateSum = function () {
        var pp = this.points;
        for (var p in pp) {
            this.sum.sx += pp[p].x - this.startingPoint.x;
            this.sum.sy += pp[p].y - this.startingPoint.y;
        }
    };

    /*
     *   moveAhead
     *   - try to move ahead along the direction dir
     *   - returns true if possible and false otherwise
     */
    this.moveAhead = function (dir) {
        if (this.directions.length > 0) {
            var lastDir = this.directions[this.directions.length - 1];
            if ((Math.abs(dir - lastDir) % 2 !== 0 && dir !== lastDir) || dir === lastDir) {
                var currentPoint = this.points[this.points.length - 1];
                var np = {x: this.vectors[dir].x + currentPoint.x, y: this.vectors[dir].y + currentPoint.y};
                if (this.points.length < this.stickNumber) {
                    if (!this.containsPoint(np, this.points)) {
                        this.addPoint(np, dir);
                        this.moves++;
                        return true;
                    }
                } else {
                    this.addPoint(np, dir);
                    this.moves++;
                    return true;
                }
            }
        }
        return false;
    };


    this.containsPoint = function (obj, list) {
        var i;
        for (i = 0; i < list.length; i++) {
            if (list[i].x == obj.x && list[i].y == obj.y) {
                return true;
            }
        }
        return false;
    };


    /*
     * Backtracking strategy
     * Remove current point and rotate the vector for the next move
     *
     * If the vector cannot be rotated more (current position is 4)
     *     - make another step back (remove current point and ask for the last orientation vector)
     *
     * If the vector can be rotated, return the new moving direction
     */
    this.backTrack = function () {
        //cannot go back if the length is less than 1
        if (this.directions.length == 1)return 0;

        var currDir = this.directions[this.directions.length - 1];

        if (currDir < Object.keys(this.vectors).length) {
            this.removePoint(currDir);
            return currDir + 1;
        } else {
            this.removePoint(currDir);
            return this.backTrack();
        }
    };

    this.getSolutionInfo = function (directions) {
        var dirs = {1: 0, 2: 0, 3: 0, 4: 0};
        var edges = [];
        var nrEdges = 0;
        var ip = 0;
        var oldD = 0;
        var firstD = 1;
        var signature = "";

        for (var d in directions) {
            var dd = directions[d];
            if (dd != oldD) {
                nrEdges++;
                edges[nrEdges - 1] = 1;
            } else {
                edges[nrEdges - 1]++;
            }
            if (ip == this.stickNumber - 1) {
                if (dd == firstD) {
                    nrEdges--;
                    edges[0] += edges[edges.length - 1];
                    edges.pop();
                }
            }
            oldD = dd;
            dirs[directions[d]]++;
            ip++;
        }
        signature += "" + nrEdges + "" + Math.max(dirs[1], dirs[2], dirs[3], dirs[4]) + "";
        var strEdges = edges.join("");
        var strDirs = directions.join("");
        var arrEdges = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0};
        for (var e = 0; e < edges.length; e++) {
            arrEdges[edges[e]]++;
        }
        var strEdges2 = arrEdges[1] + "-" + arrEdges[2] + "-" + arrEdges[3] + "-" + arrEdges[4] + "-" + arrEdges[5];

        return {sign: signature, sides: strEdges, dirs: strDirs, stat: strEdges2};

    };

    this.areStrongEquivalent = function (sol1, sol2) {
        return ((sol1.sign == sol2.sign) && (sol1.stat == sol2.stat));
    };

    this.areMaybeEquivalent = function (sol1, sol2) {
        return ((sol1.sign == sol2.sign) && (sol1.sides == sol2.sides));
    };

    this.isNewSolution = function (sol) {
        var sInfo = this.getSolutionInfo(sol);
        for (var s in this.solutions) {
            if (this.areStrongEquivalent(sInfo, this.solutions[s]))return false;
        }
        return true;
    };

    this.isNewPossibleSolution = function (sol) {
        var sInfo = this.getSolutionInfo(sol);
        for (var s in this.solutions) {
            if (this.areMaybeEquivalent(sInfo, this.solutions[s])) {
                if (this.solutionGroups[this.solutions[s]["sign"] + this.solutions[s]["stat"] + this.solutions[s]["sides"]] != undefined) {
                    this.solutionGroups[this.solutions[s]["sign"] + this.solutions[s]["stat"] + this.solutions[s]["sides"]].push(sInfo);
                } else {
                    this.solutionGroups[this.solutions[s]["sign"] + this.solutions[s]["stat"] + this.solutions[s]["sides"]] = [sInfo];
                }
                return false;
            }
        }
        return true;
    };

    this.find = function () {
        var self = this;
        var startDir = 1,
            plotter = new D3Plotter();

        while (self.points.length < self.stickNumber + 2 && startDir > 0) {
            if (self.points.length < self.stickNumber + 1) {
                var movedAhead = false;
                for (var i = startDir; i <= Object.keys(self.vectors).length; i++) {
                    if (self.moveAhead(i)) {
                        movedAhead = true;
                        startDir = 1;
                        break;
                    }
                }
                if (!movedAhead) {
                    startDir = self.backTrack();
                }
            } else {
                if (self.isClosedShape()) {
                    console.log('is closed chape ....');
                    if (self.isNewSolution(self.directions)) {
                        self.numberSolutions++;
                        console.log(" ----- Solution #" + self.numberSolutions + " found -------");
                        self.solutions.push(self.getSolutionInfo(self.directions));
                        plotter.plotContour(self.directions, 'sol-' + self.numberSolutions, self.stickNumber);
                        console.log(self.getSolutionInfo(self.directions));
                        console.log(" --------------------");
                    } else if (self.isNewPossibleSolution(self.directions)) {
                        console.log("Possible equivalent solution found!");
                    }
                    startDir = self.backTrack();
                } else {
                    startDir = self.backTrack();
                }
            }
        }

        for (var s in self.solutionGroups) {
            console.log(" ----- Solution Group " + s + "  -------");
            for (var ip in self.solutionGroups[s]) {
                console.log("Solution vectors: " + self.solutionGroups[s][ip]["dirs"]);
            }
            console.log(" --------------------");
        }
    };

    this.addPoint = function (newPoint, newDir) {
        this.points.push(newPoint);
        this.directions.push(newDir);
        this.sum.sx += this.vectors[newDir].x;
        this.sum.sy += this.vectors[newDir].y;
    };

    this.removePoint = function (dir) {
        this.points.pop();
        this.directions.pop();
        this.sum.sx -= this.vectors[dir].x;
        this.sum.sy -= this.vectors[dir].y;
    };

    this.isClosedShape = function () {
        return this.points[this.points.length - 1].x == this.startingPoint.x &&
            this.points[this.points.length - 1].y == this.startingPoint.y;
    };

    this.start = function () {
        this.init();
        this.calculateSum();
        this.find();
    };

    return this;
};

function launch12StickSimulation(perimeter) {
    var solver = new TwelveStickSolver(perimeter);
    solver.start();
}