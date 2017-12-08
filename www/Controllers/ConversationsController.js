mrApp.controller('ConversationsController',[
    'ApiFactory', '$scope', '$rootScope', '$location', '$routeParams', 'UsersFactory', 'ConversationsFactory','SettingsFactory','DeviceFactory',
    function(apiFactory, $scope, $rootscope, $location, $routeParams, usersFactory, conversationsFactory,settingsFactory, deviceFactory) {

        var inboxId = $routeParams.param1;

        $scope.alertText = null;
        $scope.currentPage = 1;

        function init() {
            $scope.$emit('viewChanged', 'conversations');
            $rootscope.currentInboxId = inboxId;
            listConversations(apiFactory.getToken(), inboxId, $scope.currentPage);
        }

        function formatConversationList(conversations) {
            var previewLength = 100;
            for (var i = 0; i < conversations.length; i++) {
                if (conversations[i].content.length > previewLength) {
                    conversations[i].content = conversations[i].content.substr(0, previewLength) + " ...";
                }
            }
            return conversations;
        }

        function listConversations(token, inboxId, pageIndex) {
            var callback = function (conversations) {
                $scope.conversations = conversations;
                $scope.$emit('showAlertNewMessage', false);
            };

            getConversations(token, inboxId, $scope.currentPage, callback);

            //conversationsFactory.listConversations(token,
            //    inboxId,
            //    pageIndex,
            //    settingsFactory.getNumberOfConversations(),
            //    function (conversations) {
            //        if (deviceFactory.isDevice()) {
            //            $scope.conversations = formatConversationList(conversations);
            //        } else {
            //            $scope.conversations = conversations;
            //        }
            //        $scope.$emit('showAlertNewMessage', false);
            //    },
            //    function(error) {
            //        console.log(error);
            //    });
        }

        function getConversations(token, inboxId, pageIndex, callback) {
            conversationsFactory.listConversations(token,
                inboxId,
                pageIndex,
                settingsFactory.getNumberOfConversations(),
                function (conversations) {
                    if (deviceFactory.isDevice()) {
                        callback(formatConversationList(conversations));
                    } else {
                        callback(conversations);
                    }
                },
                function (error) {
                    console.log("getConversations", error);
                });
        }

        $scope.ListMessagesInConversation = function(conversation) {
            //console.log(conversation);
            conversationsFactory.setCurrentConversation(conversation);
            $location.path('/messages/' + conversation.itemId);
        };

        $scope.LoadMore = function () {
            console.log("LoadMore");
            var callback = function (conversations) {
                //console.log("more conversations: ", conversations);
                //$scope.conversations = angular.merge($scope.conversations, conversations)};
                $scope.conversations = [].concat($scope.conversations, conversations);
                //$scope.conversations.push(conversations);
                console.log($scope.conversations);
                $scope.$emit('showAlertNewMessage', false);
            };
            $scope.currentPage = $scope.currentPage + 1;
            getConversations(apiFactory.getToken(), inboxId, $scope.currentPage, callback);
        };

        // handler
        var onNewMessages = function(event, messages) {
            //console.log("CC: Handle new message event");
            listConversations(apiFactory.getToken(), inboxId);
        }

        // start subscribing
        $scope.$on('newMessages', onNewMessages);

        init();
    }
]);

