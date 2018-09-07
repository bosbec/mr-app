mrApp.directive('enterSubmit', function () {
    return {
        restrict: 'A',
        link: function (scope, elem, attrs) {
            
            elem.bind('keydown', function (event) {
                //console.log(event);
                scope.$emit('showMainSidebar', 'messages');

                var code = event.keyCode || event.which;

                //enter=submit, shift+enter=line break
                if (code === 13 && event.ctrlKey) {
                    event.preventDefault();
                    scope.$apply(attrs.enterSubmit);
                }

            });
        }
    }
});

mrApp.controller('MessagesController',
[
    'ApiFactory', '$scope', '$location', '$routeParams', '$window', 'moment', 'UsersFactory', 'ConversationsFactory','$timeout', '$filter', 'SharedState', 'SettingsFactory', 'EncryptionFactory',
    function(apiFactory,$scope,$location,$routeParams,$window,moment,usersFactory,conversationsFactory,$timeout,$filter,SharedState,settingsFactory,encryptionFactory) {

        var conversationId = $routeParams.param1;
        $scope.conversation = null;
        $scope.newMessage = null;

        $scope.isSwipe = false;
        $scope.showHideMessage = false;

        $scope.currentPage = 1;
        $scope.pageSize = settingsFactory.getNumberOfMessages();
        $scope.totalPages = 1;

        $scope.successText = null;
        $scope.errorText = null;

        $scope.activeFormUrl = '';

        $scope.messages = {
        
        };

        $scope.openFormModal = function(formId) {
            var formUrl = settingsFactory.getUrls().forms + formId + "?appuserid=" + usersFactory.myUser().id;
            //console.log("openFormModal", formUrl);
            SharedState.set('formModalUrl', formUrl);
            SharedState.turnOn('formModal');
        };

        $scope.openBosbecFormInModal = function(url) {
            if (url.indexOf("?") >= 0) {
                url = url + "&";
            } else {
                url = url + "?";
            }
            url = url + "appuserid=" + usersFactory.myUser().id;
            //console.log("openBosbecFormInModal:", url);
            SharedState.set('formModalUrl', url);
            SharedState.turnOn('formModal');
        };

        $scope.openBosbecLinkInModal = function(url) {
            //console.log("openBosbecLinkInModal:" + url);
            SharedState.set('formModalUrl', url);
            SharedState.turnOn('formModal');
        };

        $scope.openExternalLink = function(url) {
            //console.log("openExternalLink:" + url);
            $window.open(url, '_blank');
        };

        function showAlert(text, type, duration) {
            if (type === 'success') {
                $scope.successText = text;
                $timeout(function() {
                        $scope.successText = null;
                    },
                    duration);
            }
            if (type === 'error') {
                $scope.errorText = text;
                $timeout(function() {
                        $scope.errorText = null;
                    },
                    duration);
            }

        }

        function init() {

            if ($scope.authenticationToken == undefined) {
                $location.path('/login');
            }
            listMessages($scope.authenticationToken, conversationId);
            $scope.conversation = conversationsFactory.getCurrentConversation();

            if ($scope.conversation != null) {
                $scope.conversation.viewSettings = "normal";
            }

            // check if conversation uses encryption 

            SharedState.initialize($scope, 'formModalUrl', '');

            $scope.$emit('viewChanged', 'conversation');
        }

        function linkify(text) {
            var urlRegex = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
            return text.replace(urlRegex,
                function(url) {
                    return '<a href="' + url + '" target="_blank" class="externalLink">' + url + '</a>';
                    //return '<a ng-click="openExternalLink(' + url + ');" class="externalLink">' + url + '</a>';
                });
        }

        function isBosbecExternalUrl(url) {
            var urls = settingsFactory.getBosbecUrls();
            for (var i = 0; i < urls.length; i++) {
                if (url.indexOf(urls[i]) === 0) {
                    //match => is bosbec url
                    return true;
                }
            }
            return false;
        }

        function handleLinks(text) {
            var urlRegex = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
            text = text.replace(urlRegex,
                function(url) {
                    //return '<a href="' + url + '" class="externalLink">' + url + '</a>';
                    // check if url is in settingsurls => our own
                    if (isBosbecExternalUrl(url)) {
                        // if form get formId and openFormModal() add ?appuserid
                        console.log("isBosbecUrl: " + url);
                        return '<a ng-click="openBosbecLinkInModal(\'' +
                            url +
                            '\');" class="externalLink" testdirective>' +
                            url +
                            '</a>';
                    } else {
                        return '<a href="' +
                            url +
                            '" target="_blank" class="externalLink" testdirective>' +
                            url +
                            '</a>';
                    }
                });
            return text;
        }

        function extractGuid(value) {
            var re = /([a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12})/i;

            // the RegEx will match the first occurrence of the pattern
            var match = re.exec(value);

            // result is an array containing:
            // [0] the entire string that was matched by our RegEx
            // [1] the first (only) group within our match, specified by the
            // () within our pattern, which contains the GUID value

            return match ? match[1] : null;
        }

        function addDynamicMetadata(message) {
            var urlRegex = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
            message.content = message.content.replace(urlRegex,
                function(url) {
                    // check if url is in settingsurls => our own
                    if (isBosbecExternalUrl(url)) {

                        var extractedValue = extractGuid(url);
                        if (extractedValue != null) {
                            message.metaData.push({
                                "_type": "bosbecForm",
                                "name": "Open form",
                                "url": url
                            });
                        } else {
                            message.metaData.push({
                                "_type": "bosbecLink",
                                "name": "Open link",
                                "url": url
                            });
                        }
                    } else {
                        message.metaData.push({
                            "_type": "externalLink",
                            "name": url,
                            "url": url
                        });
                    }
                    return " ";
                });
            return message;
        }

        function handleViewSettings(message) {
            if (message.metaData.length > 0) {
                message.metaData.forEach(function(item) {
                    if (item.name === "viewsetting") {
                        console.log("viewSetting: " + item.value);
                        $scope.conversation.viewSettings = item.value;
                    }
                });
            }
            return message;
        }

        function formatText(text) {
            var linebreakRegex = /([\n])/g;
            return text.replace(linebreakRegex,
                function(row) {
                    return "<br />";
                });
        }

        function parseAuthor(messages) {
            for (var i = 0; i < messages.length; i++) {
                if (angular.equals(messages[i].authorId, usersFactory.myUser().id)) {
                    messages[i].author = "me";
                } else {
                    messages[i].author = "other";
                }
            }
            return messages;
        }

        $scope.LoadMore = function() {
            var callback = function(messages) {
                //$scope.messages = [].concat($scope.messages, messages);
                $scope.messages = [].concat(messages, $scope.messages);
            };
            $scope.currentPage = $scope.currentPage + 1;
            getMessages(conversationId, $scope.currentPage, callback);
        };

        function getMessages(conversationId, pageIndex, callback) {
            var listMessagesRequest = {
                authenticationToken: $scope.authenticationToken,
                data: {
                    'conversationId': conversationId,
                    'sortAscending': false,
                    'pageIndex': pageIndex,
                    'pageSize': settingsFactory.getNumberOfMessages()
                }
            };
            apiFactory.functions.call('conversations/list-messages',
                listMessagesRequest,
                function (response) {
                    //console.log(response.data.items[0]);
                    $scope.totalPages = response.data.maxPages;
                    var formatTimestamp = settingsFactory.getFormatTimestamp();
                    var useEncryption = false;

                    for (var i = 0; i < response.data.items.length; i++) {

                        // check if encrypted -> decrypt content
                        if (response.data.items[i].metaData.length > 0) {
                            if ($filter('filter')(response.data.items[i].metaData, { 'name': 'encryptionkey' }).length > 0) {
                                //console.log("decrypt message",response.data.items[i]);
                                encryptionFactory.decryptMessage(response.data.items[i],
                                    function(decryptedMessage) {
                                        //console.log("success decrypt: ", decryptedMessage);
                                        useEncryption = true;
                                    },
                                    function (error) {
                                        console.log("error decrypt: ", error);
                                    });
                            } 
                        }
                        
                        response.data.items[i].content = formatText(response.data.items[i].content);
                        response.data.items[i] = addDynamicMetadata(response.data.items[i]);

                        if (response.data.items[i].metaData.length > 0) {
                            for (var j = 0; j < response.data.items[i].metaData.length; j++) {
                                if (response.data.items[i].metaData[j]._type === "form" ||
                                    response.data.items[i].metaData[j]._type === "messageMetaDataForm") {

                                    var formObj = angular.fromJson(response.data.items[i].metaData[j].value);
                                    response.data.items[i].formId = formObj.id;
                                }
                            }
                            
                        }
                        
                        if (formatTimestamp) {
                            response.data.items[i].createdOnFormatted = moment.utc(response.data.items[i].createdOn)
                                .fromNow();
                        } else {
                            response.data.items[i].createdOnFormatted = moment
                                .utc(response.data.items[i].createdOnDetail)
                                .format("YYYY-MM-DD HH:mm:ss.SSS");
                        }
                    }

                    response.data.items[0] = handleViewSettings(response.data.items[0]);
                    response.data.items = parseAuthor(response.data.items);
                    response.data.items = $filter('orderBy')(response.data.items, ['createdOnDetail', 'createdOn']);
                    callback(response.data.items);

                });
        }

        function listMessages(token, conversationId) {
            getMessages(conversationId,
                $scope.PageIndex,
                function(messages) {

                    $scope.messages = messages;
                    scrollToLast();

                    //console.log($scope.messages);

                    var markAsReadRequest = {
                        authenticationToken: $scope.authenticationToken,
                        data: {
                            'conversationId': conversationId
                        }
                    };
                    apiFactory.functions.call('conversations/conversation-read',
                        markAsReadRequest,
                        function(response) {
                            //console.log("Conversation is read: " + conversationId);
                        });
                });
        }

        function scrollToLast() {
            // TODO: add $watch last-message instead
            $timeout(function() {
                    var elem = angular.element(document.getElementById('chat-container'));
                    var scrollableContentController = elem.controller('scrollableContent');
                    scrollableContentController.scrollTo(angular.element(document.getElementById('last-message')));
                },
                400);
        }

        $scope.sendMessage = function(message) {
            if (message == null) {
                showAlert('No text in message', 'error', 1000);
            } else {
                this.newMessage = "";
                $scope.newMessage = "";

                var sendTo = [];

                angular.copy($scope.conversation.participants, sendTo);
                sendTo.push($scope.conversation.userId);

                var replyRequest = null;

                // if conversation.encrypted -> get key name, encrypt content and add encryption metadata
                if (conversationsFactory.usesEncryption(conversationId)) {
                    var newIv = encryptionFactory.generateIv();
                    var conversationKeyName = conversationsFactory.getEncryptionKeyName(conversationId);
                    encryptionFactory
                        .encryptMessage(message,
                            conversationKeyName,
                            newIv,
                            function(response) {
                                message = response;
                            },
                            function(error) {
                                console.log(error);
                            });

                    replyRequest = {
                        authenticationToken: $scope.authenticationToken,
                        data: {
                            'conversationId': conversationId,
                            'message': message,
                            'metaData': [
                                {
                                    '_type': 'generic',
                                    'groupOrder': 0,
                                    'contentType': 'text',
                                    'name': 'encryptiontype',
                                    'value': 'aes'
                                }, {
                                    '_type': 'generic',
                                    'groupOrder': 1,
                                    'contentType': 'text',
                                    'name': 'encryptionkey',
                                    'value': conversationKeyName
                                }, {
                                    '_type': 'generic',
                                    'groupOrder': 2,
                                    'contentType': 'text',
                                    'name': 'encryptioniv',
                                    'value': newIv
                                }
                            ]
                        }
                    };

                } else {
                    replyRequest = {
                        authenticationToken: $scope.authenticationToken,
                        data: {
                            'conversationId': conversationId,
                            'message': message,
                            'metaData': [{}]
                        }
                    };
                }

                apiFactory.functions.call('conversations/reply',
                    replyRequest,
                    function(response) {
                        showAlert('Message sent', 'success', 1000);
                        listMessages($scope.authenticationToken, conversationId);
                    },
                    function(error) {
                        showAlert('Message sent', 'error', 5000);
                        console.log(error);
                    });

            }

        };

        $scope.swipeRight = function() {
            // close conversation - back to conversations list
            $scope.isSwipe = true;
            $timeout(function() {
                    $location.path('/conversations/' + $scope.inboxes[0].inboxId);
                    $scope.isSwipe = false;
                },
                (100));
        };

        $scope.swipeLeft = function(message) {
            // hide/remove message
            $scope.isSwipe = true;
            $timeout(function() {
                    //console.log("message", message);
                    if (confirm("Do you want to hide '" + message.content.substr(0, 30) + "'")) {
                        conversationsFactory.hideMessage(conversationId,
                            message.messageId,
                            function(response) {
                                //console.log("reload after hide");
                                $location.path('/messages/' + conversationId + "/reload=" + message.messageId);
                            },
                            function(error) {
                                console.log("error on hide", error);
                            });
                    }
                    $scope.isSwipe = false;
                },
                (100));
        };


        // handler
        var onNewMessages = function(event, newMessages) {
            var reload = false;
            var foundConversations = $filter('filter')(newMessages, { conversationId: conversationId }, true);
            if (foundConversations.length > 0) {
                for (var i = 0; i < newMessages.length && !reload; i++) {
                    var foundMessage = $filter('filter')($scope
                        .messages,
                        { messageId: newMessages[i].messageId },
                        true);
                    if (foundMessage.length === 0) {
                        reload = true;
                    }
                }
            }
            if (reload) {
                listMessages($scope.authenticationToken, conversationId);
            }
            if (foundConversations.length === 0 && newMessages.length > 0) {
                $scope.$emit('showAlertNewMessage', true);
            }
        }

        // start subscribing
        $scope.$on('newMessages', onNewMessages);

        init();
    }
]);

