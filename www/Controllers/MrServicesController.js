mrApp.controller('MrServicesController',
[
    '$scope', '$rootScope', '$localStorage', '$window', '$routeParams', 'MobileResponseFactory',
    function($scope, $rootScope, $localStorage, $window, $routeParams, mobileResponseFactory) {

        $scope.currentView = 'services';
        $scope.items = [];
        $scope.expandItems = false;
        
        function listServices() {
            var listServicesRequest = {
                "authenticationToken": mobileResponseFactory.getToken(),
                "data": {
                    "PageIndex": 1,
                    "PageSize": 100
                }
            };
            //console.log(listServicesRequest);
            mobileResponseFactory.functions.call("workflows/list-workflow-execution-settings",
                listServicesRequest,
                function (response) {
                    //console.log(response.data.items);
                    $scope.items = response.data.items;
                },
                function (error) {
                    console("error", error);
                    mobileResponseFactory.autoAuthenticate(function(r) {
                        console("autoAuth: success: ", r);
                        },
                        function(e) {
                            console("autoAuth: error: ", e);
                        });
                });
        }

        function executeService(requestData) {
            var executeServicesRequest = {
                "authenticationToken": mobileResponseFactory.getToken(),
                "data": requestData
            };
            //console.log(executeServicesRequest);
            mobileResponseFactory.functions.call("workflows/execute-with-parameters",
                executeServicesRequest,
                function(response) {
                    //console.log(response);
                    //$scope.items = response.data.items;
                },
                function(error) {
                    console.log(error);
                });
        }

        $scope.ExecuteService = function (item,textarea) {
            //console.log(textarea);
            var requestData = {
                "workflowId": item.workflowId,
                "metaData": {
                    "message-text": textarea
                }
            };
            executeService(requestData);
        };

        $scope.ExecuteServiceWithParameters = function(params) {
        };

        $scope.OpenService = function(item) {
            //console.log("Open item: ", item);
            //var appsUrl = "http://apps-test.bosbec.io/#/services/";
            var appsUrl = "http://apps.bosbec.io/#/services/";
            var externalUrl = appsUrl + item.id + "?token=" + mobileResponseFactory.getToken();
            console.log("externalUrl: ", externalUrl);
            $window.open(externalUrl, '_system');
        };
        

        $scope.ToggleInfo = function (item) {
            if (item.expand) {
                item.expand = false;
            } else {
                item.expand = true;
            }
        };

        $scope.ExpandInfo = function(item) {
            item.expand = true;
        };

        $scope.CompressInfo = function (item) {
            item.expand = false;
        };

        $scope.ToggleExpand = function () {
            $scope.expandItems = !$scope.expandItems;
        };

        
        
        function init() {
            $scope.$emit('viewChanged', 'services');
            listServices();
        }

        init();

    }
]);