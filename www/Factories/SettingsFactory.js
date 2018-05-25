angular.module('SettingsFactory', [])
    .factory('SettingsFactory',
    [
        '$localStorage',
        function ($localStorage) {

            var appId = "com.bosbec.mr-app";
            var appVersion = "0.3.79";
            var appPushId = "64032-F5A58";
            //var appId = "se.bosbec.Messmr1";
            //var appVersion = "4.0.13";
            //var appPushId = "5C009-84885";

            var defaultNumberOfConversations = 15;
            var defaultNumberOfMessages = 20;
            var formatTimestamp = true;
            var defaultCheckWhatsNewInterval = 20;

            function getUrls() {
                // production
                return {
                    "appapi": "https://appapi.bosbec.io/1/",
                    "api2": "https://api2.bosbec.io/",
                    "apps": "https://apps.bosbec.io/#",
                    "forms": "https://form.bosbec.io/#!/form/",
                    "rest": "https://rest.bosbec.io/2/"
                };
                //// test
                //return {
                //    "appapi": "http://appapi.test.mobileresponse.se/1/",
                //    "api2": "http://api2-test.bosbec.io/",
                //    "apps": "http://apps-test.bosbec.io/#",
                //    "forms": "http://form-test.bosbec.io/#!/form/",
                //    "rest": "http://rest.test.mobileresponse.se/2"
                //};
            }

            function getBosbecUrls() {
                return [
                    'https://apps.bosbec.io',
                    'https://apps-test.bosbec.io',
                    'https://apps.mobileresponse.io',
                    'https://apps.mobileresponse.se',
                    'https://m.bosbec.io',
                    'https://m.mobileresponse.io',
                    'https://m.mobileresponse.se',
                    'http://apps.bosbec.io',
                    'http://apps.mobileresponse.io',
                    'http://apps.mobileresponse.se',
                    'http://m.bosbec.io',
                    'http://m.mobileresponse.io',
                    'http://m.mobileresponse.se',
                    'https://qlnk.se',
                    'http://qlnk.se',
                    'http://form-test.bosbec.io',
                    'https://form.bosbec.io'
                ];
            }

            function getSettings() {
                return $localStorage.settings;
            }

            function getDeviceTypeName() {
                if ($localStorage.deviceTypeName === undefined) {
                    return "unknown";
                }
                return $localStorage.deviceTypeName;
            }

            function setDeviceTypeName(deviceTypeName) {
                $localStorage.deviceTypeName = deviceTypeName;
            }

            function getNumberOfConversations() {
                if ($localStorage.settings.numberOfConversations === undefined) {
                    $localStorage.settings.numberOfConversations = defaultNumberOfConversations;
                }
                return $localStorage.settings.numberOfConversations;
            }

            function getNumberOfMessages() {
                if ($localStorage.settings.numberOfMessages === undefined) {
                    $localStorage.settings.numberOfMessages = defaultNumberOfMessages;
                }
                return $localStorage.settings.numberOfMessages;
            }

            function getCheckWhatsNewInterval() {
                if ($localStorage.settings.checkWhatsNewInterval === undefined) {
                    $localStorage.settings.checkWhatsNewInterval = defaultCheckWhatsNewInterval;
                }
                return $localStorage.settings.checkWhatsNewInterval;
            }

            function setNumberOfConversations(value) {
                if (value > 0 && value < 1000) {
                    $localStorage.settings.numberOfConversations = parseInt(value);
                } else {
                    $localStorage.settings.numberOfConversations = defaultNumberOfConversations;
                }
                console.log("Number of conversations: " + $localStorage.settings.numberOfConversations);
            }

            function setNumberOfMessages(value) {
                if (value > 0 && value < 1000) {
                    $localStorage.settings.numberOfMessages = parseInt(value);
                } else {
                    $localStorage.settings.numberOfMessages = defaultNumberOfMessages;
                }
                console.log("Number of messages: " + $localStorage.settings.numberOfMessages);
            }

            function setCheckWhatsNewInterval(value) {
                if (value > 4 && value < 3600) {
                    $localStorage.settings.checkWhatsNewInterval = parseInt(value);
                } else {
                    $localStorage.settings.checkWhatsNewInterval = defaultCheckWhatsNewInterval;
                }
                console.log("Check what is new interval: " + $localStorage.settings.checkWhatsNewInterval);
            }

            function initSettings() {
                if ($localStorage.settings === undefined) {
                    //console.log("Init localStorage.settings");
                    $localStorage.settings = {
                        'numberOfConversations': defaultNumberOfConversations,
                        'numberOfMessages': defaultNumberOfMessages,
                        'checkWhatsNewInterval': defaultCheckWhatsNewInterval
                    };
                    //console.log($localStorage.settings);
                }
            }

            function setShowIntro(state) {
                $localStorage.showIntro = state;
                console.log("ShowIntro: " + $localStorage.showIntro);
            }

            function clearLocalStorage() {
                $localStorage.$reset();
                console.log("LocalStorage: reset");
            }

            function setFormatTimestamp(state) {
                // state true/false
                $localStorage.formatTimestamp = state;
            }

            function getFormatTimestamp() {
                if ($localStorage.formatTimestamp) {
                    return formatTimestamp;
                } else {
                    return $localStorage.formatTimestamp;
                }
            }

            function getAppId() {
                return appId;
            }

            function getAppVersion() {
                return appVersion;
            }

            function getAppPushId() {
                return appPushId;
            }

            function init() {
                initSettings();
            }

            init();

            return {
                getUrls: getUrls,
                getBosbecUrls: getBosbecUrls,
                initSettings: initSettings,
                getSettings: getSettings,
                getNumberOfConversations: getNumberOfConversations,
                getNumberOfMessages: getNumberOfMessages,
                getCheckWhatsNewInterval: getCheckWhatsNewInterval,
                setNumberOfConversations: setNumberOfConversations,
                setNumberOfMessages: setNumberOfMessages,
                setCheckWhatsNewInterval: setCheckWhatsNewInterval,
                setShowIntro: setShowIntro,
                setFormatTimestamp: setFormatTimestamp,
                getFormatTimestamp: getFormatTimestamp,
                clearLocalStorage: clearLocalStorage,
                getAppId: getAppId,
                getAppVersion: getAppVersion,
                getAppPushId: getAppPushId,
                setDeviceTypeName: setDeviceTypeName,
                getDeviceTypeName: getDeviceTypeName
            };
        }
    ]);