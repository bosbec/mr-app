mrApp.controller('VerifyController',
[
    '$scope','$timeout','$routeParams','$location','UsersFactory',
    function ($scope,$timeout,$routeParams,$location, usersFactory) {

        $scope.successText = null;
        $scope.errorText = null;

        $scope.status = "init";
        $scope.verifyType = $routeParams.param1;
        var appUserId = $routeParams.param2;

        $scope.verificationResponse = null;
        
        function showAlert(text, type, duration) {
            if (type === 'success') {
                $scope.successText = text;
                $timeout(function () {
                    $scope.successText = null;
                }, duration);
            }
            if (type === 'error') {
                $scope.errorText = text;
                $timeout(function () {
                    $scope.errorText = null;
                }, duration);
            }
        }
        
        function init() {
        }

        function validateNumber(phone) {
            usersFactory.validatePhone(phone, function (response) {
                if (response.data.parsedPhone) {
                    $scope.status = "valid";
                    $scope.verificationResponse = response.data.parsedPhone;
                    if ($scope.verificationResponse.country) {
                        $scope.verificationResponse.country
                            .flag = 'http://www.ip2location.com/images/flags_16/' +
                            $scope.verificationResponse.country.isoCode.toLowerCase() +
                            '_16.png';
                    }
                } else if (response.data.error) {
                    $scope.verificationResponse = response.data.error;
                    $scope.verificationResponse.valid = false;
                    showAlert('Not a valid phone number', 'error', 3000);
                }

            }, function (error) {
                showAlert('Unable to validate your number, please try again', 'error', 3000);
            });
        }

        function sendVerificationSms(phone, appUserId) {
            usersFactory.sendVerificationSms(phone,
                appUserId,
                function(response) {
                    console.log("Sms with verification code sent");
                    showAlert('Sms with verification code sent to '+ phone, 'success', 3000);
                    $scope.status = "sms-sent";
                },
                function(error) {

                });
        }

        function validateCodePhone(code, phone) {
            console.log("validate: ", phone);
            usersFactory.validateCodePhone(code,
                phone,
                appUserId,
                function(response) {
                    if (response.data.data.foundunit === appUserId) {
                        showAlert('Found matching code, phone number is confirmed.', 'success', 3000);
                        usersFactory.updatePhone(phone,
                            function(response) {
                                showAlert('Phone number is saved to profile, redirecting...', 'success', 3000);
                                $location.path('/profile/' + appUserId);
                            },
                            function(error) {
                                showAlert('Failed to save profile, please try again', 'error', 3000);
                                $location.path('/verify/phone/' + appUserId);
                            });
                    }
                },
                function(error) {

                });
        }

        function sendVerificationEmail(email, appUserId) {
            usersFactory.sendVerificationEmail(email,
                appUserId,
                function (response) {
                    console.log("Email with verification code sent");
                    showAlert('Email with verification code sent to ' + email, 'success', 3000);
                    $scope.status = "email-sent";
                },
                function (error) {

                });
        }

        function validateCodeEmail(code, email) {
            usersFactory.validateCodeEmail(code,
                email,
                appUserId,
                function (response) {
                    if (response.data.data.foundunit === appUserId) {
                        showAlert('Found matching code, email is confirmed.', 'success', 3000);
                        usersFactory.updateEmail(email,
                            function (response) {
                                showAlert('Email is saved to profile, redirecting...', 'success', 3000);
                                $location.path('/profile/' + appUserId);
                            },
                            function (error) {
                                showAlert('Failed to save profile, please try again', 'error', 3000);
                                $location.path('/verify/email/' + appUserId);
                            });
                    } else {
                        showAlert('Validation failed, no matching code', 'error', 3000);
                    }
                },
                function (error) {
                    showAlert('Validation failed, no matching code', 'error', 3000);
                });
        }

        $scope.ValidateNumber = function (phone) {
            validateNumber(phone);
        };

        $scope.SendVerificationSms = function (phone) {
            sendVerificationSms(phone, appUserId);
        };

        $scope.ValidateCodePhone = function (code,phone) {
            validateCodePhone(code,phone);
        };

        $scope.SendVerificationEmail = function (email) {
            sendVerificationEmail(email, appUserId);
        };

        $scope.ValidateCodeEmail = function (code, email) {
            validateCodeEmail(code, email);
        };
        
        init();

    }
]);