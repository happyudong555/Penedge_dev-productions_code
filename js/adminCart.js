app.controller("CartListController", function ($scope, $http, $location) {
    $scope.searchcartItems = function () {
        $http.get('/api/cartItems', null).then(function (result) {
            $scope.cartItems = result.data
        }, function (error) {
            console.log(error)
        })
    };
    $scope.searchcartItems();
    $scope.cartItems = []
    
    $scope.addCart = function (BookshopPost) {
        console.log();
        $http.post('/api/cartItems', BookshopPost).then(function (result) {
            localStorage.removeItem('items');
            location.href = "carts.html"
        }, function (error) {
            console.log(error)
        })
    }


    $scope.removeCarts = function (index) {
        return $http.delete("/api/cartItems" + $scope.cartItems[index]._id).then(function (result) {
            $scope.cartItems.splice(index, 1)
        })
    }

    $scope.searchcartItems = function () {
        $http.get('/api/admin/cartItems/', null).then(function (result) {
            $scope.PostFeeds = result.data
        }, function (error) {
            console.log(error)
        })
    };
    $scope.searchcartItems();
    $scope.cartItems = []
    
    $scope.addCart = function (BookshopPost) {
        console.log();
        $http.post('/api/admin/cartItems/', BookshopPost).then(function (result) {
            localStorage.removeItem('items');
            location.href = "carts.html"
        }, function (error) {
            console.log(error)
        })
    }


    $scope.removeCarts = function (index) {
        return $http.delete("/api/admin/cartItems/" + $scope.cartItems[index]._id).then(function (result) {
            $scope.cartItems.splice(index, 1)
        })
    }

    $scope.total = function () {
        var total = 0;
        for (count = 0; count < $scope.cartItems.length; count++) total += parseInt($scope.cartItems[count].price);
        return total
    }
    
});