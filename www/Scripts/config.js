
var checkToken = [function ($rootScope, $q, $location) {

    var deferred = $q.defer();

    if ($rootScope.authenticationToken != undefined) {
        deferred.resolve();
    } else {
        $location.path('/login');
        deferred.reject();
    }

    return deferred.promise;
}];

mrApp.config(function ($routeProvider) {

    $routeProvider.when('/login',
    {
        templateUrl: 'Partials/login.htm'
    });

    $routeProvider.when('/logout',
    {
        templateUrl: 'Partials/logout.htm'
    });

    $routeProvider.when('/main',
    {
        templateUrl: 'Partials/main.htm',
        resolve: checkToken
    });

    $routeProvider.when('/conversations/:param1',
    {
        templateUrl: 'Partials/conversations.htm',
        resolve: checkToken
        });

    $routeProvider.when('/conversations/:param1/:param2',
        {
            templateUrl: 'Partials/conversations.htm',
            resolve: checkToken
        });

    $routeProvider.when('/newconversation',
    {
        templateUrl: 'Partials/new-conversation.htm',
        resolve: checkToken
    });

    $routeProvider.when('/messages/:param1',
    {
        templateUrl: 'Partials/messages-chat.htm',
        resolve: checkToken
    });

    $routeProvider.when('/new-message/',
        {
            templateUrl: 'Partials/new-message-chat.htm',
            resolve: checkToken
        });

    $routeProvider.when('/messages/:param1/:param2',
        {
            templateUrl: 'Partials/messages-chat.htm',
            resolve: checkToken
        });

    $routeProvider.when('/profile/:param1',
    {
        templateUrl: 'Partials/profile.htm',
        resolve: checkToken
    });

    $routeProvider.when('/verify/:param1/:param2',
    {
        templateUrl: 'Partials/verify.htm',
        resolve: checkToken
    });

    $routeProvider.when('/settings',
    {
        templateUrl: 'Partials/settings.htm',
        resolve: checkToken
    });

    $routeProvider.when('/connect',
    {
        templateUrl: 'Partials/connect.htm',
        resolve: checkToken
    });

    $routeProvider.when('/mr/groups',
    {
        templateUrl: 'Partials/mr-groups.htm',
        resolve: checkToken
    });

    $routeProvider.when('/mr/groups/:param1',
    {
        templateUrl: 'Partials/mr-group-members.htm',
        resolve: checkToken
    });

    $routeProvider.when('/mr/units',
    {
        templateUrl: 'Partials/mr-units.htm',
        resolve: checkToken
    });

    $routeProvider.when('/mr/services',
    {
        templateUrl: 'Partials/mr-services.htm',
        resolve: checkToken
        });

    $routeProvider.when('/mr/services:param1',
        {
            templateUrl: 'Partials/mr-services.htm',
            resolve: checkToken
        });

    $routeProvider.when('/intro/:param1',
    {
        templateUrl: 'Partials/intro-container.htm',
        resolve: checkToken
    });

    $routeProvider.when('/login/:param1',
    {
        templateUrl: 'Partials/login.htm'
    });

    $routeProvider.when('/encryption',
    {
        templateUrl: 'Partials/encryption.htm',
        resolve: checkToken
    });

    $routeProvider.when('/webviewtest',
    {
        templateUrl: 'Partials/webviewtest.htm'
    });

    $routeProvider.otherwise({
        redirectTo: '/login'
    });

});