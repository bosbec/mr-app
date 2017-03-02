mrApp.controller('ConnectController',
[
    '$scope', '$rootScope', '$localStorage','ApiFactory', 'MobileResponseFactory',
    function($scope, $rootScope, $localStorage, apiFactory, mobileResponseFactory) {

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

                });
        }

        function disconnect() {
            $localStorage.mobileResponseCredentials = null;
            $rootScope.mobileResponseToken = null;
            console.log("Disconneted");
        }

        $scope.Connect = function () {
            connect($scope.mrUserName, $scope.mrPassword);
        };

        $scope.Disconnect = function () {
            disconnect();
        };
        
        function init() {
            if ($localStorage.mobileResponseCredentials != null) {
                connect($localStorage.mobileResponseCredentials.username, $localStorage.mobileResponseCredentials.password);
            }
        }

        init();

    }
]);