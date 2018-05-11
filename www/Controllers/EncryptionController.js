mrApp.controller('EncryptionController', [
    '$rootScope','$scope', '$localStorage', 'EncryptionFactory',
    function ($rootScope, $scope, $localStorage, encryptionFactory) {

        $scope.encryptionKeys = [];
        $scope.showEditKeyForm = false;
        $scope.currentKey = null;
        $scope.newKey = false;
        
        $scope.SaveEncryptionKey = function (key) {
            if (encryptionFactory.getEncryptionKeyByName(key.name) === undefined) {
                encryptionFactory.addEncryptionKey(key.name, 'aes', key.key, [key.alias]);
            } else {
                encryptionFactory.updateEncryptionKey(key);
            }
            $scope.showEditKeyForm = false;
            $scope.newKey = false;
            angular.copy(encryptionFactory.getEncryptionKeys(), $scope.encryptionKeys);
        };

        $scope.CancelEditEncryptionKey = function () {
            $scope.currentKey = null;
            $scope.showEditKeyForm = false;
            $scope.newKey = false;
        };

        $scope.DeleteEncryptionKey = function (key) {
            encryptionFactory.deleteEncryptionKey(key.name);
            $scope.currentKey = null;
            $scope.showEditKeyForm = false;
            angular.copy($localStorage.encryptionKeys, $scope.encryptionKeys);
        };

        $scope.ShowAddEncryptionKey = function() {
            $scope.currentKey = {
                "name": "",
                "type": "",
                "key": "",
                "alias": [],
                "createdOn": moment.utc(Date.now()).format("YYYY-MM-DD HH:mm:ss.SSS"),
                "version": 1
            };
            $scope.showEditKeyForm = true;
            $scope.newKey = true;
        };

        $scope.EditEncryptionKey = function(key) {
            $scope.currentKey = encryptionFactory.getEncryptionKeyByName(key.name);
            //angular.copy(key, $scope.currentKey);
            $scope.showEditKeyForm = true;
            $scope.newKey = false;
        };

        $scope.ClearStoredEncryptionKeys = function() {
            encryptionFactory.clearStoredEncryptionKeys();
            angular.copy(encryptionFactory.getEncryptionKeys(), $scope.encryptionKeys);
            console.log("Clear stored keys", $localStorage.encryptionKeys);
        };
        
        function init() {
            angular.copy(encryptionFactory.getEncryptionKeys(), $scope.encryptionKeys);
            //$scope.encryptionKeys = encryptionFactory.getEncryptionKeys();
        }

        init();
    }
]);