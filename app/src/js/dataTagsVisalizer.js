/**
 *
 *  DataTag Visualizer Web application
 *
 *  Main Module file
 *  defines the AngularJs module
 */

(function () {

    angular.module('data-tags-visualizer', ['ui.bootstrap'])

        .constant('Const', {

            moadlPath: 'src/views/',
            openFilePath: 'src/views/',
            views: {
                tagSpaceAccordionHtml: 'src/views/simpleAccoridonTemplate.html',
                compoundAccordionHtml: 'src/views/compoundAccoridonTemplate.html',
            },
            version: "1.0.0"



        });

})();










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

    dataTagDataHandler.$inject = ['$slot', 'tagSpaceTypes', '$node', 'nodeTypes', '$desicionGraph'];
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
/**
 * a driective that handles  the view if the assignment nodes (set nodes)
 *
 *  usage example:
 *      <assignment-viewer value='v'></assignment-viewer>
 */
(function () {

    assignmentViewer.$inject = ['$compile'];
    angular.module('data-tags-visualizer')
        .directive('assignmentViewer',  assignmentViewer)
    ;



    function assignmentViewer($compile) {


        return{

            restrict : 'E',
            scope: {
                value : '='
            },
            link: linkFunction

        }

        function linkFunction(scope, element, attributes){
            var template='';
            if (angular.isArray(scope.value)){
                     template = "<ul>" +
                                "  <li ng-repeat ='v in value'>" +
                                    "<assignment-viewer value='v'></assignment-viewer>" +
                                "   </li>" +
                                "</ul>"
            } else {
                    if (angular.isObject(scope.value)) {
                        var valueName = Object.keys(scope.value)[0]; //there can be only one
                        template = "<strong> " + valueName +":</strong> ";
                        if (angular.isString(scope.value[valueName])) {
                            template += "<span class='atomicAssignment'>" + scope.value[valueName]    + "</span>";
                        } else {
                            template += "<assignment-viewer value= 'value[\""+ valueName + "\"]'></assignment-viewer>";
                        }
                    } else{
                        template += "<span class='atomicAssignment' ng-bind='value'></span>";
                    }
            }

            var content = $compile(template)(scope);
            element.append(content);
        }
    };
})();

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
/**
 *  Handles the Factories of all node Objects
 */
(function () {

	var nodeTypes = {
		set: "setNode",
		ask: "AskNode",
		call: 'CallNode',
		todo: 'TodoNode',
		end: 'EndNode',
		reject: 'RejectNode',
		unknown: 'Unknown',
		root: '$$root', // not a real node. this is a root node that is added as the parent of each cluster
	};

	angular.module('data-tags-visualizer')
		.constant('nodeTypes', nodeTypes)
		.service('$node', $node)
	;

		function $node (){
		return {
			rejectNode:  function (id,reason) { return new  rejectNode(id,reason)},
			endNode: 	 function (id) { return new endNode(id)},
			todNode:  	 function (id,text) { return new todNode(id,text)},
			callNode:  	 function (id, calleeId) { return new callNode(id, calleeId)},
			setNode: 	 function (id, assignments) { return new  setNode(id, assignments)},
			askNode:   	 function (id,question, terms, answers) { return new askNode(id, question, terms, answers)},
			unknown:	 function (node) { return new unknownNode(node)},
			isNode: 	 isNode
		}
	}

	function isNode (obj){

		if (angular.isObject(obj) && obj.hasOwnProperty('type')){
			for (var type in nodeTypes){
				 if (nodeTypes[type]== obj.type) return true;
			}
			return false;
		}

	}

	function rejectNode(id,reason){
		this.id= id;
		this.reason= reason;
		this.type= nodeTypes.reject;

	}

	function endNode(id){
		this.id= id;;
		this.type= nodeTypes.end;

	}

	function todNode(id, text){
		this.id= id;
		this.note =text;
		this.type= nodeTypes.todo;
	}

	function callNode(id, calleeId){
		this.id= id;
		this.calleeId =calleeId;
		this.type= nodeTypes.call;
	}

	function setNode(id, assignments){
		this.id= id;
		this.assignments = assignments;
		this.type= nodeTypes.set;
	}

 	function askNode(id,question, terms, answers){
		this.id= id;
		this.question= question;
		this.terms = terms;
		this.answers =answers;
		this.type= nodeTypes.ask;


	}

	function unknownNode(node){

		angular.forEach(node, function (key,value){
			this.key=value;
		});
		this.type= nodeTypes.unknown;
	}
})();







