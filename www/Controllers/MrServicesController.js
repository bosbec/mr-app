mrApp.controller('MrServicesController',
[
    '$scope', '$rootScope', '$localStorage', '$window', '$routeParams', 'MobileResponseFactory',
    function($scope, $rootScope, $localStorage, $window, $routeParams, mobileResponseFactory) {
        
        $scope.items = [];

        function listServices() {
            var listServicesRequest = {
                "authenticationToken": mobileResponseFactory.getToken(),
                "data": {
                    "ListMetaData": true,
                    "PageIndex": 0,
                    "PageSize": 100
                }
            };
            //console.log(listServicesRequest);
            mobileResponseFactory.functions.call("workflows/list",
                listServicesRequest,
                function (response) {
                    console.log(response);
                    $scope.items = response.data.items;
                },
                function (error) {

                });
        }
        
        function init() {
            listServices();

        }

        init();

    }
]);