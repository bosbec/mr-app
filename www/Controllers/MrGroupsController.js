mrApp.controller('MrGroupsController',
[
    '$scope', '$rootScope', '$localStorage', '$location', '$routeParams', 'MobileResponseFactory',
    function($scope, $rootScope, $localStorage, $location, $routeParams, mobileResponseFactory) {

        var activeGroupId = $routeParams.param1;

        $scope.activeGroup = null;

        $scope.items = [];

        $scope.expandUnits = false;


        function listGroups() {
            var listGroupsRequest = {
                "authenticationToken": mobileResponseFactory.getToken(),
                "data": {
                    "ListMetaData": true,
                    "PageIndex": 0,
                    "PageSize": 100
                }
            };
            mobileResponseFactory.functions.call("groups/list",
                listGroupsRequest,
                function (response) {
                    $scope.items = response.data.items;
                },
                function (error) {

                });
        }

        function listGroupMembers(groupId) {
            var listGroupMemberReqeust = {
                "authenticationToken": mobileResponseFactory.getToken(),
                "data": {
                    "groupId": groupId
                }
            };
            mobileResponseFactory.functions.call("group-members/list",
               listGroupMemberReqeust,
               function (response) {
                   $scope.items = response.data.items;
                   console.log(response.data.items);
               },
               function (error) {

               });

        }

        function groupDetails(groupId) {
            var listGroupMemberReqeust = {
                "authenticationToken": mobileResponseFactory.getToken(),
                "data": {
                    "groupId": groupId
                }
            };
            mobileResponseFactory.functions.call("groups/details",
               listGroupMemberReqeust,
               function (response) {
                   $scope.activeGroup = response.data;
               },
               function (error) {

               });

        }

        $scope.OpenGroup = function(groupId) {
            $location.path("/mr/groups/" + groupId);
        };

        $scope.ToggleUnitInfo = function (unit) {
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
            if (activeGroupId != undefined) {
                $scope.$emit('viewChanged', 'group-members-list');
                //console.log("ActiveGroupId: " + activeGroupId);
                listGroupMembers(activeGroupId);
                groupDetails(activeGroupId);
            } else {
                $scope.$emit('viewChanged', 'groups-list');
                //console.log("List groups");
                listGroups();
            }
        }

        init();

    }
]);