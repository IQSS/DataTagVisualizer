/**
 * a driective that handles  the view if the assignment nodes (set nodes)
 *
 *  usage example:
 *      <assignment-viewer value='v'></assignment-viewer>
 */
(function () {

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
            var template;
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
                    }
            }

            var content = $compile(template)(scope);
            element.append(content);
        }
    };
})();
