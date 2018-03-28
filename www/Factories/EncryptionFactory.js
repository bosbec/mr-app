angular.module('EncryptionFactory', ['angularjs-crypto'])
    .factory('EncryptionFactory',
    [
        '$localStorage','moment','$filter',
        function ($localStorage, moment, $filter) {

            function generateIv() {
                var iv = CryptoJS.lib.WordArray.random(16);
                var ivstring = iv.toString();
                return ivstring;
            }

            function encryptAES(messageText, keyName, iv, callback, error) {
                var privateKey = getEncryptionKeyByName(keyName);
                if (privateKey != null) {
                    var encrypted = CryptoJS.AES.encrypt(messageText, CryptoJS.enc.Hex.parse(privateKey), { iv: CryptoJS.enc.Hex.parse(iv) });
                    callback(encrypted.ciphertext.toString(CryptoJS.enc.Base64));
                } else {
                    error("Key not found: " + keyName);
                }
            }

            function decryptAES(encryptedText, keyName, iv, callback, error) {
                var privateKey = getEncryptionKeyByName(keyName);
                var decryptedText = "";
                if (privateKey != null) {
                    var cipherParams = CryptoJS.lib.CipherParams.create({
                        ciphertext: CryptoJS.enc.Base64.parse(encryptedText)
                    });
                    var decrypted = CryptoJS.AES.decrypt(cipherParams, CryptoJS.enc.Hex.parse(privateKey), { iv: CryptoJS.enc.Hex.parse(iv) });
                    decryptedText = decrypted.toString(CryptoJS.enc.Utf8);
                    if (decryptedText !== "") {
                        callback(decryptedText);
                    } else {
                        error("unable to decrypt");
                    }
                } else {
                    error("Key not found: " + keyName);
                }
            }

            function encryptMessage(messageText, keyName, iv, callback, error) {
                encryptAES(messageText, keyName, iv, function(response) {
                    callback(response);
                }, function(e) {
                    error(e);
                });

            }

            function decryptMessage(message, callback, error) {
                // get encryptiontype, encryptionkey, encryptioniv from message metadata
                var encryptionType = "";
                var encryptionKeyName = "";
                var encryptionIv = "";

                for (var i = 0; i < message.metaData.length; i++) {
                    if (message.metaData[i].name === "encryptiontype") {
                        encryptionType = message.metaData[i].value;
                    }
                    if (message.metaData[i].name === "encryptionkey") {
                        encryptionKeyName = message.metaData[i].value;
                    }
                    if (message.metaData[i].name === "encryptioniv") {
                        encryptionIv = message.metaData[i].value;
                    }
                }

                if (encryptionType !== "" && encryptionKeyName !== "" && encryptionIv !== "") {
                    decryptAES(message.content, encryptionKeyName, encryptionIv, function (response) {
                        message.content = response;
                        message.secure = true;
                        callback(message);
                    }, function(e) {
                        error(e);
                    });
                } else {
                    error("unable to decrypt, missing encryption parameters");
                }

            }

            function getEncryptionKeyName(conversationId) {
                var encryptionSettings = $filter('filter')($localStorage.encryptedConversations,
                    { 'conversationId': conversationId });

                if (encryptionSettings.length > 0) {
                    return encryptionSettings[0].keyName;
                } else {
                    return "";
                }
            }

            function getEncryptionKeys() {
                return $localStorage.encryptionKeys;
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
                $localStorage.encryptionKeys.push(newKey);
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
                generateIv: generateIv,
                clearStoredEncryptionKeys: clearStoredEncryptionKeys,
                getEncryptionKeys: getEncryptionKeys,
                getEncryptionKeyName: getEncryptionKeyName
            };
        }
    ]);