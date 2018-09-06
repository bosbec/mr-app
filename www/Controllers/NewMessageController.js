mrApp.controller('NewMessageController', ['ApiFactory', '$scope', '$rootScope', '$location', 'ConversationsFactory', function (apiFactory, $scope, $rootScope, $location, conversationsFactory) {
    var vm = this;

    vm.conversationDetails = {};
        vm.newMessage = "";

    vm.createConversationAndSendMessage = function (message) {
        conversationsFactory.createNewConversation(vm.conversationDetails.inboxId, vm.conversationDetails.participants, message, function (response) {
            $location.path('/messages/' + response.conversationId);
        }, function (error) {
            console.log(error);
        });
    };

    function init() {
        if ($scope.authenticationToken == undefined) {
            $location.path('/login');
        }
        $scope.$emit('viewChanged', 'conversation');
    }

    $scope.$on('conversationDetails', function (event, args) {
        vm.conversationDetails = args;
    });

    init();
}
]);

