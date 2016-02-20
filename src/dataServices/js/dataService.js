/**
 *  handles  the data services of the web application
 *
 *  API:
 *      getData - opens a browser file dailog, and returns the parsed data.
 *      dataIsAvailable  - return true if data is not null or undefined
 *      clearData- clear the current saved data
 */

(function () {

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