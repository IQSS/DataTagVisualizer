/**
 *  a recursive directive that creates an accordion view
 *  of a tag space
 *
 *  usage example:
 *          <tag-space- tag= tagSpace></tag-space>
 */

(function () {

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