/**
 * Handles the slot parsing
 *
 */
(function() {

	var tagSpaceTypes ={
		Todo: "ToDoType",
		Atomic:"AtomicType",
		Compound:"CompoundType",
		Aggregate:"AggregateType",
		Unknown:"UnknownType"
	};

	var app= angular.module('data-tags-visualizer')
		.constant('tagSpaceTypes',tagSpaceTypes)
		.service ("$slot", $slot);

	/*
	 constructor for atomic \ aggregated slot
	*/
	var slot = function (name,values,notes, type){
		this.type= type;
		this.name=name || "----";
		this.values= values || [];
		this.note=notes || "";

	};
	
	/*
	 constructor for compound slot
	*/
	var compound= function(name,  fieldTypes , note) {

		this.name=name;
		this.slots = fieldTypes;
		this.note = note || "";
		this.type= tagSpaceTypes.Compound;

	};


	var unknownSlot= function(data) {

		angular.forEach(data, function(key, value){
			this[key]=value;
		});

		if (!angular.isDefined (this.type)) {
			this.type=""
		}
		this.type+= "(unknown)";


	};

	function $slot(){
		return {
			atomic: 	function(name, values, notes){ return new slot(name, values,notes,tagSpaceTypes.Atomic)},
			Aggregate: function(name, values, notes){ return new slot(name, values,notes, tagSpaceTypes.Aggregate)},
			todo:   	function(name,notes){ return new slot(name, [],notes, tagSpaceTypes.Todo)},
			compound: 	function(name, slots, notes) { return new compound(name, slots, notes)},
			unknown: 	function (data) {return new unknownSlot(data)}
		};
	};






})();


/**
 *  a recursive directive that creates an accordion view
 *  of a tag space
 *
 *  usage example:
 *          <tag-space- tag= tagSpace></tag-space>
 */

(function () {

    tagSpace.$inject = ['$compile', 'tagSpaceTypes'];
    tagSpaceAccordion.$inject = ['$compile', 'tagSpaceTypes'];
    SimpleTagAccordion.$inject = ['Const'];
    compoundAccordion.$inject = ['Const'];
    printType.$inject = ['tagSpaceTypes'];
    angular.module('data-tags-visualizer')

        .directive("tagSpace", tagSpace)
        .directive("tagSpaceAccordion", tagSpaceAccordion)
        .directive("simpleAccordion", SimpleTagAccordion)
        .directive("compoundAccordion", compoundAccordion)
        .filter('printType', printType)
    ;

    function printType(tagSpaceTypes) {
        return function (type) {
            switch (type) {
                case tagSpaceTypes.Atomic:
                    return '(atomic)';
                    break;
                case tagSpaceTypes.Aggregate:
                    return '(aggregated)';
                    break;
                case tagSpaceTypes.Compound:
                    return '(compound)';
                    break;
                case tagSpaceTypes.Todo:
                    return '(todo)';
                    break;
                case tagSpaceTypes.Unknown:
                    return '(unknown)';
                    break;
            }
        }

    };


    function tagSpace($compile, tagSpaceTypes) {

        return {
            scope: {
                tag: '='
            },

            link: LinkFunction
        }

        function LinkFunction(scope, element, attributes) {

            var template= '<tag-space-accordion tag= tag></tag-space-accordion>';
            var unwatch = scope.$watch('tag', function (newVal,oldVal) {
                if (newVal!= oldVal && !!newVal) {

                    //element.children().remove();
                    element.append( $compile(template)(scope));

                }


            });
            element.on('$destroy', function () {
                scope.$destroy();
            });
        }

    };


    function tagSpaceAccordion($compile, tagSpaceTypes) {

        return {
            scope: {
                tag: '='
            },

            link: LinkFunction
        }

        function LinkFunction(scope, element, attributes) {

            function createStub(tag) {

                var template = '<TEMP tag="tag"></TEMP>';

                switch (tag.type) {
                    case tagSpaceTypes.Atomic:
                    case tagSpaceTypes.Aggregate:
                    case tagSpaceTypes.Todo:
                        template = template.replace(/TEMP/g, 'simple-accordion');
                        break;
                    case tagSpaceTypes.Compound:
                        template = template.replace(/TEMP/g, 'compound-accordion');
                        break;
                    case tagSpaceTypes.Unknown:
                        template = template.replace(/TEMP/g, 'unknown-accordion');
                        break;
                }
                return template;
            }
            var unwatch = scope.$watch('tag', function (newVal) {
                if (!!newVal) {
                    unwatch();
                    var template = createStub(scope.tag, tagSpaceTypes);
                    var content = $compile(template)(scope);
                    element.append(content);


                }
            });

            element.on('$destroy', function () {
                scope.$destroy();
            });
        }

    };


    function SimpleTagAccordion(Const) {

        return {
            restrict: 'E',
            templateUrl: Const.views.tagSpaceAccordionHtml,
            scope: {
                tag: '='
            },
            link: function (scope, element) {
                element.on('$destroy', function () {
                    scope.$destroy();
                });
            }
        }
    };


    function compoundAccordion(Const) {

        return {
            restrict: 'E',
            templateUrl: Const.views.compoundAccordionHtml,
            scope: {
                tag: '='
            },
            link: function (scope, element) {
                element.on('$destroy', function () {
                    scope.$destroy();
                });
            }
        }


    };
})();


