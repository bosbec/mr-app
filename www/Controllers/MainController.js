mrApp.directive('iframeOnload',
    [
        function () {
            return {
                scope: {
                    callBack: '&iframeOnload'
                },
                link: function (scope, element, attrs) {
                    element.on('load',
                        function () {
                            return scope.callBack();
                        });
                }
            }
        }
    ]);

mrApp.controller('FormModalController',
[
    '$scope', '$timeout', 'SharedState',
    function($scope, $timeout, SharedState) {

        $scope.activeFormUrl = "Partials/loading.htm";
        
        function loadIframe() {
            //console.log("iFrameLoaded: " + SharedState.get('formModalUrl'));
            if ($scope.activeFormUrl !== SharedState.get('formModalUrl')) {
                console.log("change iframe", SharedState.get('formModalUrl'));
                $scope.activeFormUrl = SharedState.get('formModalUrl');
            }
        }

        $scope.iframeLoadedCallBack = function (event) {
            console.log("iframe loaded callback: ", $scope.activeFormUrl);
            //loadIframe();
        }

        function init() {
            //console.log("Init: " + SharedState.get('formModalUrl'));
            $timeout(function() {
                    loadIframe();
                },
                2000);
        }

        init();

    }
]);

mrApp.controller('MainController', [
    'ApiFactory', '$rootScope', '$scope', '$location','$window', '$localStorage', '$filter', '$timeout', 'ConversationsFactory', 'DeviceFactory','SettingsFactory','UsersFactory', 'SharedState',
    function(apiFactory, $rootScope, $scope, $location, $window, $localStorage, $filter, $timeout, conversationsFactory, deviceFactory,settingsFactory,usersFactory, SharedState) {

        $scope.inConversation = false;
        $scope.currentView = 'main';
        
        $scope.alertNewMessage = false;
        $scope.alertLoading = false;
        $scope.deviceType = 0;

        $scope.loadingInformation = "";

        $scope.autoLoginAttempts = 0;

        $scope.showOverride = false;
        $scope.showCreateNewConversation = false;

        var checkWhatsNew = function() {
            //console.log("What-is-new");
            conversationsFactory.whatIsNew(function(messages) {
                    if (messages !== null && messages.length > 0) {
                        //BROADCAST
                        $scope.$broadcast('newMessages', messages);
                    }

                    //if (!deviceFactory.isDevice()) {
                    //    $timeout(function() {
                    //            checkWhatsNew();
                    //        },
                    //        (settingsFactory.getCheckWhatsNewInterval() * 1000));
                    //}

                    $timeout(function() {
                            checkWhatsNew();
                        },
                        (settingsFactory.getCheckWhatsNewInterval() * 1000));

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
            (20*1000));
        };

        function onInactiveUser(event, state) {
            //console.log(state);
            checkWhatsNew();
        }

        $scope.$on('userIsInactive', onInactiveUser);

        function onNewMessages(event, messages) {
            //console.log("onNewMessage: ", messages);
            var showNotification = function (title, options) {

                if (window.hasOwnProperty("Notification")) {

                    if (["granted", "denied"].indexOf(Notification.permission) === -1) {
                        Notification.requestPermission().then(function (result) {
                            showNotification(title, options);
                        });
                        return;

                    } else if (Notification.permission === "granted") {
                        var notification = new Notification(title, options);
                        notification.onclick = function (event) {
                            window.focus();
                            this.close();
                        };
                    }
                }

            };
            var flag = true;
            for (var i = messages.length-1; i >= 0 && flag; i--) {
                if (messages[i].authorId !== usersFactory.myUser().id) {
                    // new message - not from myself
                    showNotification("" + messages[0].authorDisplayName,
                    {
                        icon: 'https://s3-eu-west-1.amazonaws.com/mobileresponse-files/Logo.png',
                        body: '' + messages[0].content,
                        silent: true
                        });
                    flag = false;
                } 
            }
            
        }

        $scope.$on('newMessages', onNewMessages);

        function onShowAlertNewMessage(event, state) {
            $scope.alertNewMessage = state;
        }

        // start subscribing
        $scope.$on('showAlertNewMessage', onShowAlertNewMessage);

        function onPushNotification(event, state) {
            console.log("onPushNotification", state);
            //alert("onNewPush:" + state);
            var conversationId = state.userdata.c;
            console.log("goto conversation: " + conversationId);
            $location.path('/messages/' + conversationId);
            //checkWhatsNew();
        }

        function onPushReceived(event, state) {
            console.log("onPushReceived", state);
            //alert("onNewPush:" + state);
            checkWhatsNew();
        }

        function onResume(event, state) {
            console.log("onResume", state);
            checkWhatsNew();
        }

        function onLogout(event, state) {

            $rootScope.keepMeSignedIn = false;
            $localStorage.savedCredentials.keepMeSignedIn = $rootScope.keepMeSignedIn;
            $rootScope.authenticationToken = undefined;
            $localStorage.mobileResponseCredentials = null;

            if (deviceFactory.isDevice()) {
                deviceFactory.unregisterDevice(
                    function(status) {
                        console.log("unregisteredDevice success", status);
                    },
                    function(status) {
                        console.log("unregisteredDevice error", status);
                    });
            }

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

        $scope.$on('pushNotification', onPushNotification);

        $scope.$on('pushReceived', onPushReceived);

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
        
        $scope.OpenRightSidebar = function() {
            $rootScope.$broadcast('openRightSidebar', null);
        };

        $scope.startConversation = function() {
            $rootScope.$broadcast('startConversation', null);
        }

        $scope.IsEncrypted = function() {
            var conversation = conversationsFactory.getCurrentConversation();
            if (conversation != null) {
                return conversationsFactory.usesEncryption(conversation.itemId);
            } else {
                return false;
            }
        };

        //$scope.swipeRight = function () {
        //    console.log("SwipeRight: " + $scope.currentView);
        //    if ($scope.currentView === 'conversation') {
        //        $location.path('/conversations/' + $scope.inboxes[0].inboxId);
        //    } else {
        //        SharedState.turnOn('mainSidebar');
        //    }
        //};

        //$scope.swipeLeft = function () {

        //    // Ui.turnOff("mainSidebar");
        //    console.log("SwipeLeft: " + $scope.currentView);
        //    if ($scope.currentView === 'conversation') {
        //        alert("Do you really want to remove this conversation?");
        //        //$location.path('/conversations/' + $scope.inboxes[0].inboxId);
        //    } else {
        //        //SharedState.turnOn('mainSidebar');
        //    }
        //};

        $scope.OverrideLoading = function() {
            $scope.$emit('loadingDone', 'override');
        }

        function onLoadingDone(event, state) {
            $scope.mainLoading = { 'display': 'none' };
            $scope.app = { 'display': 'block' };

            if ($window.innerWidth >= 990) {
                SharedState.turnOn('mainSidebar');
            }
        }

        $scope.$on('loadingDone', onLoadingDone);

        function onLoadingInformation(event, state) {
            $scope.loadingTextContainer = { 'display': 'none' };
            $scope.loadingTextInformation = { 'display': 'block' };
            $scope.loadingInformation = "" + state;
        }

        $scope.$on('loadingInformation', onLoadingInformation);

        function onShowMainSidebar(event, state) {
            //console.log("showMainSidebar: ", SharedState.get('mainSidebar'));
            //console.log("width: " + $window.innerWidth + " height: " + $window.innerHeight);
            if ($window.innerWidth >= 990) {
                SharedState.turnOn('mainSidebar');
            }
        }

        $scope.$on('showMainSidebar', onShowMainSidebar);
        
        function onViewLoaded() {

            //console.log("onViewLoaded[Main]");

            $scope.deviceType = deviceFactory.getDeviceTypeId();
            settingsFactory.setDeviceTypeName(deviceFactory.getDeviceType());

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
                                        //console.log("viewLoaded -> conversations", $scope.inboxes[0].inboxId);
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

        $scope.$on('showNewConversation',function(event, args) {
            $scope.showCreateNewConversation = args;
        })



    }
]);
