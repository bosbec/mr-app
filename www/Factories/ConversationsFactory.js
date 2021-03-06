﻿angular.module('ConversationsFactory', [])
    .factory('ConversationsFactory', ['$http', '$timeout', '$filter', '$localStorage', 'ApiFactory', 'UsersFactory',function($http, $timeout, $filter, $localStorage, apiFactory, usersFactory) {

            var conversations = [];
            var currentConversation = null;
            var reloadConversations = false;
            var lastUpdate = null;

            function whatIsNew(callback, error) {
                
                var whatIsNewRequest = {
                    authenticationToken: apiFactory.getToken(),
                    data: {
                        'deviceId': 'XXX-YYY'
                    }
                };
                //console.log(whatIsNewRequest);
                apiFactory.functions.call('conversations/what-is-new',
                    whatIsNewRequest,
                    function(response) {
                        
                        if (response.data.messages.length > 0) {
                            callback(response.data.messages);
                        } else {
                            callback(null);
                        }

                    },
                    function(e) {
                        error(e);
                        console.log(e);
                    });
            }

            function filterWhatsNewResponse(newMessages) {
                // new conversations?
                for (var i = 0; i < newMessages.length; i++) {
                    var found = $filter('filter')(conversations, { itemId: newMessages[i].conversationId }, true);
                    if (found != null) {
                        //console.log(conversations);
                        console.log("Conversation already exists: " + newMessages[i].conversationId);
                        newMessages.splice(i, 1);
                        console.log(found);
                    }
                }
            }

            function replaceUserIdWithDisplayName(usersWithDisplayName, displayString) {
                //var participants = displayString.split(", ");

                for (var q = 0; q < usersWithDisplayName.length; q++) {
                    displayString = displayString.replace(usersWithDisplayName[q].userId,
                        usersWithDisplayName[q].displayName);
                }

                return displayString;

            }

            function findUserById(userId, users) {
                for (var i = 0; i < users.length; i++) {
                    if (users[i].userId == userId) {
                        return users[i];
                    }
                }
                return null;
            }

            function getAvatarsForConversation(conversation, users) {
                var avatars = [];
                for (var q = 0; q < conversation.participants.length; q++) {
                    var user = findUserById(conversation.participants[q], users);
                    if (user != null) {
                        if (user.avatar == null) {
                            //user.avatar = "images/NoAvatar2.png";
                        } 
                        avatars.push(user);
                    } 
                }
                // add myself
                user = findUserById(conversation.userId, users);
                if (user != null) {
                    if (user.avatar == null) {
                        //user.avatar = "images/NoAvatar2.png";
                    }
                    if (user.avatar != '') {
                        avatars.push(user);
                    }
                }
                return avatars;
            }

            function getAllUniqueUserIdsInConversations(conversations) {
                // remove userId from displayName and get Name for other id:s
                var usersInConversations = [];

                // get all userId:s
                for (var i = 0; i < conversations.length; i++) {
                    var myUserId = conversations[i].userId;
                    var participantsInConversation = [];
                    var participants = conversations[i].displayName.split(", ");

                    // remove my userId from displayName
                    conversations[i].displayName = conversations[i].displayName.replace(", " + myUserId, '');
                    conversations[i].displayName = conversations[i].displayName.replace(myUserId + ", ", '');

                    for (var q = 0; q < participants.length; q++) {
                        usersInConversations.push(participants[q]);
                        if (participants[q] != myUserId) {
                            participantsInConversation.push(participants[q]);
                        }
                    }

                    conversations[i].participants = participantsInConversation;
                }

                return usersInConversations;
            }

            function setReloadConversations() {
                reloadConversations = true;
            }

            function setCurrentConversation(conversation) {
                //console.log("conversation", conversation);
                currentConversation = conversation;
            }

            function getCurrentConversation() {
                return currentConversation;
            }

            function listConversations(token, inboxId, pageIndex, pageSize, callback, error) {

                var listConversationsRequest = {
                    authenticationToken: apiFactory.getToken(),
                    data: {
                        'inboxId': inboxId,
                        'pageIndex': pageIndex,
                        'pageSize': pageSize
                    }
                };
                //console.log("getConv request", listConversationsRequest);
                apiFactory.functions.call('inboxes/list-content',
                    listConversationsRequest,
                    function (response) {
                        if (response.data != null) {

                            conversations = response.data.items;
                            // all users in all conversations
                            var usersInConversations = getAllUniqueUserIdsInConversations(conversations);
                            usersFactory.addUsersById(usersInConversations,
                                inboxId,
                                function(users) {
                                    for (var k = 0; k < conversations.length; k++) {
                                        conversations[k]
                                            .name = replaceUserIdWithDisplayName(users, conversations[k].displayName);
                                        conversations[k].avatars = getAvatarsForConversation(conversations[k], users);
                                    }
                                    //console.log(conversations);
                                    response.data.items = conversations;
                                    callback(response.data);
                                },
                                function(e) {
                                    error(e);
                                });

                        } else {
                            error('No conversations');
                        }
                    }, function (e) {
                        error(e);
                    });

            }

            function createNewConversation(inboxId, participants, message, callback, error) {
                var newConversationRequest = {
                    authenticationToken: apiFactory.getToken(),
                    data: {
                        'instanceName': apiFactory.apiSettings.instanceName,
                        'inboxId': inboxId,
                        'participants': participants,
                        'message': message
                    }
                };
                //console.log(newConversationRequest);
                apiFactory.functions.call('conversations/create-message',
                    newConversationRequest,
                    function(response) {
                        if (response.data != null) {
                            callback(response.data);
                        }
                    },
                    function(e) {
                        error(e);
                    });

            }

            function hideConversation(conversationId, callback, error) {
                //console.log("Hide conversation " + conversationId);
                var hideConversationRequest = {
                    authenticationToken: apiFactory.getToken(),
                    data: {
                        'conversationId': conversationId
                    }
                };
                apiFactory.functions.call('conversations/hide-conversation',
                    hideConversationRequest,
                    function(response) {
                        callback(response);
                    },
                    function(e) {
                        error(e);
                    });
            }

            function hideMessage(conversationId, messageId, callback, error) {
                //console.log("Hide message " + messageId);
                var hideMessageRequest = {
                    authenticationToken: apiFactory.getToken(),
                    data: {
                        'conversationId': conversationId,
                        'messageId': messageId
                    }
                };
                //console.log("hide message request", hideMessageRequest);
                apiFactory.functions.call('conversations/hide-message',
                    hideMessageRequest,
                    function (response) {
                        callback(response);
                    },
                    function (e) {
                        error(e);
                    });
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

            function setEncryptionKeyName(conversationId, keyName) {
                var encryptionSettings = $filter('filter')($localStorage.encryptedConversations,
                    { 'conversationId': conversationId });

                if (encryptionSettings.length > 0) {
                    encryptionSettings[0].keyName = keyName;
                } else {
                    var newEncryptionSetting = {
                        "conversationId": conversationId,
                        "keyName": keyName
                    };
                    $localStorage.encryptedConversations.push(newEncryptionSetting);
                }

            }

            function removeEncryptionKeyName(conversationId) {
                var removeIndex = $localStorage.encryptedConversations.indexOf($filter('filter')($localStorage
                    .encryptedConversations,
                    { 'conversationId': conversationId }));
                $localStorage.encryptedConversations.splice(removeIndex, 1);
            }

            function usesEncryption(conversationId) {
                if (getEncryptionKeyName(conversationId) !== "") {
                    return true;
                } else {
                    return false;
                }
            }

            function init() {
                console.log("Init ConversationsFactory");
                if (!$localStorage.encryptedConversations) {
                    $localStorage.encryptedConversations = [];
                    console.log("Init encryptedConversations array localStorage", $localStorage.encryptedConversations);
                }
            }

            init();

            return {
                conversations: conversations,
                listConversations: listConversations,
                setCurrentConversation: setCurrentConversation,
                getCurrentConversation: getCurrentConversation,
                setReloadConversations: setReloadConversations,
                whatIsNew: whatIsNew,
                createNewConversation: createNewConversation,
                hideConversation: hideConversation,
                hideMessage: hideMessage,
                setEncryptionKeyName: setEncryptionKeyName,
                getEncryptionKeyName: getEncryptionKeyName,
                removeEncryptionKeyName: removeEncryptionKeyName,
                usesEncryption: usesEncryption
            };

        }
    ]);
