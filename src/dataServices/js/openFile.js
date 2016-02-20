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