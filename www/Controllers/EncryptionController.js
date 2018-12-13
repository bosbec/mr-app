mrApp.controller('EncryptionController', [
    '$rootScope', '$scope', '$localStorage','$timeout', 'EncryptionFactory',
    function ($rootScope, $scope, $localStorage, $timeout, encryptionFactory) {

        $scope.encryptionKeys = [];
        $scope.showEditKeyForm = false;
        $scope.showGenerateKeyForm = false;
        $scope.currentKey = null;
        $scope.newKey = false;
        $scope.copyButtonText = "Copy to clipboard";

        $scope.clipboardSuccess = function(e) {
            //console.log("clipboard success: ", e.text, e.trigger);
            $scope.copyButtonText = "Copied!";
            $timeout(function() {
                    $scope.copyButtonText = "Copy to clipboard";
                },
                2000);
        };

        $scope.clipboardError = function () {
            console.log("clipboard error");
            $scope.copyButtonText = "Failed!";
            $timeout(function() {
                    $scope.copyButtonText = "Copy to clipboard";
                },
                2000);
        };

        $scope.SaveEncryptionKey = function (key) {
            if (encryptionFactory.getEncryptionKeyByName(key.name) === undefined) {
                encryptionFactory.addEncryptionKey(key.name, 'aes', key.key, key.alias);
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
            $scope.showGenerateKeyForm = false;
            $scope.newKey = false;
        };

        $scope.DeleteEncryptionKey = function (key) {
            encryptionFactory.deleteEncryptionKey(key.name);
            $scope.currentKey = null;
            $scope.showEditKeyForm = false;
            angular.copy($localStorage.encryptionKeys, $scope.encryptionKeys);
        };

        $scope.ShowAddEncryptionKey = function () {
            $scope.currentKey = {
                "name": "",
                "type": "",
                "key": "",
                "bitSize": 256,
                "alias": "",
                "createdOn": moment.utc(Date.now()).format("YYYY-MM-DD HH:mm:ss.SSS"),
                "version": 1
            };
            $scope.showEditKeyForm = true;
            $scope.showGenerateKeyForm = true;
            $scope.newKey = true;
        };

        $scope.EditEncryptionKey = function(key) {
            $scope.currentKey = encryptionFactory.getEncryptionKeyByName(key.name);
            $scope.showEditKeyForm = true;
            $scope.newKey = false;
        };

        $scope.ClearStoredEncryptionKeys = function() {
            encryptionFactory.clearStoredEncryptionKeys();
            angular.copy(encryptionFactory.getEncryptionKeys(), $scope.encryptionKeys);
            console.log("Clear stored keys", $localStorage.encryptionKeys);
        };

        $scope.ShowGenerateKey = function () {
            $scope.showGenerateKeyForm = true;
        };

        $scope.GenerateKey = function (passphrase, salt, bitSize) { //bitSize: 128 eller 256 - change to always 256
            var generatedKey = encryptionFactory.generateKey(passphrase, salt, 256);
            $scope.currentKey.key = generatedKey;
            $scope.showGenerateKeyForm = false;
        };

        $scope.CancelGenerateKey = function () {
            $scope.showEditKeyForm = true;
            $scope.showGenerateKeyForm = false;
        };
        
        function init() {
            angular.copy(encryptionFactory.getEncryptionKeys(), $scope.encryptionKeys);
        }

        init();
    }
]);