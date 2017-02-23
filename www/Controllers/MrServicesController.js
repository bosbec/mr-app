mrApp.controller('MrServicesController',
[
    '$scope', '$rootScope', '$localStorage', '$window', '$routeParams', 'MobileResponseFactory',
    function($scope, $rootScope, $localStorage, $window, $routeParams, mobileResponseFactory) {
        
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
                    console.log(response.data.items);
                    $scope.items = response.data.items;
                },
                function (error) {

                });
        }

        $scope.ToggleInfo = function (item) {
            if (item.expand) {
                item.expand = false;
            } else {
                item.expand = true;
            }
        };

        $scope.ToggleExpand = function () {
            $scope.expandItems = !$scope.expandItems;
        };
        
        function init() {
            $scope.$emit('viewChanged', 'services-list');
            listServices();
        }

        init();

    }
]);