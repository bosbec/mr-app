angular.module('EncryptionFactory', ['angularjs-crypto'])
    .factory('EncryptionFactory',
    [
        '$localStorage','moment',
        function ($localStorage, moment) {

            function encryptMessage(messageText, keyName, iv, callback, error) {
                console.log("EncryptMessage: ", messageText, iv);
                var privateKey = getEncryptionKeyByName(keyName);
                if (privateKey != null) {
                    var encrypted = CryptoJS.AES.encrypt(messageText, privateKey, { iv: iv });
                    callback(encrypted.ciphertext.toString(CryptoJS.enc.Base64));
                } else {
                    error("Key not found: " + keyName);
                }
            }

            function decryptMessage(encryptedMessageText, keyName, iv, callback, error) {
                console.log("DecryptMessage: ", encryptedMessageText, iv);
                var privateKey = getEncryptionKeyByName(keyName);
                if (privateKey != null) {
                    var cipherParams = CryptoJS.lib.CipherParams.create({
                        ciphertext: CryptoJS.enc.Base64.parse(encryptedMessageText)
                    });
                    var decrypted = CryptoJS.AES.decrypt(cipherParams, $scope.privateKey, { iv: iv });
                    callBack(decrypted.toString(CryptoJS.enc.Utf8));
                } else {
                    error("Key not found: " + keyName);
                }
                
            }

            function getEncryptionKeyByName(keyName) {
                for (var i = 0; i < $localStorage.encryptionKeys.length; i++) {
                    if ($localStorage.encryptionKeys[i].name === keyName) {
                        return $localStorage.encryptionKeys[i].key;
                    }
                }
                return null;
            }

            function addEncryptionKey(name, type, key, alias) {
                var newKey = {
                    "name": name,
                    "type": type,
                    "key": key,
                    "alias": [alias],
                    "createdOn": moment.utc(Date.now()).format("YYYY-MM-DD HH:mm:ss.SSS"),
                    "version": 1
                };
                console.log("EncryptionFactory[newKey]",newKey);
                $localStorage.encryptionKeys.push(newKey);
            }

            function createIv() {
                return "randomstring";
            }

            function clearStoredEncryptionKeys() {
                $localStorage.encryptionKeys = [];
            }

            function init() {
                console.log("Init EncryptionFactory");
                if (!$localStorage.encryptionKeys) {
                    $localStorage.encryptionKeys = [];
                    console.log("Init encryptionKeys array localStorage", $localStorage.encryptionKeys);
                }
            }

            init();

            return {
                addEncryptionKey: addEncryptionKey,
                encryptMessage: encryptMessage,
                decryptMessage: decryptMessage,
                createIv: createIv,
                clearStoredEncryptionKeys: clearStoredEncryptionKeys
            };
        }
    ]);