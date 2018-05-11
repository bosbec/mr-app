
var mrApp = angular.module('mrApp', [
    'ngCordova',
    'ngRoute',
    'ngStorage',
    'ApiFactory',
    'mobile-angular-ui',
    'mobile-angular-ui.gestures',
    'angularMoment',
    'ngSanitize',
    'UsersFactory',
    'ConversationsFactory',
    'DeviceFactory',
    'SettingsFactory',
    'MobileResponseFactory',
    'EncryptionFactory'
]);

mrApp.run(function () {
    console.log("--- RUN ---");

});

mrApp.filter('trustUrl', ['$sce', function ($sce) {
  return function(url) {
    return $sce.trustAsResourceUrl(url);
  };
}]);




