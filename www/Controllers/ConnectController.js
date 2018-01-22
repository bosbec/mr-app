mrApp.controller('ConnectController',
[
    '$scope', '$rootScope', '$localStorage', '$timeout','ApiFactory', 'MobileResponseFactory',
    function($scope, $rootScope, $localStorage, $timeout, apiFactory, mobileResponseFactory) {

        $scope.error = {
            "show": false,
            "text": ""
        };

        function connect(username, password) {
            var userCredentials = {
                "appUserId": apiFactory.myAppUser.appUserId,
                "UserName": username,
                "Password": password
            };
            mobileResponseFactory.functions.authenticate(userCredentials,
                function (response) {
                    $rootScope.mobileResponseToken = response;
                    $localStorage.mobileResponseCredentials = userCredentials;
                },
                function (error) {
                    $scope.error.text = "Failed to connect, please check your credentials";
                    $scope.error.show = true;
                    $timeout(function() {
                            $scope.error.text = "";
                            $scope.error.show = false;
                        },
                        3000);
                    console.log("mr auth failed", error);
                });
        }

        function disconnect() {
            $localStorage.mobileResponseCredentials = null;
            $rootScope.mobileResponseToken = null;
            console.log("Disconnected");
        }

        $scope.Connect = function () {
            connect($scope.mrUserName, $scope.mrPassword);
        };

        $scope.Disconnect = function () {
            disconnect();
        };
        
        function init() {
            //if ($localStorage.mobileResponseCredentials != null) {
            //    connect($localStorage.mobileResponseCredentials.username, $localStorage.mobileResponseCredentials.password);
            //}
        }

        init();

    }
]);