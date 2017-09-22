﻿mrApp.controller('MainController', [
    'ApiFactory', '$rootScope', '$scope', '$location','$window', '$localStorage', '$filter', '$timeout', 'ConversationsFactory', 'DeviceFactory', 'SharedState',
    function(apiFactory, $rootScope, $scope, $location, $window, $localStorage, $filter, $timeout, conversationsFactory, deviceFactory, SharedState) {

        $scope.inConversation = false;
        $scope.currentView = 'main';
        
        $scope.alertNewMessage = false;
        $scope.alertLoading = false;
        $scope.deviceType = 0;

        $scope.autoLoginAttempts = 0;

        var checkWhatsNew = function() {
            //console.log("What-is-new");
            conversationsFactory.whatIsNew(function(messages) {
                    if (messages != null && messages.length > 0) {
                        //BROADCAST
                        $scope.$broadcast('newMessages', messages);
                    }

                    //if (!deviceFactory.isDevice()) {
                    //$timeout(function() {
                    //        checkWhatsNew();
                    //    },
                    //    7000);
                    //}

                    $timeout(function() {
                            checkWhatsNew();
                        },
                        7000);

                },
                function(error) {
                    console.log("ERROR What-is-new:");
                    console.log(error);
                });
        };

        var checkIfInactive = function () {
            var inactiveMinutes = apiFactory.getMinutesSinceLastCall();
            //console.log(inactiveMinutes);
            if (inactiveMinutes >= 5) {
                $scope.$broadcast('userIsInactive', { "inactiveMinutes": inactiveMinutes });
            }
            $timeout(function() {
                checkIfInactive();
            },
            (20 * 1000));
        };

        function onInactiveUser(event, state) {
            //console.log(state);
            checkWhatsNew();
        }

        $scope.$on('userIsInactive', onInactiveUser);

        function onShowAlertNewMessage(event, state) {
            $scope.alertNewMessage = state;
        }

        // start subscribing
        $scope.$on('showAlertNewMessage', onShowAlertNewMessage);

        function onNewPush(event, state) {
            //console.log("Handle:newPush");
            //console.log(event);
            //console.log(state);
            checkWhatsNew();
        }

        function onResume(event, state) {
            checkWhatsNew();
        }

        function onLogout(event, state) {

            $rootScope.keepMeSignedIn = false;
            $localStorage.savedCredentials.keepMeSignedIn = $rootScope.keepMeSignedIn;
            $rootScope.authenticationToken = undefined;

            //$location.path('/login');
            //$window.location.reload();

            $timeout(function() {
                    $scope.$broadcast('reload', null);
                },
                100);
        }

        $scope.$on('logout', onLogout);

        function onReload(event, state) {
            $location.path('/login');
            $window.location.reload();
        }

        $scope.$on('reload', onReload);

        function onHttpCallError(event, state) {
            
            if (state.status === 401) { // Unauthorized => relogin
                $scope.autoLoginAttempts++;
                console.log("Main: Auto Authenticate" + $scope.autoLoginAttempts);

                if ($scope.autoLoginAttempts > 2) {
                    $scope.autoLoginAttempts = 0;
                    console.log("auto login failed, tried 3 times... ");
                    $scope.$broadcast('autoLoginFailed', state);
                } else {

                    apiFactory.functions.autoAuthenticate(function(response) {
                            if ($rootScope.currentInboxId != undefined) {
                                $location.path('/conversations/' + $rootScope.currentInboxId);
                            } else {
                                $location.path('/main');
                            }
                        },
                        function(error) {
                            console.log("auto login failed, redirect to login");
                            $location.path('/login/');
                        });
                }
            }
        }

        function onAutoLoginFailed(event, state) {
            $location.path('/login/');
        }

        function onAutoLoginFailedFinal(event, state) {
            console.log("Auto login failed final");
            $location.path('/login/');
        }

        function onHttpUnauthorized(event, state) {
            console.log("root signingin: " + $rootScope.signingin);
            console.log("root keep signedin: " + $rootScope.keepMeSignedIn);
            
            if (!$rootScope.signingin && $rootScope.keepMeSignedIn) {
                $scope.autoLoginAttempts++;
                console.log("Auto Authenticate" + $scope.autoLoginAttempts);

                if ($scope.autoLoginAttempts > 2) {
                    $scope.autoLoginAttempts = 0;
                    console.log("auto login failed, tried 3 times... ");
                    $scope.$broadcast('autoLoginFailedFinal', state);
                } else {

                    apiFactory.functions.autoAuthenticate(function(response) {
                            if ($rootScope.currentInboxId != undefined) {
                                $location.path('/conversations/' + $rootScope.currentInboxId);
                            } else {
                                $location.path('/main');
                            }
                        },
                        function(error) {
                            console.log("auto login failed");
                            $scope.$broadcast('autoLoginFailed', state);
                        });
                }
            }
        }

        function onLoading(event, state) {
            // TODO: detect slow loading, show info banner/modal after X sec
            $scope.alertLoading = state;
            //console.log("loading: " + state);
        }
        
        function onViewChanged(event, currentViewName) {
            $scope.currentView = currentViewName;
            //console.log($scope.currentView);
        }
        

        $scope.$on('loading', onLoading);

        $scope.$on('newPush', onNewPush);

        $scope.$on('appResumed', onResume);

        $scope.$on('httpCallError', onHttpCallError);

        $scope.$on('autoLoginFailed', onAutoLoginFailed);

        $scope.$on('autoLoginFailedFinal', onAutoLoginFailedFinal);

        $scope.$on('httpUnauthorized', onHttpUnauthorized);
        
        $scope.$on('viewChanged', onViewChanged);

        $scope.Logout = function () {
            //console.log("Logout");
            onLogout();
        }

        $scope.hideConversation = function () {
            $scope.currentView = 'conversations';
        };

        $scope.hideGroupMembers = function () {
            $scope.currentView = 'groups-list';
        };

        $scope.swipeRight = function () {
            console.log("SwipeRight: " + $scope.currentView);
            if ($scope.currentView === 'conversation') {
                $location.path('/conversations/' + $scope.inboxes[0].inboxId);
            } else {
                SharedState.turnOn('mainSidebar');
            }
        };
        
        function onViewLoaded() {
            
            $scope.deviceType = deviceFactory.getDeviceTypeId();

            //var token = $rootScope.authenticationToken;
            var token = apiFactory.authenticationToken();

            if (token != undefined) {

                if ($scope.inboxes == undefined) {

                    listInboxes(token,
                        function (response) {

                            getInbox(token,
                                $scope.inboxes[0].inboxId,
                                function (response) {
                                    if ($scope.inboxes[0].inboxId != undefined) {
                                        $location.path('/conversations/' + $scope.inboxes[0].inboxId);
                                    }
                                });
                            checkWhatsNew();
                            checkIfInactive();
                        });

                }
            }
        }

        $scope.$on('$viewContentLoaded', onViewLoaded);

        $rootScope.validateLoad = function(part) {
            if (part == 'inboxes') {
                if ($scope.inboxes != undefined) {
                    return true;
                }
            } else if (part == 'inbox') {
                if ($scope.inbox != undefined) {
                    return true;
                }
            } else if (part == 'profile') {
                if ($rootScope.myAppUser != undefined) {
                    return true;
                }
            } else if (part == 'logout') {
                if ($rootScope.authenticationToken != undefined) {
                    return true;
                }
            } else if (part == 'newConversation') {
                if ($rootScope.authenticationToken != undefined) {
                    return true;
                }
            }
            else if (part == 'connect') {
                if ($rootScope.myAppUser != undefined) {
                    var userMetaData = $rootScope.myAppUser.metaData;
                    if (userMetaData != undefined) {
                        if (userMetaData[0].mobileresponse === "allow") {
                            return true;
                        } 
                    }
                }
            }
            else if (part == 'mobileresponse') {
                if ($rootScope.mobileResponseToken != undefined) {
                    return true;
                }
            }

            return false;
        };

        function listInboxes(token, callback) {

            var listInboxesRequest = {
                authenticationToken: token,
                data: {
                    'pageIndex': 0,
                    'pageSize': 10
                }
            };
            apiFactory.functions.call('inboxes/list',
                listInboxesRequest,
                function (response) {
                    $scope.inboxes = response.data.items;
                    callback(response);
                },
                function(error) {

                });

        }

        function getInbox(token, inboxId, callback) {

            var getInboxRequest = {
                authenticationToken: token,
                data: {
                    'inboxId': inboxId
                }
            };
            apiFactory.functions.call('inboxes/details',
                getInboxRequest,
                function(response) {
                    $scope.inbox = response.data;
                    callback();
                });

        }



    }
]);
