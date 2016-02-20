(function () {

    angular.module('data-tags-visualizer')
        .service('nodeColors', nodeColors)


    function nodeColors(nodeTypes) {

         
        var colors={};
        colors[nodeTypes.ask] = "#95b2e6";
        colors[nodeTypes.set] = "#537D31";
        colors[nodeTypes.call] = "#F69D1B";
        colors[nodeTypes.end] = "#FF5049";
        colors[nodeTypes.reject] = "#A11219";
        colors[nodeTypes.todo] = "#757575";
        colors[nodeTypes.root] ="white"
        return colors;
    }


})();