'use strict';

/**
 * this solves the problem of the magic hexagon
 * such that the sum of each edge in the construction equals the same amount
 *
 * solutions for sum 22 is
 *
 *          1   18   3
 *
 *      14   19    17    15
 *
 *   7    13     2     16     4
 *
 *      6     11    12    10
 *
 *         9     5     8
 *
 *
 *
 *
 *
 * equivalent - computational formulation
 *
 *    Find twelve combinations such that:
 *
 *    1 number appears 6 times
 *    6 numbers appear 3 times and the other
 *    12 numbers appear only once
 *
 * @returns {SolutionFinder}
 * @constructor
 */
function MagicHexagonSolutionFinder(sum) {

    this.edgeSum = sum;
    this.maxNumber = 19;
    this.numbers = _.range(1, this.maxNumber + 1);

    this.getMiddleEdgeNumbers = function(radialCombinations) {
        var middleEdgeNumbers = [];
        var vertices = _.map(radialCombinations, function(combination) {return combination[1];});
        var firstVertex = vertices[0];
        for(var i=0; i <= vertices.length - 1; i++) {
            if (i != vertices.length - 1) {
                middleEdgeNumbers.push(this.edgeSum - vertices[i] - vertices[i + 1]);
            } else {
                middleEdgeNumbers.push(this.edgeSum - vertices[i] - firstVertex);
            }
        }

        return middleEdgeNumbers;
    };

    this.getAllPossibleCombinations = function() {
        var combinations = [];
        for(var i = 1; i <= this.maxNumber; i++) {
            for(var j = i + 1; j <= this.maxNumber, j + i < this.edgeSum, j < this.edgeSum - i - j; j++) {
                if (this.edgeSum - i - j <= this.maxNumber) {
                    combinations.push([i, j, this.edgeSum - i - j]);
                }
            }
        }

        return combinations;
    };

    this.getCombinationsStatistics = function() {
        var grouped = _.map(
            _.groupBy(
                _.flatten(
                    this.getAllPossibleCombinations()),
                function (num) {
                    return num;
                }
            ),
            function (group) {
                return {
                    val: group[0],
                    count: group.length
                }
            });

        return grouped;
    };

    this.getPossibleCentralNumbers = function() {
        return this.getNumberWithAtLeastCombinations(6);
    };

    this.getPossibleVertices = function() {
        return this.getNumberWithAtLeastCombinations(3);
    };

    this.getCombinationsContaining = function(number) {
        var combinations = _.filter(
            this.getAllPossibleCombinations(),
            function(combination) {
                return _.indexOf(combination, number) !== -1;
            }
        );

        return combinations;
    };

    this.getRadialCombinations = function(number) {
        var possibleVertices = this.getPossibleVertices();
        var combinations = _.map(
            this.getCombinationsContaining(number),
            function(combination) {
                var numbers = _.difference(combination, [ number ]);
                if (_.indexOf(possibleVertices, numbers[0]) != -1 && _.indexOf(possibleVertices, numbers[1]) != -1) {
                    return [[numbers[0], numbers[1]], [numbers[1], numbers[0]]];
                } else if (_.indexOf(possibleVertices, numbers[0]) == -1 && _.indexOf(possibleVertices, numbers[1]) != -1) {
                    return [[numbers[0], numbers[1]]];
                } else if (_.indexOf(possibleVertices, numbers[0]) != -1 && _.indexOf(possibleVertices, numbers[1]) == -1) {
                    return [[numbers[1], numbers[0]]];
                }
            }
        );

        return _.flatten(combinations, 1);
    };

    this.getNumbersWithNCombinations = function(numberOfCombinations){
        var statistics = this.getCombinationsStatistics();

        var numbers = _.pluck(
            _.filter(
                statistics,
                function (data) {
                    return data.count == numberOfCombinations;
                }
            ), 'val'
        );

        return numbers;
    };

    this.getMandatoryRadialCombinations = function(centralNumber) {
        var numbersWithOneCombination = this.getNumbersWithNCombinations(1);

        var allCentralNumberCombinations = this.getRadialCombinations(centralNumber);

        var mandatoryCombinations = _.filter(allCentralNumberCombinations, function(combination) {
            return !_.isEmpty(_.intersection(combination, numbersWithOneCombination));
        });

        return mandatoryCombinations;

    };

    this.getMandatoryEdgeCombinations = function(centralNumber) {
        var numbersWithOneCombination = this.getNumbersWithNCombinations(1);

        var allCombinations = this.getAllPossibleCombinations();

        var mandatoryEdgeCombinations = _.filter(allCombinations, function(combination) {
            return !_.isEmpty(_.intersection(combination, numbersWithOneCombination)) &&
                _.isEmpty(_.intersection(combination, [centralNumber]));
        });

        return mandatoryEdgeCombinations;
    };

    this.getNumberWithAtLeastCombinations = function(minNumber) {
        var statistics = this.getCombinationsStatistics();

        var candidates = _.pluck(
            _.filter(
                statistics,
                function (item) {
                    return item.count >= minNumber;
                }
            ),
            'val'
        );

        return candidates;
    };

    this.getPossibleRadialCombinations = function(centralNumber) {
        var that = this;
        var possibleRadialCombinations = _.filter(this.getRadialCombinations(centralNumber), function(radialCombination) {
            var found = false;
            _.each(that.getMandatoryRadialCombinations(centralNumber), function(mustCombination) {
                var diff = _.difference(radialCombination, mustCombination);
                if(diff.length == 0) {
                    found = true;
                }
            });
            return !found;
        });

        return possibleRadialCombinations;
    };

    this.isSolution = function(centralNumber, radialCombinations) {
        var that = this,
            middleEdgeNumbers = that.getMiddleEdgeNumbers(radialCombinations),
            vertices = _.map(radialCombinations, function(combination) {return combination[1];}),
            innerHexagon = _.map(radialCombinations, function(combination) {return combination[0];});

        var uniqueNumbers = _.uniq(
            _.union(
                [centralNumber],
                vertices,
                innerHexagon,
                middleEdgeNumbers
            )
        );

        return _.difference(this.numbers, uniqueNumbers).length == 0;
    };

    this.mayCombine = function(aCombination, anotherCombination) {
        return _.difference(aCombination, anotherCombination).length != 0;
    };

    this.removeEquivalentCombinations = function(aCombinationArray) {
        var uniqueItems = [];
        return _.filter(aCombinationArray, function(combination) {
            var isFound = false;
            _.each(combination, function (item) {
                if (!_.has(uniqueItems, item)) {
                    uniqueItems.push(item);
                } else {
                    isFound = true;
                }
            });
            return isFound;
        });
    };

    this.getPairsThatCanBeCombined = function(centralNumber) {
        var that = this;
        var combinations = this.getPossibleRadialCombinations(centralNumber);

        var pairs = new MathHelper().getArrangements(combinations.length, 2);

        return that.removeEquivalentCombinations(
            _.filter(pairs, function(pair) {
                return that.mayCombine(combinations[pair[0]], combinations[pair[1]]);
            })
        );
    };

    this.getPairsThatCannotBeCombined = function(centralNumber) {
        var that = this;
        var combinations = this.getPossibleRadialCombinations(centralNumber);

        var pairs = new MathHelper().getArrangements(combinations.length, 2);

        return that.removeEquivalentCombinations(
            _.filter(pairs, function(pair) {
                    return !that.mayCombine(combinations[pair[0]], combinations[pair[1]]);
                })
        );
    };

    this.filterArrangementsBySymmetryReasons = function(arrangements) {
        var equivalentArrangements = [];

        return _.filter(arrangements, function(arrangement) {
            var hasEquivalent = false;
            var signature = _.reduce(arrangement, function(memo, num){ return memo == '' ? num : memo + '-' + num; }, '');
            if(_.indexOf(equivalentArrangements, signature) == -1) {
                var reverseString = (signature + '').split('').reverse().join('');
                if(_.indexOf(equivalentArrangements, reverseString) == -1) {
                    equivalentArrangements.push(signature);
                } else {
                    hasEquivalent = true;
                }
            }
            return hasEquivalent;
        });
    };

    this.filterArrangementsByCollisionReasons = function(centralNumber, arrangements) {
        var that = this,
            unmixablePairs = that.getPairsThatCannotBeCombined(centralNumber);

        return _.filter(arrangements, function(arrangement) {

            var isFound = false;

            _.each(unmixablePairs, function(pair) {
                if (_.difference(pair, arrangement).length == 0) {
                    isFound = true;
                }
            });

            return !isFound;
        })
    };

    this.getLastCombination = function(mandatoryCombinations, areThereMandatoryCombinations) {
        return areThereMandatoryCombinations ? mandatoryCombinations[0] : [];
    };

    this.getGroupedCombinations = function(centralNumber) {
        var that = this,
            possibleCombinations = this.getPossibleRadialCombinations(centralNumber),
            mandatoryCombinations = this.getMandatoryRadialCombinations(centralNumber),
            mandatoryCombinationsNumber = mandatoryCombinations.length,
            areThereMandatoryCombinations = mandatoryCombinationsNumber > 0,
            lastCombination = this.getLastCombination(
                mandatoryCombinations,
                areThereMandatoryCombinations
            ),
            groupedCombinations = areThereMandatoryCombinations ?
            {
                mandatory: [],
                possible: _.union(possibleCombinations, mandatoryCombinations),
                cannotCombine: that.getPairsThatCannotBeCombined(centralNumber),
                lastCombination: [],
                centralNumber: centralNumber
            } :
            {
                mandatory: [],
                possible: possibleCombinations,
                cannotCombine: that.getPairsThatCannotBeCombined(centralNumber),
                lastCombination: [],
                centralNumber: centralNumber
            };

        return groupedCombinations;
    };

    this.getPermutationsToTry = function(centralNumber) {

        var that = this,
            groupedCombinations = that.getGroupedCombinations(centralNumber);

        return that.generateCombinationsPermutations(groupedCombinations);

    };

    this.applyPermutationOnCombinations = function(permutation, combinations) {
        var resultedCombinations = [];
        if(combinations.lastCombination.length == 0) {
            _.each(permutation, function (index) {
                resultedCombinations.push(combinations.possible[index]);
            });
        } else {
            if(combinations.mandatory.length == 0) {
                console.log('this is a bit more complicated');
            }
        }

        return resultedCombinations;
    };

    this.generateCombinationsPermutations = function(combinations) {

        var math = new MathHelper(),
            that = this;

        if (combinations.lastCombination.length == 0 ) {

            console.log('%c There are %d possible combinations','color:green; background:white; font-size: 10pt', combinations.possible.length);
            var permutations = math.getArrangements(combinations.possible.length, 6);
            var permutationsToTry = that.filterArrangementsByCollisionReasons(combinations.centralNumber, permutations);
        }

        return permutationsToTry;
    };

    this.lookForSolution = function(centralNumber) {

        var that = this,
            permutationsToTry = that.getPermutationsToTry(centralNumber),
            candidateVertices = that.getPossibleVertices(centralNumber),
            groupedCombinations = that.getGroupedCombinations(centralNumber),
            solutions = [];

        //console.log('number of permutations to try: ' + permutationsToTry.length);


        _.each(permutationsToTry, function(permutation) {
            var combinationToTry = that.applyPermutationOnCombinations(permutation, groupedCombinations);
            if (that.isSolution(centralNumber, combinationToTry)) {
                var nodes = _.map(combinationToTry, function(item) {return item[1];});
                nodes.push(centralNumber);
                var nodesToPaint = _.reduce(combinationToTry, function(memo, num){ return memo + '-' + num[1]; }, centralNumber);
                var isNew = false;
                if (solutions.length != 0) {
                    _.each(solutions, function (item) {
                        if (_.difference(nodes, item).length != 0) {
                            isNew = true;
                        }
                    });
                }
                if (isNew || solutions.length == 0) {
                    solutions.push(nodes);
                }
            }
        });

        return solutions;

        /////////////////////////////////////////////////////////////////////////
        //
        //                        VERY IMPORTANT !!!!
        //                      SIMMETRY CONSiDERATIONS
        //
        //   when considering combinations to try with we refer to
        //   positions as the indices of the radii in the hexagon
        //   we assume o indexing so there are positions from 0 to 5
        //   is convenient to fix the mandatory combination (if there is any)
        //   to position 5 and, if there are two mandatory combinations present,
        //   limit the position of the second from 0 to 2 - due to symmetry reasons
        //
        //   if there are two mandatory combinations we will search for possible
        //   arrangements with only four combinations
        //
        /////////////////////////////////////////////////////////////////////////
    };

    return this;
}

