/**
 * parse the raw data into the object used by the application
 * the main goal of this service is to proivde capsolation between the
 * received data and the web application and to add some functionality
 *
 *
 * API:
 * tagParser: function (tags) - parse the tag space
 * desicionGraphParser: function (desicionGraph) - parse the desicion Graph
 * tagSpaceToGraph :  function (parsedTagSpace) - turns the tag space into a graph form of cytoscape js (not used in the web app)
 *
 *
 */
(function () {

    angular.module('data-tags-visualizer')
        .service('$dataTagDataHandler', dataTagDataHandler);




    function dataTagDataHandler ($slot,tagSpaceTypes,$node,nodeTypes,$desicionGraph){
        return {
            tagParser: function (tags) { return dataTagParser($slot,tagSpaceTypes, tags)},
            desicionGraphParser: function (desicionGraph){ return desicionGrapgParser(desicionGraph,$node,nodeTypes,$desicionGraph)},
            tagSpaceToGraph :  function (parsedTagSpace) { return tagSpaceToGraph(parsedTagSpace, tagSpaceTypes)}

        }
    }

    function dataTagParser($slot,tagSpaceTypes,tag) {

            switch (getTagType(tag)) {
                case tagSpaceTypes.Atomic:
                    return $slot.atomic(tag.name, tag.values, tag.note);
                    break;
                case tagSpaceTypes.Aggregate:
                    return $slot.Aggregate(tag.name, tag.values, tag.note, tagSpaceTypes.Aggregate);
                    break;
                case tagSpaceTypes.Compound:
                    var subslots= tag.fieldTypes.map (function (slot) {
                        return dataTagParser($slot,tagSpaceTypes,slot)
                    });
                    return $slot.compound(tag.name, subslots, tag.note);
                    break;
                case tagSpaceTypes.Todo:
                    return $slot.todo(tag.name, tag.note);
                    break;
                default:
                    return $slot.unknown(tag);
            }
    }

    function getTagType(tag) {

        return tag.type;
    }

    function tagSpaceToGraph(parsedTagSpace,tagSpaceTypes ) {


        var nodes = [];
        var edges = [];

        recursiveParse(parsedTagSpace);

        return {
            nodes: nodes,
            edges: edges
        };


        function recursiveParse(tag) {
            nodes.push({
                data: {
                    id: tag.name,
                    tagObject: tag
                }
            });
            if (getTagType(tag) == tagSpaceTypes.Compound) {
                tag.slots.forEach(function (slot) {
                    edges.push({
                        data:   {
                            id: tag.name + "_TO_" + slot.name,
                            source: tag.name,
                            target: slot.name,
                        }
                    });
                    recursiveParse(slot)
                });
            }
        }
    }




    /******************** DG ************************/

    function desicionGrapgParser(desicionGraph,$node,nodeTypes,$desicionGraph){

        var allnodes={};
        var alledges={};



        var dg={
            getStartNode: function () {
                return dg[desicionGraph.$startNode]
            }
        };

        angular.forEach(desicionGraph,
            function(cluster,firstId){
                if (firstId =='$startNode')
                    return;
                var nodes= cluster.nodes.map(function (node) {

                    if (!allnodes[node.id]) {

                        var parsedNode = nodeParser(node, nodeTypes, $node);
                        parsedNode.data.parent= firstId + nodeTypes.root;
                        allnodes[node.id]= parsedNode;
                        return parsedNode;
                    } else {
                        return allnodes[node.id];
                    }
                });

                    nodes.push( { data: { id: firstId+ nodeTypes.root, isRoot: "1"   ,  node: { type: nodeTypes.root, firstId: firstId} }} );

                var edges= cluster.edges.map(function (edge){

                    var parsedEdge= edgeParser(edge)
                    if (!alledges[parsedEdge.data.id]){

                        alledges[parsedEdge.data.id]= parsedEdge;

                        return parsedEdge;
                    } else
                        return alledges[parsedEdge.data.id]
                })

                dg[firstId]= ({edges: edges, nodes:nodes});
                dg[firstId].getRoot=function() { return firstId+ nodeTypes.root};
        })

        return $desicionGraph(dg);
    }

    function edgeParser(edge){
        edge.id = edge.source + "_TO_" + edge.target
        return { data : edge }

    };

    function nodeParser(node,nodeTypes,$node){
        var nodeObj;
        switch (node.type) {

            case nodeTypes.ask:
                nodeObj =$node.askNode(node.id,node.question, node.terms, node.answers);
                break;
            case nodeTypes.set:
                nodeObj =$node.setNode(node.id, node.assignments);
                break;
            case nodeTypes.call:
                nodeObj =$node.callNode(node.id, node.CalleeId);
                break;
            case nodeTypes.end:
                nodeObj =$node.endNode(node.id);
                break;
            case nodeTypes.reject:
                nodeObj =$node.rejectNode(node.id, node.reason);
                break;
            case nodeTypes.todo:
                nodeObj =$node.todNode(node.id, node.text);
                break;
            default:
                nodeObj =$node.todNode(node.id, node.text);
                break;
        }
        return {
            data: {
                id: node.id,
                node: nodeObj,
            }
        };

    }

})();