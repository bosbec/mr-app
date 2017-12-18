angular.module('DeviceFactory', [])
    .factory('DeviceFactory',
    [
        'ApiFactory', function(apiFactory) {

            function isAndroid() {
                return navigator.userAgent.indexOf("Android") > 0;
            }

            function isIOS() {
                return (navigator.userAgent.indexOf("iPhone") > 0 ||
                    navigator.userAgent.indexOf("iPad") > 0 ||
                    navigator.userAgent.indexOf("iPod") > 0);
            }

            function registerPushwooshAndroid(settings, callback, error) {

                console.log("[Android] Pushwoosh reg");

                var pushNotification = cordova.require("pushwoosh-cordova-plugin.PushNotification");
                
                //set push notifications handler
                document.addEventListener('push-notification',
                    function (event) {
                        console.log("addEventListener: push-notification",event);
                        var userData = event.notification.userdata;
                        
                        if (typeof (userData) != "undefined") {
                            //alert("[Android] PUSH: " + JSON.stringify(userData));
                            //console.warn('user data: ' + JSON.stringify(userData));
                        }

                        settings.onPush(event.notification);
                    }
                );

                document.addEventListener('push-receive',
                    function (event) {
                        console.log("addEventListener: push-receive", event);
                        var userData = event.notification.userdata;

                        if (typeof (userData) != "undefined") {
                            // handle custom notification data
                            console.warn('user data: ' + JSON.stringify(userData));
                        }

                        settings.onPush(event.notification);
                    }
                );
                
                pushNotification.onDeviceReady(
                {
                    projectid: settings.projectid,
                    appid: settings.appid
                });
                
                //register for push notifications
                pushNotification.registerDevice(
                    function(token) {
                        console.log('pushNotification.registerDevice token: ' + token);
                        callback(token.pushToken);
                    },
                    function(status) {
                        error(status);
                    }
                );
            }

            function registerPushwooshIOS(settings, callback, error) {

                //alert("[iOS] Pushwoosh reg");

                var pushNotification = cordova.require("pushwoosh-cordova-plugin.PushNotification");

                document.addEventListener('push-receive',
                    function (event) {
                        console.log("addEventListener: push-receive", event);
                        //var userData = event.notification.userdata;

                        //if (typeof (userData) != "undefined") {
                        //    // handle custom notification data
                        //    console.warn('user data: ' + JSON.stringify(userData));
                        //}

                        settings.onPush(event.notification);
                    }
                );

                //set push notification callback before we initialize the plugin
                document.addEventListener('push-notification',
                    function (event) {
                        console.log("addEventListener: push-notification", event);
                        //alert("New push iOS");
                        pushNotification.setApplicationIconBadgeNumber(0);

                        settings.onPush(event.notification);
                    }
                );

                pushNotification.onDeviceReady({ pw_appid: settings.appid });

                pushNotification.registerDevice(
                    function (token) {
                        console.log("registerDevice", token);
                        pushNotification.setApplicationIconBadgeNumber(0);
                        callback(token.pushToken);
                    },
                    function(status) {
                        error(status);
                    }
                );
                
                pushNotification.setApplicationIconBadgeNumber(0);

            }

            function getDeviceHardwareId(callback) {
                var pushNotification = cordova.require("pushwoosh-cordova-plugin.PushNotification");

                pushNotification.getPushwooshHWID(
                    function(token) {
                        //alert("HWID:" + token);
                        callback(token);
                    }
                );

            }

            function registerDeviceInMobileResponse(deviceToken, callback) {
                //alert("Register device in Mobile Response");

                //get hwid
                getDeviceHardwareId(function(hwid) {
                    // register device 
                    var registerDeviceRequest = {
                        authenticationToken: apiFactory.getToken(),
                        data: {
                            instanceName: apiFactory.apiSettings.instanceName,
                            userId: apiFactory.myAppUser.appUserId,
                            hardwareId: ''+ hwid,
                            pushToken: deviceToken,
                            deviceType: getDeviceTypeId(),
                            macAddress: ''
                        }
                    };
                    apiFactory.functions.call('users/update-device',
                        registerDeviceRequest,
                        function(response) {
                            //alert("Device registered in Mobile Response");
                            console.log(response);
                            callback(true);
                        },
                        function(status) {
                            //alert("Device registered failed in Mobile Response");
                            console.log(error);
                            error(status);
                        });
                });
            }

            function registerDevice(settings, callback) {
                if (isDevice()) {

                    document.addEventListener('deviceready',
                        function () {

                            document.addEventListener("resume", settings.onResume, false);

                            var afterRegisterSuccess = function(token) {
                                //console.log(token);
                                registerDeviceInMobileResponse(token,
                                    function() {
                                        callback(true);
                                    },
                                    function(e) {
                                        callback(false);
                                    });
                            };

                            var afterRegisterFail = function() {
                                alert("Register failed");
                                callback(false);
                            };

                            if (isAndroid()) {
                                registerPushwooshAndroid(settings, afterRegisterSuccess, afterRegisterFail);
                            }

                            if (isIOS()) {
                                registerPushwooshIOS(settings, afterRegisterSuccess, afterRegisterFail);
                            }

                        });

                } else {
                    callback(false);
                }
            }

            function unregisterDevicePushwoosh(callback, error) {
                var pushNotification = cordova.require("pushwoosh-cordova-plugin.PushNotification");

                pushNotification.unregisterDevice(
                    function (status) {
                        callback(status);
                    },
                    function (status) {
                        error(status);
                    }
                );
            }

            function unregisterDeviceInMobileResponse(callback, error) {
                //alert("Register device in Mobile Response");

                //get hwid
                getDeviceHardwareId(function (hwid) {
                    // register device 
                    var registerDeviceRequest = {
                        authenticationToken: apiFactory.getToken(),
                        data: {
                            hardwareId: '' + hwid
                        }
                    };
                    apiFactory.functions.call('users/unregister-device',
                        registerDeviceRequest,
                        function (response) {
                            //alert("Device unregistered in Mobile Response");
                            console.log(response);
                            callback(true);
                        },
                        function (status) {
                            //alert("Device unregister failed in Mobile Response");
                            console.log(error);
                            error(status);
                        });
                });
            }

            function unregisterDevice(callback) {
                if (isDevice()) {
                    //unregisterDevicePushwoosh(function () {

                    //        document.removeEventListener('deviceready',
                    //            function() {

                    //            });

                            unregisterDeviceInMobileResponse(
                                function() {
                                    callback(true);
                                },
                                function(error) {
                                    callback(false);
                                });
                //        },
                //        function() {

                //        });
                } else {
                    callback(true);
                }
                
            }

            function isDevice() {
                
                if (typeof window.cordova === 'object') {
                    return true;
                } else {
                    return false;
                }
            }

            function getDeviceType() {
                if (isDevice()) {
                    if (isAndroid()) {
                        return "Android";
                    } else if (isIOS()) {
                        return "iOS";
                    } else {
                        return "Other";
                    }

                } else {
                    return "Web";
                }
            }

            function getDeviceTypeId() {
                if (isDevice()) {
                    if (isAndroid()) {
                        return 3;
                    } else if (isIOS()) {
                        return 1;
                    } else {
                        return 0;
                    }

                } else {
                    return 0;
                }
            }
            
            return {
                registerDevice: registerDevice,
                unregisterDevice: unregisterDevice,
                isDevice: isDevice,
                getDeviceType: getDeviceType,
                getDeviceTypeId: getDeviceTypeId
            };

        }
    ]);