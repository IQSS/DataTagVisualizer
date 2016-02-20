/**
 * A factory of the desicion graph object
 *
 * API:
 *  $desicionGraph(dg) - receives a raw decision graph object from the file
 *                       returns a desicionGraph object
 *
 *  dg.findCluster(nodeId) - given a node ID. the decision graph finds the node
 *                           object and return the cluster that the node belongs to or null if
 *                           somthing went wrong
 */
(function () {

    angular.module('data-tags-visualizer')
        .factory('$desicionGraph' , desicionGraphFact)

    ;



    function desicionGraphFact () {

        return (function(dg) { return new desicionGraph(dg)});
    }


    function desicionGraph(dg ){

        for (var a in dg){
            this[a]=dg[a];
        }


    }

    desicionGraph.prototype.findCluster=function(nodeId){

        for (var cluster in this){
            if (cluster!= '$startNode'){
                var nodes= this[cluster].nodes;
                for (var n in nodes){

                        if (nodes[n].data.id == nodeId)
                        {
                            return this[cluster]
                        }
                }
            }
        }
        return null;
    };


})();