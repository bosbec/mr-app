mrApp.controller('SettingsController',
[
    '$scope','$timeout','SettingsFactory','ApiFactory',
    function ($scope,$timeout, settingsFactory,apiFactory) {

        $scope.successText = null;
        $scope.errorText = null;

        function showAlert(text, type, duration) {
            if (type === 'success') {
                $scope.successText = text;
                $timeout(function () {
                    $scope.successText = null;
                }, duration);
            }
            if (type === 'error') {
                $scope.errorText = text;
                $timeout(function () {
                    $scope.errorText = null;
                }, duration);
            }

        }

        $scope.numberOfConversations = 10;
        $scope.numberOfMessages = 10;
        $scope.showIntro = false;
        $scope.tokenExpiresTimestamp = null;
        $scope.tokenExpiresIn = null;
        $scope.formatTimestamp = true;
        $scope.checkWhatsNewInterval = 5; //Seconds

        $scope.SaveSettings = function () {
            settingsFactory.setNumberOfConversations($scope.numberOfConversations);
            settingsFactory.setNumberOfMessages($scope.numberOfMessages);
            settingsFactory.setCheckWhatsNewInterval($scope.checkWhatsNewInterval);
            settingsFactory.setShowIntro($scope.showIntro);
            settingsFactory.setFormatTimestamp($scope.formatTimestamp);
            showAlert('Settings saved', 'success', 5000);
        };

        $scope.ClearLocalStorage = function() {
            settingsFactory.clearLocalStorage();
            $scope.$emit('reload', 'reload');
        };

        function init() {
            $scope.numberOfConversations = settingsFactory.getNumberOfConversations();
            $scope.numberOfMessages = settingsFactory.getNumberOfMessages();
            $scope.tokenExpiresTimestamp = apiFactory.getTokenExpiresTimestamp();
            $scope.tokenExpiresIn = apiFactory.getMinutesUntilTokenExpires();
            $scope.formatTimestamp = settingsFactory.getFormatTimestamp();
            $scope.checkWhatsNewInterval = settingsFactory.getCheckWhatsNewInterval();
            if ($scope.formatTimestamp === undefined) {
                $scope.formatTimestamp = true;
            }
        }
        
        init();

    }
]);