(function () {

    nodeColors.$inject = ['nodeTypes'];
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
/**
 * Handles the modal display windows of each node
 *
 */
(function () {


    modalHandler.$inject = ['$uibModal', '$node', 'nodeTypes', 'Const'];
    printNodeType.$inject = ['nodeTypes'];
    angular.module('data-tags-visualizer')
        .service('ModalHandler', modalHandler)
        .filter('printNodeType', printNodeType)
        .filter('removeBracketsID', removeBracketsID)
    ;


    function modalHandler($uibModal, $node, nodeTypes,Const) {

        var templates = {};

        templates.nodeModal = Const.moadlPath + 'simpleNodeModal.html',
        templates[nodeTypes.ask] = Const.moadlPath + 'askNodeModalBody.html',
        templates[nodeTypes.set] = Const.moadlPath + 'setNodeModalBody.html',
        templates[nodeTypes.call] = Const.moadlPath + 'callNodeModalBody.html',
        templates[nodeTypes.end] = Const.moadlPath + 'endNodeModalBody.html',
        templates[nodeTypes.reject] = Const.moadlPath + 'endNodeModalBody.html',
        templates[nodeTypes.todo] = Const.moadlPath + 'todoNodeModalBody.html',
        templates[nodeTypes.root] = Const.moadlPath + 'rootNodeModal.html',
        templates[nodeTypes.unknown] = Const.moadlPath + 'unknownNodeModalBody.html',


            this.openModal = function (object) {

                if (!angular.isObject(object))
                    return;

                var template = templates.nodeModal;
                var hasbody = true;
                var modalContent;


                if ($node.isNode(object)) {

                    template = templates.nodeModal;
                    modalContent = templates[object.type];

                } else {
                    return;
                }

                var modalInstance = $uibModal.open({
                    animation: true,
                    templateUrl: template,
                    size: 'md',
                    controller: ['$scope', '$uibModalInstance', function ($scope, $uibModalInstance) {
                        $scope.modalContent = modalContent;
                        $scope.node = object;
                        $scope.hasbody = hasbody;

                        $scope.close = function () {
                            $uibModalInstance.close();
                        };

                        $scope.goto = function (nodeId) {
                            $uibModalInstance.close({node: nodeId, action: 'add'});
                        }

                        $scope.gotoAsk = function (nodeId){

                            $uibModalInstance.close({node: nodeId, action: 'center'});
                        }

                        $scope.removeGraph = function (nodeId) {
                            $uibModalInstance.close({node: nodeId, action: 'remove'});
                        }


                    }],


                });

                return modalInstance.result;
            }
    };

    function removeBracketsID() {

        return function (id) {
            return id.substring(1, id.length - 1);
        }
    }

    function printNodeType(nodeTypes) {

        return function (node) {

            var res;
            switch (node.type) {
                case nodeTypes.ask:
                    res = 'Ask Node'
                    break
                case nodeTypes.call:
                    res = 'Call Node'
                    break;
                case nodeTypes.end:
                    res = 'End Node'
                    break;
                case nodeTypes.reject:
                    res = 'Reject Node'
                    break;
                case nodeTypes.set:
                    res = 'Set Node'
                    break;
                case nodeTypes.todo:
                    res = 'Todo Node'
                    break;
                case nodeTypes.root:
                    res = node.firstId + ' Sub-Graph '
                    break;
                default:
                    res = node.type;
            }
            return res  ;
        }


    };


})();
/**
 *  handles the cytoscape js grpah object
 *  the grpah object is a singleton
 *
 *  API:
 *      $grpah(decisionGraph, container):
 *          the factory function
 *              decisionGraph - a desicionGraph object
 *              container - the DOM element that the grph will be append to
 *
 *     graphInstance:
 *              get() - returns  the instance of the graph
 *
 * Directive:
 *      <graph src=decisionGraphObject ></graph>
 *
*/
(function () {


    graphFactory.$inject = ['nodeColors', 'graphInstance'];
    graphDirective.$inject = ['$grpah', 'ModalHandler', '$timeout'];
    angular.module('data-tags-visualizer')
        .factory("$grpah", graphFactory)
        .directive("graph", graphDirective)
        .service("graphInstance", graphInstance);

    var c = null;

    function graphInstance() {

        this.get = function () {
            return c
        }

    }

    function graphDirective($grpah, ModalHandler, $timeout) {

        return {
            restrict: "A",
            scope: {
                src: '='
            },
            link: function (scope, elem) {

                var unwatch = scope.$watch('src', function (newVal, oldVal) {
                    if (!!newVal && oldVal != newVal) {

                        elem.ready(function () {

                            var cy = $grpah(scope.src, elem);
                            cy.on('tap', 'node', scope.src.nodes, function (event) {

                                var node = event.cyTarget;

                                var res = ModalHandler.openModal(node.data().node, cy);
                                res.then(function (resault) {
                                    if (!!resault) {
                                        var cluster = scope.src.findCluster(resault.node);
                                        performGraphAction(cy, cluster, resault.node, resault.action ,ModalHandler);
                                    }
                                });

                            });

                            cy.on('mouseover', 'node', scope.src.nodes, function (event) {

                                var node = event.cyTarget;
                                if (node.data().isRoot != "1") {
                                    node.animate({

                                        style: {
                                            'border-color': '#000',
                                            'border-width': 3,
                                            'border-opacity': 0.2,
                                        }},{
                                        duration: 200

                                    })
                                }
                            });

                            cy.on('mouseout ', 'node', scope.src.nodes, function (event) {
                                var node = event.cyTarget;
                                if (node.data().isRoot != "1") {
                                    node.animate({
                                        style: {

                                            'border-width': 0,

                                        }
                                    })
                                }
                            });

                            scope.$watch('src', function (newVal, oldVal) {

                                if (!!newVal && oldVal != newVal) {
                                    var c = cy.nodes();
                                    c.remove();
                                    c = cy.add(scope.src.getStartNode());
                                    cy.layout(cy.options);
                                    cy.center(c)
                                }

                                $timeout(function () {
                                        cy.resize();
                                    },
                                    200);
                            });
                            $timeout(function () {
                                    cy.resize();
                                },
                                200);
                        })
                    }


                }, true);

                elem.on('$destroy', function () {
                    scope.$destroy();
                });
            }
        }
    }

    function performGraphAction(cy, cluster, nodeId, action, ModalHandler) {

        switch (action) {
            case 'add':
                var c = cy.add(cluster);
                cy.layout(cy.options);

                cy.animate({

                    center: c,

                });

                break;

            case 'remove' :
                var g = cy.$("node[parent='" + cluster.getRoot() + "']");
                removeNodes(g);
                g = cy.$("node[id='" + cluster.getRoot() + "']");
                removeNodes(g);
                cy.layout(cy.options);
                break;


            case 'center' :

                var c = cy.$("node[id='" + nodeId + "']")
                cy.animate({
                    center: {
                        eles: c
                    },
                    zoom: 3,
                    complete: function(){
                        var res = ModalHandler.openModal(c.data().node, cy);
                        res.then(function (resault) {
                            if (!!resault) {
                                var cluster = scope.src.findCluster(resault.node);
                                performGraphAction(cy, cluster, resault.node, resault.action, ModalHandler);
                            }
                        });
                    }
                });
                break;
            default :
                break;
        }

    }

    function removeNodes(nodeGroup) {
        var removed = []
        var lastPosition = null;
        var d = 1000 / nodeGroup.length;
        nodeGroup.forEach(function (e, i) {
            var pos = e.position();
            e.animate({
                style: {
                    opacity: 0,

                }
                 }, {
                duration: d * i,
                complete: function () {
                    removed.push(e.remove());
                }
            });
        });
        return removed;
    }

    function addNodes(cy, nodeGroup) {
        var d = 1000 / nodeGroup.length;
        nodeGroup.reverse().forEach(function (e, i) {

            cy.add(e).animate({
                style: {opacity: 1}
            }, {
                duration: d * i

            });
            //if (!!e.data().decendents){
            //     addNodes(cy, e.data().decendents);
            //    e.data().decendents=null;
            //}
        })
    }

    function graphFactory(nodeColors, graphInstance) {

        return function (decisionGraph, container) {
            return new Graph(decisionGraph, container)
        }


        function Graph(decisionGraph, container) {

            var options = {
                name: 'dagre',
                nodeSep: undefined, // the separation between adjacent nodes in the same rank
                edgeSep: undefined, // the separation between adjacent edges in the same rank
                rankSep: undefined, // the separation between adjacent nodes in the same rank
                rankDir: 'LR', // 'TB' for top to bottom flow, 'LR' for left to right
                minLen: function (edge) {
                    return 0.5;
                }, // number of ranks to keep between the source and target of the edge
                edgeWeight: function (edge) {
                    return 5;
                }, // higher weight edges are generally made shorter and straighter than lower weight edges

                // general layout options
                fit: true, // whether to fit to viewport
                padding: 10, // fit padding
                animate: true, // whether to transition the node positions
                animationDuration: 1000, // duration of animation in ms if enabled
                animationEasing: undefined, // easing of animation if enabled
                boundingBox: undefined, // constrain layout bounds; { x1, y1, x2, y2 } or { x1, y1, w, h }
                ready: function () {

                }, // on layoutready

                stop: function () {

                } // on layoutstop
            }

            var cy = cytoscape(
                {
                    container: container,
                    elements: decisionGraph.getStartNode(),
                    style: [
                        {
                            selector: "node[isRoot='1']",
                            css: {
                                'padding-top': '10px',
                                'padding-left': '10px',
                                'padding-bottom': '10px',
                                'padding-right': '10px',
                                'background-color': 'white'
                            }
                        },
                        {
                            selector: "node[isRoot!='1']",
                            style: {
                                'label': 'data(id)',
                                'background-color': function (node) {
                                    return nodeColors[node.data().node.type] || 'grey';
                                },
                                'text-valign': 'center',
                                'text-halign': 'center',
                                'text-outline-color': function (node) {
                                    return nodeColors[node.data().node.type] || 'grey';
                                },
                                'text-outline-width': 2,
                                'font-size': '14px',
                            }
                        },
                        {
                            selector: 'edge',
                            style: {
                                'width': 2,
                                'line-color': 'lightgery',
                                'target-arrow-color': '#a9b7f8',
                                //'source-arrow-shape': 'circle',
                                //'source-arrow-color': '#a9b7f8',
                                'target-arrow-shape': 'triangle',
                            }
                        },

                    ],
                    layout: options
                });
            cy.options = options;
            PanZoom(cy);
            c = (cy);
            return cy;
        }


        function PanZoom(cy) {

            var panZoomOptions = {
                zoomFactor: 0.05, // zoom factor per zoom tick
                zoomDelay: 45, // how many ms between zoom ticks
                minZoom: 0.1, // min zoom level
                maxZoom: 10, // max zoom level
                fitPadding: 50, // padding when fitting
                panSpeed: 10, // how many ms in between pan ticks
                panDistance: 10, // max pan distance per tick
                panDragAreaSize: 75, // the length of the pan drag box in which the vector for panning is calculated (bigger = finer control of pan speed and direction)
                panMinPercentSpeed: 0.25, // the slowest speed we can pan by (as a percent of panSpeed)
                panInactiveArea: 8, // radius of inactive area in pan drag box
                panIndicatorMinOpacity: 0.5, // min opacity of pan indicator (the draggable nib); scales from this to 1.0
                zoomOnly: false, // a minimal version of the ui only with zooming (useful on systems with bad mousewheel resolution)

                // icon class names
                sliderHandleIcon: 'fa fa-minus',
                zoomInIcon: 'fa fa-plus',
                zoomOutIcon: 'fa fa-minus',
                resetIcon: 'fa fa-expand'
            };
            cy.panzoom(panZoomOptions);
        }


    }

})
();



/**
 *  handles  the data services of the web application
 *
 *  API:
 *      getData - opens a browser file dailog, and returns the parsed data.
 *      dataIsAvailable  - return true if data is not null or undefined
 *      clearData- clear the current saved data
 */

(function () {

    dataService.$inject = ['$dataTagDataHandler', 'fileService', '$q'];
    angular.module('data-tags-visualizer')
        .service('dataService', dataService)


    var data = null;


    function dataService($dataTagDataHandler, fileService, $q) {


        var res = {

            dataIsAvailable: function () {
                return !!data
            },
            getData: getData,
            clearData: function () {
                data = null
            },


        }
        return res;


        function getData(rawData) {
            var file = fileService.openFileDialog();
            var deferred = $q.defer();

            file.then(function (rawData) {
                data = {
                    decisionGraph: $dataTagDataHandler.desicionGraphParser(rawData.decisionGraph),
                    tagSpace: $dataTagDataHandler.tagParser(rawData.tagSpace)
                }
                deferred.resolve(data);
            })
            return deferred.promise;
        }


    }

})();
/**
 * handles the file opening
 * -opens a file selection dialog
 * -parse the fie from json
 * -returns the obtained data
 *
 * API:
 *  openFile() - opens a browser file dailog, and returns the parsed data.
 */
(function () {

    openFile.$inject = ['$uibModal', 'Const'];
    openFileCtrl.$inject = ['$scope', '$uibModalInstance', 'Const'];
    angular.module('data-tags-visualizer')
        .service('fileService', openFile)



    function openFile($uibModal, Const) {

        var template = Const.openFilePath + 'openFileDialog.html';
        this.openFileDialog = function () {

            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: template,
                size: 'md',
                controller: openFileCtrl
            });
            return modalInstance.result;
        }
    };


    function openFileCtrl($scope, $uibModalInstance,Const) {

        //$scope.openFileDialog = function () {
        //    $('#openFileDialog').click();
        //};

        $scope.status="";

        $scope.closeDialog= function(){ $uibModalInstance.dismiss() }

        $scope.ok = function () {
            var file = $('#openFileDialog')[0].files[0]
            var r = new FileReader();
            r.onloadend = function (e) {

                var succeed=true;
                var res;

                $scope.status="Loading..."
                try {
                    res=JSON.parse(e.target.result)
                    if ( !angular.isObject(res) || res.data_tag_json_version!= Const.version){
                             succeed=false;
                    }
                }
                catch(err){
                    succeed=false
                }

                if (succeed) {
                    $uibModalInstance.close(res);
                } else{
                    $scope.status= "The selected file is not a DataTag json V"+Const.version;
                }
            }
            if (!!file) {
                r.readAsText(file);

            } else{
                $scope.status="No file selected..."
            }
        };

    }


})();