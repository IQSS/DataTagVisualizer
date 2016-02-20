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


