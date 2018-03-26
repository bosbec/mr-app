mrApp.controller('EncryptionController', [
    '$rootScope','$scope', '$localStorage', 'EncryptionFactory',
    function ($rootScope, $scope, $localStorage, encryptionFactory) {

        $scope.encryptionKeys = [];
        $scope.showAddKeyForm = false;

        $scope.AddEncryptionKey = function (keyName, keyType, key, keyAlias) {
            encryptionFactory.addEncryptionKey(keyName, keyType, key, [keyAlias]);
            console.log("EncryptionKeys", $localStorage.encryptionKeys);
            $scope.showAddKeyForm = false;
        };

        $scope.ShowAddEncryptionKey = function() {
            $scope.showAddKeyForm = true;
        }

        $scope.ClearStoredEncryptionKeys = function() {
            encryptionFactory.clearStoredEncryptionKeys();
            $scope.encryptionKeys = $localStorage.encryptionKeys;
            console.log("Clear stored keys", $localStorage.encryptionKeys);
        };
        
        function init() {
            $scope.encryptionKeys = $localStorage.encryptionKeys;
            console.log("EncryptionKeys", $localStorage.encryptionKeys);
        }

        init();
    }
]);