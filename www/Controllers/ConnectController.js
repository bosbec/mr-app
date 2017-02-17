mrApp.controller('ConnectController',
[
    '$scope', '$rootScope', '$localStorage', 'MobileResponseFactory',
    function($scope, $rootScope, $localStorage, mobileResponseFactory) {
        
        function listGroups() {
            var listGroupsRequest = {
                "authenticationToken": mobileResponseFactory.getToken(),
                "data": {
                    "ListMetaData": true,
                    "PageIndex": 0,
                    "PageSize": 100
                }
            };
            console.log(listGroupsRequest);
            mobileResponseFactory.functions.call("groups/list",
                listGroupsRequest,
                function (response) {
                    console.log(response);
                    $scope.groups = response.data.items;
                },
                function (error) {

                });
        }

        function connect(username, password) {
            var userCredentials = {
                "UserName": username,
                "Password": password
            };

            mobileResponseFactory.functions.authenticate(userCredentials,
                function (response) {
                    $rootScope.mobileResponseToken = response;
                    $localStorage.mobileResponseCredentials = userCredentials;
                },
                function (error) {

                });
        }

        $scope.Connect = function () {
            connect($scope.mrUserName, $scope.mrPassword);
        };

        $scope.Disconnect = function () {
            $localStorage.mobileResponseCredentials = {};
            $rootScope.mobileResponseToken = null;
            console.log("Disconneted");
        };
        
        function init() {
            if ($localStorage.mobileResponseCredentials != null) {
                connect($localStorage.mobileResponseCredentials.username, $localStorage.mobileResponseCredentials.password);
            }
        }

        init();

    }
]);