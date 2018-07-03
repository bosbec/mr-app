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
                    var encrypted = CryptoJS.AES.encrypt(messageText, CryptoJS.enc.Hex.parse(privateKey.key), { iv: CryptoJS.enc.Hex.parse(iv) });
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
                    var decrypted = CryptoJS.AES.decrypt(cipherParams, CryptoJS.enc.Hex.parse(privateKey.key), { iv: CryptoJS.enc.Hex.parse(iv) });
                    //console.log("decrypted", decrypted);
                    try {
                        decryptedText = decrypted.toString(CryptoJS.enc.Utf8);
                        //console.log("decryptedText", decryptedText);
                        if (decryptedText !== "") {
                            callback(decryptedText);
                        } else {
                            error("unable to decrypt");
                        }
                    } catch (e) {
                        console.error(e, e.stack);
                        error("wrong format");
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

            function parseMessageBody(rawMessage) {
                var parsedMessages = rawMessage.split(" ");
                if (parsedMessages.length > 1) {
                    return parsedMessages[parsedMessages.length - 1];
                }
                return rawMessage;
            }

            function splitMessageBody(rawMessage, splitBy, returnLast) {
                var parsedMessages = rawMessage.split(splitBy);
                if (parsedMessages.length > 1) {
                    if (returnLast) {
                        return parsedMessages[parsedMessages.length - 1];
                    } else {
                        return parsedMessages[0];
                    }
                    
                }
                return "";
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

                message.secure = true;

                if (encryptionType !== "" && encryptionKeyName !== "" && encryptionIv !== "") {
                    var parsedMessageBody = parseMessageBody(message.content);

                    //var encryptedMessageBodyPart = splitMessageBody(message.content, " ", true);
                    //console.log("encryptedMessageBodyPart", encryptedMessageBodyPart);

                    var clearTextMessageBodyPart = splitMessageBody(message.content, ":", false);
                    //console.log("clearTextMessageBodyPart", clearTextMessageBodyPart);
                    
                    decryptAES(parsedMessageBody, encryptionKeyName, encryptionIv, function (response) {
                        if (clearTextMessageBodyPart !== "") {
                            message.content = clearTextMessageBodyPart + ": " + response;
                        } else {
                            message.content = response;
                        }
                       
                        callback(message);
                    }, function (e) {
                        message.encryptionError = "Unable to decrypt secure message. <br />Missing key: '<b>" +
                            encryptionKeyName +"</b>'";
                        error(e);
                    });
                } else {
                    error("unable to decrypt, missing encryption parameters");
                }

            }

            function getEncryptionKeyName(conversationId) {
                var encryptionSettings = $filter('filter')($localStorage.encryptedConversations,
                    { 'conversationId': conversationId },
                    true);

                if (encryptionSettings.length > 0) {
                    return encryptionSettings[0].keyName;
                } else {
                    return "";
                }
            }

            function getEncryptionKeys() {
                return $filter('filter')($localStorage.encryptionKeys, {});
            }

            function getEncryptionKeyByName(keyName) {
                console.log("getEncryptionKeyByName", keyName);
                if ($filter('filter')($localStorage.encryptionKeys, { 'name': keyName }, true).length > 0) {
                    return $filter('filter')($localStorage.encryptionKeys, { 'name': keyName }, true)[0];
                } else {
                    if ($filter('filter')($localStorage.encryptionKeys, { 'alias': keyName }, true).length > 0) {
                        return $filter('filter')($localStorage.encryptionKeys, { 'alias': keyName }, true)[0];
                    }
                    // check in alias
                    //console.log("alias", $filter('filter')($localStorage.encryptionKeys, { 'alias': keyName }, true)[0]);
                    //console.log(key.alias);
                    // if key.alias is not empty check for , => split 
                    //if (key.alias !== undefined) {
                    //    console.log(key.alias.indexOf(","));
                    //    if (key.alias.indexOf(",") > 0) {
                    //        var keyAliases = key.alias.split(",");
                    //        console.log("keyAliases", keyAliases);
                    //    }
                    //}
                }

            }

            function addEncryptionKey(name, type, key, alias) {
                var newKey = {
                    "name": name,
                    "type": type,
                    "key": key,
                    "alias": alias,
                    "createdOn": moment.utc(Date.now()).format("YYYY-MM-DD HH:mm:ss.SSS"),
                    "version": 1
                };
                $localStorage.encryptionKeys.push(newKey);
            }

            function updateEncryptionKey(key) {
                var storedKey = $filter('filter')($localStorage.encryptionKeys, { 'name': key.name }, true)[0];
                if (storedKey !== undefined) {
                    console.log("storedKey", storedKey);
                    storedKey.name = key.name;
                    storedKey.key = key.key;
                    storedKey.version = storedKey.version + 1;
                    console.log("updated storedKey", storedKey);
                }
            }

            function deleteEncryptionKey(keyName) {
                var removeIndex = $localStorage.encryptionKeys.indexOf($filter('filter')($localStorage
                    .encryptionKeys,
                    { 'name': keyName },
                    true)[0]);
                $localStorage.encryptionKeys.splice(removeIndex, 1);
            }
            
            function clearStoredEncryptionKeys() {
                $localStorage.encryptionKeys = [];
            }

            function generateKey(password, salt, bitSize) {

                var iterations = 1000;
                var config = {
                    keySize: bitSize / 32,
                    iterations: iterations
                };

                var hexSalt = salt;
                var cryptoSalt = CryptoJS.enc.Hex.parse(hexSalt);

                var generatedKey = CryptoJS.PBKDF2(password, cryptoSalt, config);
                return generatedKey.toString();

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
                getEncryptionKeyName: getEncryptionKeyName,
                getEncryptionKeyByName: getEncryptionKeyByName,
                updateEncryptionKey: updateEncryptionKey,
                deleteEncryptionKey: deleteEncryptionKey,
                generateKey: generateKey
            };
        }
    ]);