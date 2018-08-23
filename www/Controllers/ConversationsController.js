mrApp.controller('ConversationsController',[
    'ApiFactory', '$scope', '$rootScope', '$location', '$routeParams','$timeout', 'UsersFactory', 'ConversationsFactory','SettingsFactory','DeviceFactory','SharedState',
    function (apiFactory, $scope, $rootscope, $location, $routeParams, $timeout, usersFactory, conversationsFactory,settingsFactory, deviceFactory,SharedState) {

        var inboxId = $routeParams.param1;

        $scope.alertText = null;
        $scope.currentPage = 1;
        $scope.totalPages = 1;
        $scope.pageSize = settingsFactory.getNumberOfConversations();

        $scope.isSwipe = false;

        function init() {
            //console.log("conversation", inboxId);
            $scope.$emit('loadingInformation', 'Get conversations'); // loading info
            $scope.$emit('viewChanged', 'conversations');
            $rootscope.currentInboxId = inboxId;
            listConversations(apiFactory.getToken(), inboxId, $scope.currentPage);
        }

        function handleLinks(text) {
            var urlRegex = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
            return text.replace(urlRegex,
                function(url) {
                    return "";
                });
        }

        function formatConversationList(conversations) {
            var previewLength = 100;
            for (var i = 0; i < conversations.length; i++) {
                conversations[i].content = handleLinks(conversations[i].content);

                if (deviceFactory.isDevice()) {
                    if (conversations[i].content.length > previewLength) {
                        conversations[i].content = conversations[i].content.substr(0, previewLength) + " ...";
                    }
                }
            }
            return conversations;
        }

        function listConversations(token, inboxId, pageIndex) {
            var callback = function(conversations) {
                $scope.conversations = conversations;
                
                $scope.$emit('showAlertNewMessage', false);
                $scope.$emit('loadingDone', 'conversations'); // hides loading

                //console.log("conversations loaded", $scope.conversations);
                //console.log("conversations loaded");
            };
            getConversations(token, inboxId, $scope.currentPage, callback);
        }

        function getConversations(token, inboxId, pageIndex, callback) {
            conversationsFactory.listConversations(token,
                inboxId,
                pageIndex,
                settingsFactory.getNumberOfConversations(),
                function (conversationsObject) {
                    $scope.$emit('loadingInformation', 'Format conversations'); // loading info
                    $scope.totalPages = conversationsObject.maxPages;
                    callback(formatConversationList(conversationsObject.items));
                },
                function (error) {
                    console.log("getConversations", error);
                });
        }

        $scope.ListMessagesInConversation = function(conversation) {
            $timeout(function() {
                    if ($scope.isSwipe) {
                        console.log("Swipe, not click");
                    } else {

                        conversationsFactory.setCurrentConversation(conversation);
                        $location.path('/messages/' + conversation.itemId);
                    }
                },
                (10));
        };

        $scope.LoadMore = function () {
            var callback = function (conversations) {
                $scope.conversations = [].concat($scope.conversations, conversations);
                $scope.$emit('showAlertNewMessage', false);
            };
            $scope.currentPage = $scope.currentPage + 1;
            getConversations(apiFactory.getToken(), inboxId, $scope.currentPage, callback);
        };

        $scope.swipeRight = function (conversation) {
            // show sidebar/meny
            $scope.isSwipe = true;
            $timeout(function() {
                    SharedState.turnOn('mainSidebar');
                    $scope.isSwipe = false;
                },
                (100));
        };

        $scope.swipeLeft = function(conversation) {
            // hide/remove conversation
            $scope.isSwipe = true;
            $timeout(function() {
                if (confirm("Do you want to hide '" + conversation.name + "'")) {
                    conversationsFactory.hideConversation(conversation.itemId,
                        function(response) {
                            console.log("reload after hide");
                            $location.path('/conversations/' + inboxId + "/reload=" + conversation.itemId);
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
        var onNewMessages = function(event, messages) {
            //console.log("CC: Handle new message event");
            listConversations(apiFactory.getToken(), inboxId);
        };

        //var onResume = function (event, state) {
        //    console.log("appResumed ConversationController:", event);
        //    $location.reload();
        //};

        // start subscribing
        $scope.$on('newMessages', onNewMessages);

        // start subscribing
        //$scope.$on('appResumed', onResume);

        init();
    }
]);

