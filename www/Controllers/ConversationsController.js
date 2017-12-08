mrApp.controller('ConversationsController',[
    'ApiFactory', '$scope', '$rootScope', '$location', '$routeParams', 'UsersFactory', 'ConversationsFactory','SettingsFactory','DeviceFactory',
    function(apiFactory, $scope, $rootscope, $location, $routeParams, usersFactory, conversationsFactory,settingsFactory, deviceFactory) {

        var inboxId = $routeParams.param1;

        $scope.alertText = null;

        function init() {
            $scope.$emit('viewChanged', 'conversations');
            $rootscope.currentInboxId = inboxId;
            listConversations(apiFactory.getToken(), inboxId);
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

        function listConversations(token, inboxId) {
            conversationsFactory.listConversations(token,
                inboxId,
                1,
                settingsFactory.getNumberOfConversations(),
                function (conversations) {
                    if (deviceFactory.isDevice()) {
                        $scope.conversations = formatConversationList(conversations);
                    } else {
                        $scope.conversations = conversations;
                    }
                    $scope.$emit('showAlertNewMessage', false);
                },
                function(error) {
                    console.log(error);
                });
        }

        $scope.ListMessagesInConversation = function(conversation) {
            //console.log(conversation);
            conversationsFactory.setCurrentConversation(conversation);
            $location.path('/messages/' + conversation.itemId);
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

