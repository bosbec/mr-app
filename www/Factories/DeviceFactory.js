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

            function isWindowsStore() {
                if (typeof window.Windows === 'object') {
                    return true;
                } else {
                    return false;
                }
            }

            function registerPushwooshAndroid(settings, callback, error) {

                console.log("[Android] Pushwoosh reg");

                var pushNotification = cordova.require("pushwoosh-cordova-plugin.PushNotification");
                
                //set push notifications handler
                document.addEventListener('push-receive',
                    function (event) {
                        console.log("addEventListener: push-receive", event);
                        settings.onPushReceived(event.notification);
                    }
                );

                document.addEventListener('push-notification',
                    function (event) {
                        console.log("addEventListener: push-notification",event);
                        settings.onPushNotification(event.notification);
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
                        settings.onPushReceived(event.notification);
                    }
                );

                document.addEventListener('push-notification',
                    function (event) {
                        console.log("addEventListener: push-notification", event);
                        settings.onPushNotification(event.notification);
                        pushNotification.setApplicationIconBadgeNumber(0);
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

            function registerBrowserInMobileResponse(deviceToken, callback) {
                //alert("Register device in Mobile Response");

                    // register device 
                var registerDeviceRequest = {
                    authenticationToken: apiFactory.getToken(),
                    data: {
                        instanceName: apiFactory.apiSettings.instanceName,
                        userId: apiFactory.myAppUser.appUserId,
                        hardwareId: '',
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

            }

            function registerDevice(settings, callback) {
                if (isDevice()) {

                    document.addEventListener('deviceready',
                        function () {

                            document.addEventListener("resume", settings.onResume, { passive: false });

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

            function registerBrowser(settings, callback) {

                var showNotification = function(title, options) {
                    if (window.hasOwnProperty("Notification")) {
                        if (["granted", "denied"].indexOf(Notification.permission) === -1) {
                            Notification.requestPermission().then(function(result) {
                                showNotification(title, options);
                            });
                            return;
                        } else if (Notification.permission === "granted") {
                            var notification = new Notification(title, options);
                        }
                    }
                };

                registerDeviceInMobileResponse(token,
                    function () {
                        callback(true);
                    },
                    function (e) {
                        callback(false);
                    });


                //var Pushwoosh = Pushwoosh || [];
                //Pushwoosh.push(['init', {
                //    logLevel: 'info', // possible values: error, info, debug
                //    applicationCode: 'XXXXX-XXXXX', // you application code from Pushwoosh Control Panel
                //    safariWebsitePushID: 'web.com.example.domain', //  unique reverse-domain string, obtained in you Apple Developer Portal. Only needed if you send push notifications to Safari browser
                //    defaultNotificationTitle: 'Bosbec', // sets a default title for push notifications
                //    defaultNotificationImage: 'https://yoursite.com/img/logo-medium.png', // URL to custom custom notification image
                //    autoSubscribe: false, // or true. If true, prompts a user to subscribe for pushes upon SDK initialization
                //    subscribeWidget: {
                //        enabled: true
                //    },
                //    userId: 'user_id', // optional, set custom user ID
                //    tags: {
                //        'Name': 'John Smith'   	// optional, set custom Tags
                //    }
                //}]);
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
                    if (typeof window.Windows === 'object') {
                        return true; // we will act on windows store app as device to enable push registration
                    }
                    return false;
                }
            }

            function getDeviceType() {
                if (isDevice()) {
                    if (isAndroid()) {
                        return "Android";
                    } else if (isIOS()) {
                        return "iOS";
                    } else if (isWindowsStore()) {
                        return "WindowsStore";
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
                    } else if (isWindowsStore()) {
                        return 4;
                    } else {
                        return 0;
                    }

                } else {
                    return 0;
                }
            }
            
            return {
                registerDevice: registerDevice,
                registerBrowser: registerBrowser,
                unregisterDevice: unregisterDevice,
                isDevice: isDevice,
                getDeviceType: getDeviceType,
                getDeviceTypeId: getDeviceTypeId
            };

        }
    ]);