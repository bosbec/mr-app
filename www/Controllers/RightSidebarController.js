mrApp.controller('RightSidebarController', [
    '$rootScope', '$scope', 'ConversationsFactory', 'EncryptionFactory',
    function ($rootScope, $scope, conversationsFactory, encryptionFactory) {

        $scope.encryptionKeys = [];
        $scope.conversation = null;
        $scope.currentEncryptionKey = null;
        
        function onOpenRightSidebar(event) {

            $scope.encryptionKeys = [];
            $scope.conversation = null;
            $scope.currentEncryptionKey = null;

            $scope.conversation = conversationsFactory.getCurrentConversation();
            $scope.encryptionKeys.push({
                "name": "none",
                "type": "",
                "key": "",
                "alias": [],
                "createdOn": moment.utc(Date.now()).format("YYYY-MM-DD HH:mm:ss.SSS"),
                "version": 1
            });
            $scope.encryptionKeys.push.apply($scope.encryptionKeys,encryptionFactory.getEncryptionKeys());
            var currentKeyName = encryptionFactory.getEncryptionKeyName($scope.conversation.itemId);
            if (currentKeyName !== "") {
                $scope.currentEncryptionKey = currentKeyName;
            } else {
                $scope.currentEncryptionKey = "none";
            }
        }

        $scope.SetEncryptionKey = function (keyName) {
            if (keyName === "none") {
                conversationsFactory.removeEncryptionKeyName($scope.conversation.itemId);
            } else {
                conversationsFactory.setEncryptionKeyName($scope.conversation.itemId, keyName);    
            }
            $scope.currentEncryptionKey = keyName;
        }

        function init() {
            //console.log("Init RightSidebar");
        }
        
        init();

        $scope.$on('openRightSidebar', onOpenRightSidebar);
    }
]);

