/**
 * Handles the modal display windows of each node
 *
 */
(function () {


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
                    controller: function ($scope, $uibModalInstance) {
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


                    },


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