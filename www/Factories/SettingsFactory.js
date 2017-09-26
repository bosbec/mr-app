angular.module('SettingsFactory', [])
    .factory('SettingsFactory',
    [
        '$localStorage',
        function($localStorage) {
            var defaultNumberOfConversations = 15;
            var defaultNumberOfMessages = 20;
            var formatTimestamp = true;
            var defaultCheckWhatsNewInterval = 5;

            function getSettings() {
                return $localStorage.settings;
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
                if (value > 0 && value < 3600) {
                    $localStorage.settings.checkWhatsNewInterval = parseInt(value);
                } else {
                    $localStorage.settings.checkWhatsNewInterval = defaultCheckWhatsNewInterval;
                }
                console.log("Check what is new interval: " + $localStorage.settings.checkWhatsNewInterval);
            }

            function initSettings() {
                if ($localStorage.settings === undefined) {
                    console.log("Init localStorage.settings");
                    $localStorage.settings = {
                        'numberOfConversations': defaultNumberOfConversations,
                        'numberOfMessages': defaultNumberOfMessages,
                        'checkWhatsNewInterval': defaultCheckWhatsNewInterval
                    };
                    console.log($localStorage.settings);
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

            function init() {
                initSettings();
            }

            init();

            return {
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
                clearLocalStorage: clearLocalStorage
            };
        }
    ]);