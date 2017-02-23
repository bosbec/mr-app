mrApp.controller('MrUnitsController',
[
    '$scope', '$rootScope', '$localStorage', '$window', '$routeParams', 'MobileResponseFactory',
    function($scope, $rootScope, $localStorage, $window, $routeParams, mobileResponseFactory) {

        $scope.items = [];
        $scope.expandUnits = false;

        function listUnits() {
            var listUnitsRequest = {
                "authenticationToken": mobileResponseFactory.getToken(),
                "data": {
                    "ListMetaData": true,
                    "PageIndex": 1,
                    "PageSize": 100
                }
            };
            console.log(listUnitsRequest);
            mobileResponseFactory.functions.call("units/list",
                listUnitsRequest,
                function(response) {
                    console.log(response);
                    $scope.items = response.data.items;
                },
                function(error) {

                });
        }

        $scope.ToggleUnitInfo = function (unit) {
            console.log(unit);
            if (unit.expand) {
                unit.expand = false;
            } else {
                unit.expand = true;
            }
        };

        $scope.ToggleExpand = function () {
            $scope.expandUnits = !$scope.expandUnits;
        };

        function init() {
            $scope.$emit('viewChanged', 'units-list');
            listUnits();
        }

        init();

    }
]);