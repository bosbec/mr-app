angular.module('ApiFactory', [])
    .factory('ApiFactory', ['$rootScope', '$http', '$localStorage','moment', function ($rootScope, $http, $localStorage, moment) {

            var authenticationToken;
            var lastCallTimestamp;
            var tokenExpiresTimestamp;

            var apiSettings = {
                baseApiUrl: 'https://appapi.mobileresponse.io/1/',
                //baseApiUrl: 'http://appapi.test.mobileresponse.se/1/',
                instanceName: 'mobileresponse',
                method: 'POST'
            };

            var appUser = {};

            function getAuthenticationToken() {
                return authenticationToken;
            }

            function getLastCallTimestamp() {
                return lastCallTimestamp;
            }

            function getTokenExpiresTimestamp() {
                return tokenExpiresTimestamp;
            }

            function getMinutesSinceLastCall() {
                return moment.utc().diff(moment.utc(getLastCallTimestamp()), "minutes");
            }

            function getMinutesUntilTokenExpires() {
                return moment.utc().diff(moment.utc(getTokenExpiresTimestamp()), "minutes");
            }

            function autoAuthenticate(callback, error) {
                var storedCredentials = $localStorage.savedCredentials;

                if (storedCredentials === undefined) {
                    console.log("missing credentials");
                    error(function () {
                        return "missing credentials";
                    });
                } else {
                    var credentials = {
                        'instanceName': apiSettings.instanceName,
                        'UserName': storedCredentials.userName,
                        'Password': storedCredentials.password
                    };
                    authenticate(credentials, callback, error);
                }
            }

            function authenticate(userCredentials, callback, error) {
                var request = { data: userCredentials };
                //console.log(request);
                call('authentication/authenticate',
                    request,
                    function(response) {
                        //console.log("Authenticate");
                        //console.log(response);
                        if (response.data != null) {
                            angular.copy({ appUserId: response.data.appUserId }, appUser);
                            authenticationToken = response.data.id;
                            $rootScope.authenticationToken = response.data.id;
                            tokenExpiresTimestamp = response.data.expiresOn;
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
                $rootScope.$broadcast('loading', true);
                $http({
                        url: apiSettings.baseApiUrl + url,
                        method: apiSettings.method,
                        data: request
                    })
                    .then(function(response) {
                            $rootScope.$broadcast('loading', false);
                            if (response.data.status === "Unauthorized") {
                                $rootScope.$broadcast('httpUnauthorized', response);
                            }
                            lastCallTimestamp = response.data.time;
                            callback(response.data);
                        },
                    function (e) {
                            $rootScope.$broadcast('loading', false);
                            if (e.status === 401) {
                                $rootScope.$broadcast('httpUnauthorized', e);
                            } else {
                                $rootScope.$broadcast('httpCallError', e);
                            }
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
                myAppUser: appUser,
                getLastCallTimestamp: getLastCallTimestamp,
                getTokenExpiresTimestamp: getTokenExpiresTimestamp,
                getMinutesSinceLastCall: getMinutesSinceLastCall,
                getMinutesUntilTokenExpires: getMinutesUntilTokenExpires,
                functions: {
                    autoAuthenticate: autoAuthenticate,
                    authenticate: authenticate,
                    call: call,
                    callReturnId: callReturnId
                }
            };

        }
    ]);
