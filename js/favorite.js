app.controller("favoriteController", function ($scope, $http, $location) {
    $scope.BookFeeds = {};
    $scope.BookModal = function (_id) {
        $scope.BookFeeds = _id;
        $('#SliderContent').modal('show')
    };
    $scope.NewsFeed = {};
    $scope.openModal = function (_id) {
        $scope.NewsFeed = _id;
        $('#post-feed-modal').modal('show')
    }
    $scope.CardFeedModals = {};
    $scope.CardFeedModal = function (_id) {
        $scope.CardFeedModals = _id;
        $('#CardFeed-Post').modal('show')
    }
    $scope.searchfavorites = function () {
        $http.get('/api/favorites', null).then(function (result) {
            $scope.favorites = result.data
        }, function (error) {
            console.log(error)
        })
    };
    $scope.searchfavorites();
    $scope.favorites = [];
    $scope.remove = function (index) {
        $http.delete('/api/favorites/' + $scope.favorites[index]._id, null).then(function () {
            $scope.favorites.splice(index, 1)
        })
    };
});