document.addEventListener('DOMContentLoaded', startMagicHexagonSimulator, false);
//document.addEventListener('DOMContentLoaded', plotSolutions, false);

function startMagicHexagonSimulator() {

    var edgeSum = 30;

    var solutionFinder = new MagicHexagonSolutionFinder(edgeSum);
    var logger = new Logger();
    var plotter = new D3Plotter();

    var candidateCentralNumbers = solutionFinder.getPossibleCentralNumbers();
    console.log('SOLUTION FINDING FOR EDGE SUM ' + edgeSum);
    _.each(candidateCentralNumbers, function(centralNumber) {
        console.log('CENTRAL NUMBER:' + centralNumber);
        var solutions = solutionFinder.lookForSolution(centralNumber);
        if (solutions.length > 0) {
            console.log('Found solutions:');
            logger.logArrayOfArrays(solutions);

            var indexSolution = 0,
                id = 'svg-' + centralNumber;
            _.each(solutions, function (solution) {
                indexSolution++;
                id += '-' + indexSolution;
                var solutionForPlot = {
                    centralNumber: centralNumber,
                    sum: edgeSum,
                    vertices: solution
                };
                plotSolution(plotter, solutionForPlot, id);
            });


        } else {
            console.log('No solutions found :-( for this central number');
        }
    });
}

function plotSolution(plotter, solution, id){
        plotter.plotTitle(solution);
        plotter.plotHexagon(id);
        plotter.plotSolutionWithCenterAndVertices(solution, id);
}

