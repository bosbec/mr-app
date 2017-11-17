mrApp.controller('MrServicesController',
[
    '$scope', '$rootScope', '$localStorage', '$window', '$routeParams', 'MobileResponseFactory', 'SharedState',
    function ($scope, $rootScope, $localStorage, $window, $routeParams, mobileResponseFactory, SharedState) {

        $scope.currentView = 'services';
        $scope.items = [];
        $scope.expandItems = false;

        //var appsBaseUrl = "http://apps-test.bosbec.io/#";
        var appsBaseUrl = "https://apps.bosbec.io/#";
        
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
                    console.log("error", error);
                    mobileResponseFactory.autoAuthenticate(function(r) {
                        console.log("autoAuth: success: ", r);
                        },
                        function(e) {
                            console.log("autoAuth: error: ", e);
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
            var externalUrl = "";
            if (item.data.dashboard !== undefined) {
                externalUrl = appsBaseUrl + "/services/" + item.id + "?token=" + mobileResponseFactory.getToken();
            } else {
                externalUrl = appsBaseUrl + "/services/execute/" + item.id + "?token=" + mobileResponseFactory.getToken();
            }
            externalUrl = externalUrl + "&header=false";
            //$window.open(externalUrl, '_system');

            SharedState.set('formModalUrl', externalUrl);
            SharedState.turnOn('formModal');
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
            SharedState.initialize($scope, 'formModalUrl', '');
            listServices();
        }

        init();

    }
]);