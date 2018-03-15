mrApp.controller('LogoutController', [
    '$rootScope', '$localStorage', '$location', '$window', '$timeout', 'DeviceFactory',
    function ($rootScope, $localStorage, $location, $window, $timeout, deviceFactory) {

        function afterLogout(delayTime) {
            $timeout(function () {
                $location.path('/login');
                $window.location.reload();
            }, delayTime);
        }

        function init() {
            console.log("LOGOUT");
        }

        init();
    }
]);

