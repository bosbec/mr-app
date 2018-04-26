angular.module('UsersFactory', [])
    .factory('UsersFactory',['$rootScope', '$http', '$timeout', 'ApiFactory','SettingsFactory',function($rootScope, $http, $timeout, apiFactory, settingsFactory) {

        var users = [];
        var restApiKey = "f6895bf2-f3c8-49e5-8393-8691dbbed5af"; //bosbecappsys

            function myUser() {
                return $rootScope.myAppUser;
            }

            function getInboxUserDetails(token, inboxId, userIds, callback) {
                var inboxUserDetailsRequest = {
                    "authenticationToken": apiFactory.getToken(),
                    "data": {
                        "inboxId": inboxId,
                        "userIds": userIds
                    }
                };
                apiFactory.functions.call('inboxes/get-users',
                    inboxUserDetailsRequest,
                    function(response) {
                        if (response.data != null) {
                            callback(response.data);
                        }
                    });
            }

            function addUser(user) {
                users.push(user);
            }

            function addUsersById(userIds, inboxId, callback, error) {

                // get user details
                getInboxUserDetails(
                    apiFactory.getToken(),
                    inboxId,
                    userIds,
                    function(usersWithDetails) {
                        for (var j = 0; j < usersWithDetails.length; j++) {
                            users.push({
                                'userId': usersWithDetails[j].userId,
                                'displayName': usersWithDetails[j].userDisplayName,
                                'avatar': usersWithDetails[j].avatar
                            });
                        }

                        callback(users);

                    },
                    function(error) {

                    });

            }

            function getUser(appUserId, callback, error) {

                var appUserDetailsRequest = {
                    "authenticationToken": apiFactory.getToken(),
                    "data": {
                        "userId": appUserId
                    }
                };

                apiFactory.functions.call('users/details-for-user',
                    appUserDetailsRequest,
                    function(response) {
                        var userMetaData = [
                            {
                                "mobileresponse": "allow"
                            }
                        ];
                        response.data.metaData = userMetaData;
                        callback(response.data);
                    },
                    function(e) {
                        error(e);
                    });
            }

            function getUsers() {
                return users;
            }

            function registerUser(instanceName, userName, password, callback, error) {
                var registerUserRequest = {
                    "data": {
                        "instanceName": apiFactory.apiSettings.instanceName,
                        "userName": userName,
                        "password": password
                    }
                };
                //console.log("reg request", registerUserRequest);
                apiFactory.functions.call('public/register',
                    registerUserRequest,
                    function (response) {
                        if (response.errors.length > 0) {
                            error(response.errors);
                        }

                        if (response.data != null) {
                            if (response.data.errors != null && response.data.errors.length > 0) {
                                console.log("(factory)registerUser response: ", response.data.errors);
                                error(response.data.errors[0]);
                            } else {
                                callback(response);
                            }
                        }

                    },
                    function (e) {
                        console.log("(factory)registerUser error: ", e.data.data);
                        if (e.data != null && e.data.data[0].status === "Error") {
                            error(e.data.data[1]);
                        } else {
                            error([
                                {
                                    'errorMessage': 'Could not register user, username already exists'
                                }
                            ]);
                        }
                    });
            }

            function updateProfile(firstName, lastName, email, phone, avatar, callback, error) {
                
                var updateProfileRequest = {
                    "authenticationToken": apiFactory.getToken(),
                    "data": {
                        "Firstname": firstName,
                        "Lastname": lastName,
                        "Avatar": avatar
                    }
                };
                apiFactory.functions.call('users/change-information',
                    updateProfileRequest,
                    function(response) {
                        callback(response);
                    },
                    function(e) {
                        error(e);
                    });
            }

            function updatePhone(phone, callback, error) {

                var updateProfileRequest = {
                    "authenticationToken": apiFactory.getToken(),
                    "data": {
                        "PhoneNumber": phone
                    }
                };
                //console.log("users/change-information", updateProfileRequest);
                apiFactory.functions.call('users/change-information',
                    updateProfileRequest,
                    function (response) {
                        callback(response);
                    },
                    function (e) {
                        error(e);
                    });
            }

            function updateEmail(email, callback, error) {

                var updateProfileRequest = {
                    "authenticationToken": apiFactory.getToken(),
                    "data": {
                        "EmailAddress": email
                    }
                };
                apiFactory.functions.call('users/change-information',
                    updateProfileRequest,
                    function (response) {
                        callback(response);
                    },
                    function (e) {
                        error(e);
                    });
            }

            function findUser(searchText, inboxId, callback, error) {
                var findUserRequest = {
                    "authenticationToken": apiFactory.getToken(),
                    "data": {
                        'inboxId': inboxId,
                        'query': searchText
                    }
                };
                apiFactory.functions.call('inboxes/search',
                    findUserRequest,
                    function(response) {
                        callback(response.data);
                    },
                    function(e) {
                        error(e);
                    });
            }

            function validatePhone(phone, callback, error) {
                $http({
                        url: 'https://api2.mobileresponse.io/utilities/parse?phone=' + phone,
                        method: 'GET',
                        data: null
                    })
                    .then(function(response) {
                            callback(response);
                        },
                        function(e) {
                            error(e);
                        });
            }

            function sendVerificationSms(phone, appUserId, callback, error) {
                //console.log(settingsFactory.getUrls().rest);
                var request = {
                    "workflowId": "fbda91c4-d3e4-4721-81f0-cf785e8adfce",
                    "triggerNames": "send-verify-phone-sms",
                    "metadata": {
                        "verify-number": phone,
                        "app-user-id": appUserId
                    }
                };
                $http({
                    url: settingsFactory.getUrls().rest + 'workflows',
                        method: 'POST',
                        data: request,
                        headers: { 'Content-Type': 'application/json', 'api-key': restApiKey }
                    })
                    .then(function(response) {
                            callback(response);
                        },
                        function(e) {
                            error(e);
                        });
            }

            function validateCodePhone(code, phone, appUserId, callback, error) {
                var request = {
                    "workflowId": "fbda91c4-d3e4-4721-81f0-cf785e8adfce",
                    "triggerNames": "validate-code-phone",
                    "metadata": {
                        "app-user-id": appUserId,
                        "verify-phone-code": code
                    },
                    "RequestSettings": {
                        "content-type": "json",
                        "ResponseData": {
                            "foundunit": "incomingunit.metadata.app-user-id"
                        }
                    }
                };
                $http({
                    url: settingsFactory.getUrls().rest + 'workflows',
                    method: 'POST',
                    data: request,
                    headers: { 'Content-Type': 'application/json', 'api-key': restApiKey }
                })
                    .then(function (response) {
                        callback(response);
                    },
                        function (e) {
                            error(e);
                        });
            }

            function sendVerificationEmail(email, appUserId, callback, error) {
                var request = {
                    "workflowId": "fbda91c4-d3e4-4721-81f0-cf785e8adfce",
                    "triggerNames": "send-verify-email",
                    "metadata": {
                        "verify-email": email,
                        "app-user-id": appUserId
                    }
                };
                $http({
                    url: settingsFactory.getUrls().rest + 'workflows',
                    method: 'POST',
                    data: request,
                    headers: { 'Content-Type': 'application/json', 'api-key': restApiKey }
                })
                    .then(function (response) {
                        callback(response);
                    },
                        function (e) {
                            error(e);
                        });
            }

            function validateCodeEmail(code, email, appUserId, callback, error) {
                var request = {
                    "workflowId": "fbda91c4-d3e4-4721-81f0-cf785e8adfce",
                    "triggerNames": "validate-code-email",
                    "metadata": {
                        "app-user-id": appUserId,
                        "verify-email-code": code
                    },
                    "RequestSettings": {
                        "content-type": "json",
                        "ResponseData": {
                            "foundunit": "incomingunit.metadata.app-user-id"
                        }
                    }
                };
                $http({
                    url: settingsFactory.getUrls().rest + 'workflows',
                    method: 'POST',
                    data: request,
                    headers: { 'Content-Type': 'application/json', 'api-key': restApiKey }
                })
                    .then(function (response) {
                        callback(response);
                    },
                        function (e) {
                            error(e);
                        });
            }

            function requestResetPassword(username, phone, email, callback, error) {
                var requestResetRequest = {
                    "data": {
                        "InstanceName": apiFactory.apiSettings.instanceName,
                        "Username": username,
                        "PhoneNumber": phone,
                        "EmailAdress": email
                    }
                };
                //console.log(requestResetRequest);
                apiFactory.functions.call('public/request-change-forgotten-password-code',
                    requestResetRequest,
                    function(response) {
                        callback(response);
                    },
                    function(e) {
                        error(e);
                    });
            }

            return {
                myUser: myUser,
                addUser: addUser,
                addUsersById: addUsersById,
                getUser: getUser,
                getUsers: getUsers,
                getInboxUserDetails: getInboxUserDetails,
                registerUser: registerUser,
                updateProfile: updateProfile,
                updatePhone: updatePhone,
                updateEmail: updateEmail,
                findUser: findUser,
                validatePhone: validatePhone,
                sendVerificationSms: sendVerificationSms,
                validateCodePhone: validateCodePhone,
                sendVerificationEmail: sendVerificationEmail,
                validateCodeEmail: validateCodeEmail,
                requestResetPassword: requestResetPassword
            };
        }
    ]);

