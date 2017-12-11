mrApp.controller('LoginController', [
    'ApiFactory', '$rootScope', '$scope','$timeout', '$location', '$window', '$routeParams', '$localStorage','moment', 'UsersFactory', 'DeviceFactory', 'SettingsFactory', 'MobileResponseFactory', 'SharedState',
    function (apiFactory, $rootScope, $scope, $timeout, $location, $window, $routeParams, $localStorage,moment, usersFactory, deviceFactory, settingsFactory, mobileResponseFactory, SharedState) {
        
        var command = $routeParams.param1;

        if (command === "logout") {
            logout();
        }
        
        $scope.saveCredentials = true;
        $scope.keepMeSignedIn = true;
        $scope.signingin = false;

        $scope.successText = null;
        $scope.errorText = null;

        function showAlert(text, type, duration) {
            if (type == 'success') {
                $scope.successText = text;
                $timeout(function () {
                    $scope.successText = null;
                    $scope.signingin = false;
                }, duration);
            }
            if (type == 'error') {
                $scope.errorText = text;
                $timeout(function () {
                    $scope.errorText = null;
                    $scope.signingin = false;
                }, duration);
            }

        }

        $scope.error = {
            show: false,
            message: ''
        };

        function onHttpUnauthorized(event, state) {
            console.log("Login: onHttpUnauthorized");
            showAlert("Login failed! Password is incorrect", "error", 5000);
        }

        $scope.$on('httpUnauthorized', onHttpUnauthorized);

        function onAutoLoginFailedFinal(event, state) {
            console.log("Login: onAutoLoginFailedFinal");
            showAlert("Login failed final! Password is incorrect", "error", 5000);
        }

        $scope.$on('autoLoginFailedFinal(', onAutoLoginFailedFinal);

        function init() {
            $scope.$emit('viewChanged', 'login');
            settingsFactory.initSettings();
            $scope.credentials = $localStorage.savedCredentials;

            if ($localStorage.showIntro === undefined || $localStorage.showIntro) {
                // show intro...
                SharedState.initialize($scope, 'introModal', '');
                SharedState.turnOn('introModal');
            } else {
                if ($scope.credentials != null && $scope.credentials.keepMeSignedIn) {
                    login();
                }
            }

        }

        $scope.signin = {
            show: true,
            error: {
                show: false,
                message: ''
            }
        };

        function setSigningIn(state) {
            //is signing in
            if (state) {

            } else {
                
            }
            $scope.signingin = state;
            $rootScope.signingin = state;
        }

        $scope.ClearCredentials = function () {
            //console.log("Cleared credentials");
            $localStorage.savedCredentials = null;
            $scope.credentials = null;
        };

        $scope.registration = {
            show: false,
            error: {
                show: false,
                message: ''
            }
        };

        $scope.forgotPassword = {
            show: false,
            error: {
                show: false,
                message: ''
            }
        };

        $scope.ShowSignin = function () {
            $scope.registration.show = false;
            $scope.signin.show = true;
            $scope.forgotPassword.show = false;
        };

        $scope.ShowRegistration = function () {
            $scope.registration.show = true;
            $scope.signin.show = false;
            $scope.forgotPassword.show = false;
        };

        function clearRegistration() {
            $scope.register.userName = null;
            $scope.register.password = null;
            $scope.register.password2 = null;
        }

        $scope.ClearRegistration = function () {
            clearRegistration();
        };

        $scope.Register = function() {

            if (!$scope.registrationForm.$invalid) {

                var userName = $scope.register.userName;
                var password = $scope.register.password;
                var password2 = $scope.register.password2;

                if (password != password2) {
                    $scope.registration.error.show = true;
                    $scope.registration.error.message = "Passwords don't match";
                    $scope.register.password2 = null;
                    return false;
                }

                usersFactory.registerUser(apiFactory.apiSettings.instanceName,
                    userName,
                    password,
                    function(response) {
                        console.log("SUCCESS: Register response");
                        console.log(response);

                        if (response.data.userId != null) {
                            var newUserId = response.data.userId;
                            apiLogin(apiFactory.apiSettings.instanceName,
                                userName,
                                password,
                                function(response) {
                                    console.log("Register: ApiLogin");
                                    console.log(response);
                                    $location.path('/profile/' + newUserId);
                                    return true;
                                },
                                function(error) {

                                });
                        }

                    },
                    function(error) {
                        $scope.registration.error.show = true;
                        //$scope.registration.error.message = error[0].errorMessage;
                        //console.log("login register error: ", error);
                        $scope.registration.error.message = error.errorMessage;
                    });

            }
        };
        
        $scope.ShowForgotPassword = function () {
            $scope.forgotPassword.show = true;
            $scope.signin.show = false;
            $scope.registration.show = false;
        };

        $scope.RequestResetPassword = function (userName, phone, email) {
            console.log("Username: " + userName + " Email:" + email + " Phone: " + phone);
            if (userName === undefined) {
                userName = "";
            }
            if (email === undefined) {
                email = "";
            }
            if (phone === undefined) {
                phone = "";
            }

            usersFactory.requestResetPassword(userName,
                phone,
                email,
                function (response) {
                    //console.log("RequestResetPassword: success");
                    //console.log(response);
                    $scope.forgotPassword = {
                        show: true,
                        error: {
                            show: false,
                            message: ''
                        },
                        success: {
                            show: true,
                            message: 'We have sent a link to restore your password to ' + response.data.linkSentTo
                        }
                    };
                    $timeout(function() {
                            $scope.registration.show = false;
                            $scope.signin.show = true;
                            $scope.forgotPassword.show = false;
                        },
                        5000);
                },
                function (error) {
                    console.log("RequestResetPassword: error");
                    console.log(error);
                    $scope.forgotPassword = {
                        show: true,
                        error: {
                            show: true,
                            message: 'There is no email or phone to send restore password link to'
                        },
                        success: {
                            show: false,
                            message: ''
                        }
                    };
                });
        }

        function apiLogin(instanceName, userName, password, callback, error) {

            var credentials = {
                'instanceName': instanceName,
                'UserName': userName,
                'Password': password,
                'metaData': {
                    'deviceType': deviceFactory.getDeviceType()
                }
            };
            apiFactory.functions.authenticate(credentials,
                function (response) {
                    if (response != null) {

                        if ($scope.saveCredentials) {
                            $localStorage.savedCredentials = {
                                'userName': userName,
                                'password': password,
                                'deviceType': deviceFactory.getDeviceType(),
                                'keepMeSignedIn': $scope.keepMeSignedIn
                            };
                        }
                        $rootScope.keepMeSignedIn = $scope.keepMeSignedIn;
                        $rootScope.authenticationToken = response;

                        usersFactory.getUser(apiFactory.myAppUser.appUserId,
                            function(response) {
                                $rootScope.myAppUser = response;

                                mobileResponseFactory.functions.autoAuthenticate(
                                    function(response) {
                                        console.log("[SUCCESS] Mobile Response auto login");
                                    },
                                    function(error) {
                                        console.log("[WARN] Mobile Response auto login: " + error);
                                    });

                                var registerDeviceSettings = {
                                    "appid": "64032-F5A58",
                                    "projectid": "71435688512",
                                    "onPush": function(push) {
                                        //console.log("RootBroadcast: newPush");
                                        //alert('newPush');
                                        $rootScope.$broadcast('newPush', push);
                                    },
                                    "onResume": function() {
                                        //console.log("RootBroadcast: appResumed");
                                        //alert("appResumed");
                                        $rootScope.$broadcast('appResumed', true);
                                    }
                                };
                                //alert("isDevice: " + deviceFactory.isDevice);
                                if (deviceFactory.isDevice) {

                                    var statusFlag = false;

                                    $timeout(function() {
                                            if (!statusFlag) {
                                                //alert("timedout");
                                                callback(false);
                                            }
                                        },
                                        15000);

                                    deviceFactory.registerDevice(registerDeviceSettings,
                                        function (status) {
                                            statusFlag = true;
                                            if (status) {
                                                //alert("Device registered");
                                            } else {
                                                //alert("Device not registered"); 
                                            }
                                            callback(response);
                                        });

                                }
                            },
                            function(e) {
                                error(e);
                            });

                    } else {
                        error(response);
                    }
                },
                function (e) {

                    $scope.signin.error.message = "Login failed! User does not exist";

                    if (e.status === 401) {
                        $scope.signin.error.message = "Login failed! Password is incorrect";
                    }

                    $scope.signin.error.show = true;
                    console.log("Login failed");

                    error(e);
                });

        }

        function login() {
            console.log('--- LOGIN ---');
            setSigningIn(true);
            console.log("deviceType:", deviceFactory.getDeviceType());
            apiLogin(apiFactory.apiSettings.instanceName,
                $scope.credentials.userName,
                $scope.credentials.password,
                function (response) {
                    //console.log("login: " + response);
                    setSigningIn(false);

                    if (response.email == null && response.phoneNumber == null) {
                        $location.path('/profile/' + response.id);
                    }

                    if ($rootScope.currentInboxId != undefined) {
                        $location.path('/conversations/' + $rootScope.currentInboxId);
                    } else {
                        $location.path('/main');
                    }
                },
                function(error) {
                    setSigningIn(false);
                    $location.path('/login');
                });
        }

        $scope.Login = function () {
            if (!$scope.signinForm.$invalid) {
                login();
            }
        };
        
        init();

    }

]);

