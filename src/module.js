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

            dataPath: '/datatags_visualizer/app/example-data.json',
            moadlPath: '/datatags_visualizer/src/Graph/view/',
            openFilePath: '/datatags_visualizer/src/dataServices/view/',
            views: {
                tagSpaceAccordionHtml: '/datatags_visualizer/src/tagSpace/views/simpleAccoridonTemplate.html',
                compoundAccordionHtml: '/datatags_visualizer/src/tagSpace/views/compoundAccoridonTemplate.html',
            },
            version: "1.0.0"


        });

})();









