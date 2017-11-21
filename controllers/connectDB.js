var app = angular.module('app', ['slickCarousel']);
app.controller("articlesFeedSliderController", function ($scope, $http, $location) {
    $scope.NewsFeed = {};
    $scope.openModal = function (_id) {
        $scope.NewsFeed = _id;
        $('#post-feed-modal').modal('show')
    }
    $scope.searchPostFeeds = function () {
        $http.get('/api/PostFeedSlider', null).then(function (result) {
            $scope.PostFeeds = result.data
        }, function (error) {
            console.log(error)
        })
    };
    $scope.searchPostFeeds();
    $scope.PostFeeds = []
});
app.controller("BlogController", function ($scope, $http, $location) {
    $scope.CardFeedModals = {};
    $scope.CardFeedModal = function (_id) {
        $scope.CardFeedModals = _id;
        $('#CardFeed-Post').modal('show')
    }
    $scope.searchCardFeeds = function () {
        $http.get('/api/CardFeeds', null).then(function (result) {
            $scope.CardFeeds = result.data
        }, function (error) {
            console.log(error)
        })
    };
    $scope.searchCardFeeds();
    $scope.CardFeeds = []
});
app.controller("SliderarticlesController", function ($scope, $http, $location) {
    $scope.BookFeeds = {};
    $scope.BookModal = function (_id) {
        $scope.BookFeeds = _id;
        $('#SliderContent').modal('show')
    }
    $scope.searchCardFeeds = function () {
        $http.get('/api/SliderCardFeeds', null).then(function (result) {
            $scope.CardFeeds = result.data
        }, function (error) {
            console.log(error)
        })
    };
    $scope.searchCardFeeds();
    $scope.CardFeeds = []

    $scope.random = () => {
        return 0.5 - Math.random();
    }
});
app.controller("postProductController", function ($scope, $http, $location) {
    $scope.BookshopPost = {};
    $scope.BookShopModal = function (_id) {
        $scope.BookshopPost = _id;
        $('#BookshopPost').modal('show')
    }
    $scope.CardFeedModals = {};
    $scope.CardFeedModal = function (_id) {
        $scope.CardFeedModals = _id;
        $('#CardFeed-Post').modal('show')
    }
    $scope.searchbookshops = function () {
        $http.get('/api/bookshops', null).then(function (result) {
            $scope.bookshops = result.data
        }, function (error) {
            console.log(error)
        })
    };
    $scope.searchbookshops();
    $scope.bookshops = []
});
app.controller("FeedArticlesController", function ($scope, $http, $location) {
    $scope.CardFeedModals = {};
    $scope.CardFeedModal = function (_id) {
        $scope.CardFeedModals = _id;
        $('#CardFeed-Post').modal('show')
    }
    $scope.searchCardFeeds = function () {
        $http.get('/api/index.html', null).then(function (result) {
            $scope.CardFeeds = result.data;
            $scope.name = {}
        }, function (error) {
            console.log(error)
        })
    };
    $scope.searchCardFeeds();
    $scope.CardFeeds = []
});
app.controller("storeBookshopController", function ($scope, $http, $location) {
    $scope.searchbookshops = function () {
        $http.get('/api/store.html', null).then(function (result) {
            $scope.bookshops = result.data;
            $scope.name = {}
        }, function (error) {
            console.log(error)
        })
    };
    $scope.searchbookshops();
    $scope.bookshops = []
})