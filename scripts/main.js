(function () {
    var hexagonLink = document.getElementById('js-start-hexagon'),
        selectHexagonEdgeSum = document.getElementById('js-select-hexagon-edge'),
        edgeSum = selectHexagonEdgeSum.value,
        stickLink = document.getElementById('js-start-stick'),
        selectPerimeter = document.getElementById('js-select-perimeter-value'),
        perimeter = selectPerimeter.value;

    selectHexagonEdgeSum.addEventListener("change", function () {
            edgeSum = selectHexagonEdgeSum.value;
        }
    );

    hexagonLink.addEventListener("click", function () {
            startMagicHexagonSimulator(edgeSum);
        }
    );

    selectPerimeter.addEventListener("change", function () {
            perimeter = selectPerimeter.value;
        }
    );

    stickLink.addEventListener("click", function () {
        launch12StickSimulation(perimeter);
    });

})();
