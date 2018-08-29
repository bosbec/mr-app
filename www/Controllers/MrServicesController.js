mrApp.controller('MrServicesController',
[
    '$scope', '$rootScope', '$localStorage', '$window','$location', '$routeParams', 'MobileResponseFactory','SettingsFactory','UsersFactory', 'SharedState',
    function ($scope, $rootScope, $localStorage, $window,$location, $routeParams, mobileResponseFactory, settingsFactory,usersFactory, SharedState) {

        $scope.currentView = 'services';
        $scope.items = [];
        $scope.expandItems = false;

        var appsBaseUrl = settingsFactory.getUrls().apps;
        
        function listServices() {
            var listServicesRequest = {
                "authenticationToken": mobileResponseFactory.getToken(),
                "data": {
                    "PageIndex": 1,
                    "PageSize": 100
                }
            };
            
            mobileResponseFactory.functions.call("services/list-services",
                listServicesRequest,
                function (response) {
                    $scope.items = response.data.items;
                },
                function (error) {
                    //console.log("error", error);
                    mobileResponseFactory.functions.autoAuthenticate(function(r) {
                            //console.log("autoAuth: success: ", r);
                            $location.path("/mr/services?reload=true");
                        },
                        function(e) {
                            //console.log("autoAuth: error: ", e);
                            $window.location.reload();
                        });
                });
        }

        function executeService(requestData) {
            var executeServicesRequest = {
                "authenticationToken": mobileResponseFactory.getToken(),
                "data": requestData
            };
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
            externalUrl = externalUrl + "&caller=app&appuserid=" + usersFactory.myUser().id;
            //$window.open(externalUrl, '_system');

            SharedState.set('formModalUrl', externalUrl);
            SharedState.turnOn('formModal');
        };

        $scope.OpenServiceWebview = function (item) {
            //console.log("Open item: ", item);
            var externalUrl = "";
            if (item.data.dashboard !== undefined) {
                externalUrl = appsBaseUrl + "/services/" + item.id + "?token=" + mobileResponseFactory.getToken();
            } else {
                externalUrl = appsBaseUrl + "/services/execute/" + item.id + "?token=" + mobileResponseFactory.getToken();
            }
            externalUrl = externalUrl + "&caller=app&appuserid=" + usersFactory.myUser().id;
            //$window.open(externalUrl, '_system');
            $window.open(externalUrl, '_blank', 'location=yes');

            //SharedState.set('formModalUrl', externalUrl);
            //SharedState.turnOn('formModal');
        };

        $scope.OpenWebView = function (url) {
            //$window.open(externalUrl, '_system');
            cordova.inAppBrowser.open(url, '_blank', 'location=yes');
            //$window.open(externalUrl, '_blank', 'location=yes');
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