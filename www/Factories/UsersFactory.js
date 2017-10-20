angular.module('UsersFactory', [])
    .factory('UsersFactory',['$rootScope', '$http', '$timeout', 'ApiFactory',function($rootScope, $http, $timeout, apiFactory) {

        var users = [];
        var restApiKey = "f6895bf2-f3c8-49e5-8393-8691dbbed5af"; //bosbecappsys

            function myUser() {
                return $rootScope.myAppUser;
            }

            function getInboxUserDetails(token, inboxId, userIds, callback) {
                var inboxUserDetailsRequest = {
                    authenticationToken: apiFactory.getToken(),
                    data: {
                        'inboxId': inboxId,
                        'userIds': userIds
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
                    authenticationToken: apiFactory.getToken(),
                    data: {
                        'userId': appUserId
                    }
                };

                apiFactory.functions.call('users/details-for-user',
                    appUserDetailsRequest,
                    function(response) {
                        console.log("users/detals");
                        console.log(response);
                        //if (response.data.id === "685d0963-75d8-4b60-b819-278a23c87948" || response.data.id === "f53d5d79-a451-4bdb-ad30-c5ccff843c75" || response.data.id === "ac79491c-f8f4-4a3a-84f8-210a9a4a49d3" || response.data.id === "78f2c311-c9cd-489c-a118-d90c0f79e35f" || response.data.id === "b36e5865-27d3-47fc-831e-eeecaafd53d1") {
                        //    var userMetaData = [
                        //        {
                        //            "mobileresponse": "allow"
                        //        }
                        //    ];
                        //    response.data.metaData = userMetaData;
                        //}
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
                    'data': {
                        'instanceName': apiFactory.apiSettings.instanceName,
                        'userName': userName,
                        'password': password
                    }
                };
                apiFactory.functions.call('public/register',
                    registerUserRequest,
                    function (response) {
                        if (response.errors.length > 0) {
                            error(response.errors);
                        }

                        if (response.data != null) {
                            if (response.data.errors != null && response.data.errors.length > 0) {
                                error(response.data.errors[0]);
                            } else {
                                callback(response);
                            }
                        }

                    },
                    function (e) {
                        if (e.data != null && e.data.errors != null) {
                            error(e.data.errors);
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
                    "AuthenticationToken": apiFactory.getToken(),
                    "Data": {
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
                    "AuthenticationToken": apiFactory.getToken(),
                    "Data": {
                        "PhoneNumber": phone
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

            function updateEmail(email, callback, error) {

                var updateProfileRequest = {
                    "AuthenticationToken": apiFactory.getToken(),
                    "Data": {
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
                    authenticationToken: apiFactory.getToken(),
                    data: {
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
                var request = {
                    "workflowId": "fbda91c4-d3e4-4721-81f0-cf785e8adfce",
                    "triggerNames": "send-verify-phone-sms",
                    "metadata": {
                        "verify-number": phone,
                        "app-user-id": appUserId
                    }
                };
                $http({
                    url: 'https://rest.mobileresponse.io/1/workflows',
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
                    url: 'https://rest.mobileresponse.io/1/workflows',
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
                console.log(request);
                $http({
                    url: 'https://rest.mobileresponse.io/1/workflows',
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
                    url: 'https://rest.mobileresponse.io/1/workflows',
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
                    "Data": {
                        "InstanceName": apiFactory.apiSettings.instanceName,
                        "Username": username,
                        "PhoneNumber": phone,
                        "EmailAdress": email
                    }
                };
                console.log(requestResetRequest);
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

