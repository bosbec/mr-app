angular.module('MobileResponseFactory', [])
    .factory('MobileResponseFactory', [
        '$rootScope', '$http', '$localStorage','ApiFactory','SettingsFactory',
        function ($rootScope, $http, $localStorage, apiFactory, settingsFactory) {

            var authenticationToken;
            var lastCallTimestamp;

            var apiSettings = {
                baseApiUrl: settingsFactory.getUrls().api2,
                method: 'POST'
            };

            var administrator = {};

            function getAuthenticationToken() {
                return authenticationToken;
            }

            function getLastCallTimestamp() {
                return lastCallTimestamp;
            }

            function autoAuthenticate(callback, error) {
                var storedCredentials = $localStorage.mobileResponseCredentials;
                if (storedCredentials === null || storedCredentials === undefined) {
                    error("missing credentials");
                } else {
                    if (storedCredentials.appUserId != apiFactory.myAppUser.appUserId) {
                        error("Incorrect credentials");
                    } else {
                        authenticate(storedCredentials, callback, error);
                    }
                }
            }

            function authenticate(userCredentials, callback, error) {
                var request = { data: userCredentials };
                //console.log(request);
                call('authenticate',
                    request,
                    function(response) {
                        if (response.data != null) {
                            //console.log(response.data);
                            angular.copy({ administrator: response.data.administratorId }, administrator);
                            authenticationToken = response.data.id;
                            $rootScope.mobileResponseToken = response.data.id;
                            callback(response.data.id);
                        } else {
                            callback(response.data);
                        }
                    },
                    function(e) {
                        error(e);
                    });
            }

            function call(url, request, callback, error) {
                $rootScope.$broadcast('mrLoading', true);
                $http({
                        url: apiSettings.baseApiUrl + url,
                        method: apiSettings.method,
                        timeout: 5*1000,
                        data: request
                    })
                    .then(function (response) {
                        $rootScope.$broadcast('mrLoading', false);
                            if (response.data.status === "Unauthorized") {
                                $rootScope.$broadcast('mrHttpUnauthorized', response);
                            }
                            lastCallTimestamp = response.data.time;
                            callback(response.data);
                        },
                        function (e) {
                            $rootScope.$broadcast('mrLoading', false);
                            $rootScope.$broadcast('mrHttpCallError', e);
                            console.log("mr auth fail", e);
                            error(e);
                        });
            }

            function callReturnId(url, request, callback, error) {
                call(url,
                    request,
                    function(response) {
                        callback(response.data.id);
                    },
                    function(e) {
                        error(e);
                    });
            }

            return {
                getToken: getAuthenticationToken,
                authenticationToken: getAuthenticationToken,
                apiSettings: apiSettings,
                administrator: administrator,
                lastCallTimestamp: getLastCallTimestamp,
                functions: {
                    autoAuthenticate: autoAuthenticate,
                    authenticate: authenticate,
                    call: call,
                    callReturnId: callReturnId
                }
            };

        }
    ]);
