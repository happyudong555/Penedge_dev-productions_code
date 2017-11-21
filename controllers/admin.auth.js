var app = angular.module('app', []);
app.factory('LoginService', function ($q, $http) {
    return {
        getLoginInformation: function () {
            var q = $q.defer();
            $http.get('/info').then(function (response) {
                if (response.data.isAuthenticated) {
                    q.resolve(response.data.data)
                } else {
                    q.reject('Not Authenticated')
                }
            }).catch(function (e) {
                q.reject(e)
            });
            return q.promise
        }
    }
});
app.run(function ($rootScope, $location, LoginService) {
    $rootScope.user = {};
    LoginService.getLoginInformation().then(function (response) {
        console.log('response', response);
        $rootScope.user = response
    }).catch(function (error) {
        console.log('error', error);
        window.location.href = '/'
    })
});
app.controller("articlesController", function ($scope, $http, $location) {
    $scope.NewsFeed = {};
    $scope.openModal = function (_id) {
        $scope.NewsFeed = _id;
        $('#post-feed-modal').modal('show')
    }

    function readURL(input) {
        if (input.files && input.files[0]) {
            var reader = new FileReader();
            reader.onload = function (e) {
                $('#uploadNewsImage').attr('src', e.target.result)
            }
            reader.readAsDataURL(input.files[0])
        }
    }
    $("#coverImageNews").change(function () {
        readURL(this)
    });
    $scope.UploadImagesShow = !1;
    $scope.UploadImagesToggle = function () {
        $scope.UploadImagesShow = $scope.UploadImagesShow ? !1 : !0
    }
    $scope.searchPostFeeds = function () {
        $http.get('/api/admin/PostFeeds', null).then(function (result) {
            $scope.PostFeeds = result.data
        }, function (error) {
            console.log(error)
        })
    };
    $scope.searchPostFeeds();
    $scope.PostFeeds = [];
    $scope.CreateNews = function () {
        var file = $scope.data.image;
        var uploadUrl = "/api/upload";
        var fd = new FormData();
        fd.append('file', file);
        $http.post(uploadUrl, fd, {
            transformRequest: angular.identity,
            headers: {
                'Content-Type': undefined
            }
        }).then(function () {
            $scope.data.image = file.name;
            $http.post('/api/admin/PostFeeds', $scope.data, null).then(function (result) {
                $scope.PostFeeds.push($scope.data);
                $scope.data = {};
                location.href = "admin.html"
            }, function (error) {
                console.log(error)
            })
        }).error(function () {
            console.log("error!!")
        })
    };

    // edit post
    $scope.data = {};
    $scope.editPost = (index) => {
        $('#editNewsPost').modal('show');
        function readURL(input) {
            if (input.files && input.files[0]) {
                var reader = new FileReader();
                reader.onload = function (e) {
                    $('#uploadNewsImage').attr('src', e.target.result)
                }
                reader.readAsDataURL(input.files[0])
            }
        }
        $("#coverImageNews").change(function () {
            readURL(this)
        });
        $scope.currentIndex = index;
        $scope.data._id = $scope.PostFeeds[index]._id;
        $scope.data.storyname = $scope.PostFeeds[index].storyname;
        $scope.data.content = $scope.PostFeeds[index].content;
    }

    $scope.update = function() {
        var file = $scope.data.image;

        if (file) {
            var uploadUrl = "/api/upload";
            var fd = new FormData();
            fd.append('file', file);
            $http.post(uploadUrl, fd, {
                transformRequest: angular.identity,
                headers: {
                    'Content-Type': undefined
                }
            }).then(function () {
                $scope.data.image = file.name;
                var id = $scope.data._id;
                $http.put(`/api/admin/PostFeeds/${id}`, $scope.data, null).then(function (result) {
                    $scope.PostFeeds.push($scope.data);
                    $scope.data = {};
                    location.href = "admin.html"
                }, function (error) {
                    console.log(error)
                })
            }).error(function () {
                console.log("error!!")
            })
        } else {
            var id = $scope.data._id;

            $http.put(`/api/admin/PostFeeds/${id}`, $scope.data, null).then(function (result) {
                $scope.PostFeeds.push($scope.data);
                $scope.data = {};
                location.href = "admin.html"
            }, function (error) {
                console.log(error)
            })
        }
       
    }
    $scope.removePost = function (index) {
        $http.delete('/api/admin/PostFeeds/' + $scope.PostFeeds[index]._id, null).then(function () {
            $scope.PostFeeds.splice(index, 1)
        })
    }
});
app.directive('fileModel', ['$parse', function ($parse) {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            var model = $parse(attrs.fileModel);
            var modelSetter = model.assign;
            element.bind('change', function () {
                scope.$apply(function () {
                    modelSetter(scope, element[0].files[0])
                })
            })
        }
    }
}]);

app.controller("BlogController", function ($scope, $http, $location) {
    function readURL(input) {
        if (input.files && input.files[0]) {
            var reader = new FileReader();
            reader.onload = function (e) {
                $('#uploadStoryImage').attr('src', e.target.result)
            }
            reader.readAsDataURL(input.files[0])
        }
    }
    $("#coverImageStory").change(function () {
        readURL(this)
    });
    $scope.CardFeedModals = {};
    $scope.CardFeedModal = function (_id) {
        $scope.CardFeedModals = _id;
        $('#CardFeed-Post').modal('show')
    }
    $scope.UploadImagesShow = !1;
    $scope.UploadImagesToggle = function () {
        $scope.UploadImagesShow = $scope.UploadImagesShow ? !1 : !0
    }
    $scope.searchCardFeeds = function () {
        $http.get('/api/admin/CardFeeds', null).then(function (result) {
            $scope.CardFeeds = result.data
        }, function (error) {
            console.log(error)
        })
    };
    $scope.searchCardFeeds();
    $scope.CardFeeds = [];
    $scope.TimesPost = new Date();
    $scope.publish = function () {
        var file = $scope.data.image;
        var uploadUrl = "/api/upload";
        var fd = new FormData();
        fd.append('file', file);
        $http.post(uploadUrl, fd, {
            transformRequest: angular.identity,
            headers: {
                'Content-Type': undefined
            }
        }).then(function () {
            $scope.data.image = file.name;
            $http.post('/api/admin/CardFeeds', $scope.data, null).then(function (result) {
                $scope.CardFeeds.push($scope.data);
                $scope.data = {};
                location.href = "admin.html"
            }, function (error) {
                console.log(error)
            })
        }).error(function () {
            console.log("error!!")
        })
    };
    
    // edit post
    $scope.data = {};
    $scope.editPost = (index) => {
        $('#editPost').modal('show');
        $scope.currentIndex = index;
        $scope.data._id = $scope.CardFeeds[index]._id;
        $scope.data.storyname = $scope.CardFeeds[index].storyname;
        $scope.data.content = $scope.CardFeeds[index].content;
    }

    $scope.update = function() {
        var file = $scope.data.image;

        if (file) {
            var uploadUrl = "/api/upload";
            var fd = new FormData();
            fd.append('file', file);
            $http.post(uploadUrl, fd, {
                transformRequest: angular.identity,
                headers: {
                    'Content-Type': undefined
                }
            }).then(function () {
                $scope.data.image = file.name;
                var id = $scope.data._id;
                $http.put(`/api/admin/CardFeeds/${id}`, $scope.data, null).then(function (result) {
                    $scope.CardFeeds.push($scope.data);
                    $scope.data = {};
                    location.href = "admin.html"
                }, function (error) {
                    console.log(error)
                })
            }).error(function () {
                console.log("error!!")
            })
        } else {
            var id = $scope.data._id;

            $http.put(`/api/admin/CardFeeds/${id}`, $scope.data, null).then(function (result) {
                $scope.CardFeeds.push($scope.data);
                $scope.data = {};
                location.href = "admin.html"
            }, function (error) {
                console.log(error)
            })
        }
       
    }
    $scope.remove = function (index) {
        $http.delete('/api/admin/CardFeeds/' + $scope.CardFeeds[index]._id, null).then(function () {
            $scope.CardFeeds.splice(index, 1)
        })
    }
});


app.directive('fileModel', ['$parse', function ($parse) {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            var model = $parse(attrs.fileModel);
            var modelSetter = model.assign;
            element.bind('change', function () {
                scope.$apply(function () {
                    modelSetter(scope, element[0].files[0])
                })
            })
        }
    }
}]);
app.controller("postProductController", function ($scope, $http, $location) {
    function readURL(input) {
        if (input.files && input.files[0]) {
            var reader = new FileReader();
            reader.onload = function (e) {
                $('#uploadproductscover').attr('src', e.target.result)
            }
            reader.readAsDataURL(input.files[0])
        }
    }
    $("#coverImage").change(function () {
        readURL(this)
    });
    $scope.BookshopPost = {};
    $scope.BookShopModal = function (_id) {
        $scope.BookshopPost = _id;
        $('#BookshopPost').modal('show')
    }
    $scope.searchbookshops = function () {
        $http.get('/api/admin/bookshops', null).then(function (result) {
            $scope.bookshops = result.data
        }, function (error) {
            console.log(error)
        })
    };
    $scope.searchbookshops();
    $scope.bookshops = [];
    $scope.create = function () {
        var file = $scope.data.image;
        var uploadUrl = "/api/upload";
        var fd = new FormData();
        fd.append('file', file);
        $http.post(uploadUrl, fd, {
            transformRequest: angular.identity,
            headers: {
                'Content-Type': undefined
            }
        }).then(function () {
            $scope.data.image = file.name;
            $http.post('/api/admin/bookshops', $scope.data, null).then(function (result) {
                $scope.bookshops.push($scope.data);
                $scope.data = {};
                location.href = "admin.html"
            })
        })
    };
    // edit post
    $scope.data = {};
    $scope.editPost = (index) => {
        $('#editShop').modal('show');
        function readURL(input) {
            if (input.files && input.files[0]) {
                var reader = new FileReader();
                reader.onload = function (e) {
                    $('#EditBookCover').attr('src', e.target.result)
                }
                reader.readAsDataURL(input.files[0])
            }
        };
        $("#bookcoverUpload")
            .change(function () {
                readURL(this)
        });
        $scope.currentIndex = index;
        $scope.data._id = $scope.bookshops[index]._id;
        $scope.data.bookname = $scope.bookshops[index].bookname;
        $scope.data.content = $scope.bookshops[index].content;
        $scope.data.shipping = $scope.bookshops[index].shipping;
        $scope.data.price = $scope.bookshops[index].price;
    }

    $scope.update = function() {
        var file = $scope.data.image;
        if (file) {
            var uploadUrl = "/api/upload";
            var fd = new FormData();
            fd.append('file', file);
            $http.post(uploadUrl, fd, {
                transformRequest: angular.identity,
                headers: {
                    'Content-Type': undefined
                }
            }).then(function () {
                $scope.data.image = file.name;
                var id = $scope.data._id;
                $http.put(`/api/admin/bookshops/${id}`, $scope.data, null).then(function (result) {
                    $scope.bookshops.push($scope.data);
                    $scope.data = {};
                    location.reload();
                }, function (error) {
                    console.log(error)
                })
            }).error(function () {
                console.log("error!!")
            })
        } else {
            var id = $scope.data._id;

            $http.put(`/api/admin/bookshops/${id}`, $scope.data, null).then(function (result) {
                $scope.bookshops.push($scope.data);
                $scope.data = {};
                location.href = "admin.html"
            }, function (error) {
                console.log(error)
            })
        }
       
    }
    $scope.delete = function (index) {
        $http.delete('/api/admin/bookshops/' + $scope.bookshops[index]._id, null).then(function () {
            $scope.bookshops.splice(index, 1)
        })
    }
});
app.controller("sliderController", function ($scope, $http, $location) {
    $scope.ContentFormShow = !1;
    $scope.ContentsToggle = function () {
        $scope.ContentFormShow = $scope.ContentFormShow ? !1 : !0
    }

    function readURL(input) {
        if (input.files && input.files[0]) {
            var reader = new FileReader();
            reader.onload = function (e) {
                $('#uploadPromotionsImage').attr('src', e.target.result)
            }
            reader.readAsDataURL(input.files[0])
        }
    }
    $("#coverPromotions").change(function () {
        readURL(this)
    });
    $scope.promotion = {};
    $scope.promotionsSliderModal = function (_id) {
        $scope.promotion = _id;
        $('#promotionsModalPost').modal('show')
    }
    $scope.searchpromotionsSliders = function () {
        $http.get('/api/admin/promotionsSliders', null).then(function (result) {
            $scope.promotionsSliders = result.data
        }, function (error) {
            console.log(error)
        })
    };
    $scope.searchpromotionsSliders();
    $scope.promotionsSliders = [];
    $scope.publish = function () {
        var file = $scope.data.image;
        var uploadUrl = "/api/upload";
        var fd = new FormData();
        fd.append('file', file);
        $http.post(uploadUrl, fd, {
            transformRequest: angular.identity,
            headers: {
                'Content-Type': undefined
            }
        }).then(function () {
            $scope.data.image = file.name;
            $http.post('/api/admin/promotionsSliders', $scope.data, null).then(function (result) {
                $scope.promotionsSliders.push($scope.data);
                $scope.data = {};
                location.href = "admin.html"
            })
        })
    };
    // edit post
    $scope.data = {};
    $scope.editPost = (index) => {
        $('#editPromotion').modal('show');
        function readURL(input) {
            if (input.files && input.files[0]) {
                var reader = new FileReader();
                reader.onload = function (e) {
                    $('#uploadPromotionsImage').attr('src', e.target.result)
                }
                reader.readAsDataURL(input.files[0])
            }
        };
        $("#coverPromotions")
            .change(function () {
                readURL(this)
        });
        $scope.currentIndex = index;
        $scope.data._id = $scope.promotionsSliders[index]._id;
        $scope.data.bookname = $scope.promotionsSliders[index].bookname;
        $scope.data.content = $scope.promotionsSliders[index].content;
        $scope.data.shipping = $scope.promotionsSliders[index].shipping;
        $scope.data.price = $scope.promotionsSliders[index].price;
    }

    $scope.update = function() {
        var file = $scope.data.image;
        if (file) {
            var uploadUrl = "/api/upload";
            var fd = new FormData();
            fd.append('file', file);
            $http.post(uploadUrl, fd, {
                transformRequest: angular.identity,
                headers: {
                    'Content-Type': undefined
                }
            }).then(function () {
                $scope.data.image = file.name;
                var id = $scope.data._id;
                $http.put(`/api/admin/promotionsSliders/${id}`, $scope.data, null).then(function (result) {
                    $scope.promotionsSliders.push($scope.data);
                    $scope.data = {};
                    location.reload();
                }, function (error) {
                    console.log(error)
                })
            }).error(function () {
                console.log("error!!")
            })
        } else {
            var id = $scope.data._id;

            $http.put(`/api/admin/promotionsSliders/${id}`, $scope.data, null).then(function (result) {
                $scope.promotionsSliders.push($scope.data);
                $scope.data = {};
                location.href = "admin.html"
            }, function (error) {
                console.log(error)
            })
        }
    }
    $scope.delete = function (index) {
        $http.delete('/api/admin/promotionsSliders/' + $scope.promotionsSliders[index]._id, null).then(function () {
            $scope.promotionsSliders.splice(index, 1)
        })
    }
});
app.controller("storeBookshopController", function ($scope, $http, $location) {
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
    $scope.bookshops = [];
    $scope.searchbookshops = function () {
        $http.get('/api/store.html', null).then(function (result) {
            $scope.bookshops = result.data;
            $scope.name = {}
        }, function (error) {
            console.log(error)
        })
    };
    $scope.searchbookshops();
    $scope.addCart = function (BookshopPost) {
        console.log();
        $http.post('/api/admin/cartItems', BookshopPost).then(function (result) {
            localStorage.removeItem('items');
            location.href = "admin.carts.html"
        }, function (error) {
            console.log(error)
        })
    };
    $scope.delete = function (index) {
        $http.delete('/api/admin/bookshops/' + $scope.bookshops[index]._id, null).then(function () {
            $scope.bookshops.splice(index, 1)
        })
    }
});
app.controller("FeedPromotionController", function ($scope, $http, $location) {
    $scope.promotion = {};
    $scope.promotionsSliderModal = function (_id) {
        $scope.promotion = _id;
        $('#promotionsModalPost').modal('show')
    }
    $scope.searchpromotionsSliders = function () {
        $http.get('/api/FeedPromotionSliders', null).then(function (result) {
            $scope.promotionsSliders = result.data
        }, function (error) {
            console.log(error)
        })
    };
    $scope.searchpromotionsSliders();
    $scope.promotionsSliders = [];
    $scope.addCart = function (promotion) {
        $http.post('/api/admin/cartItems', promotion).then(function (result) {
            localStorage.removeItem('items');
            location.href = "admin.carts.html"
        }, function (error) {
            console.log(error)
        })
    };
    $scope.delete = function (index) {
        $http.delete('/api/admin/promotionsSliders/' + $scope.promotionsSliders[index]._id, null).then(function () {
            $scope.promotionsSliders.splice(index, 1)
        })
    }
});
app.controller("trackingOrderController", function ($scope, $http, $location, $filter) {
    $scope.Receipt = {};
    $scope.ReceiptModal = function (_id) {
        $scope.Receipt = _id;
        $('#ReceiptOrderModal').modal('show')
    }

    function readURL(input) {
        if (input.files && input.files[0]) {
            var reader = new FileReader();
            reader.onload = function (e) {
                $('#uploadproductscover').attr('src', e.target.result)
            }
            reader.readAsDataURL(input.files[0])
        }
    }
    $("#coverImage").change(function () {
        readURL(this)
    });
    $scope.upload = function () {
        var file = $scope.data.image;
        var uploadUrl = "/api/upload";
        var fd = new FormData();
        fd.append('file', file);
        $http.post(uploadUrl, fd, {
            transformRequest: angular.identity,
            headers: {
                'Content-Type': undefined
            }
        }).then(function () {
            $scope.data.image = file.name;
            $scope.data.date = document.getElementById('datetimepicker1').value;
            $http.get('/api/allbook').then((res) => {
                $scope.allbook = res.data
            });
            $http.get('/api/allpro').then((res) => {
                $scope.allpro = res.data
            });
            setTimeout(() => {
                if ($scope.allbook.length || $scope.allpro.length) {
                    var dataStore = $scope.allbook.concat($scope.allpro);
                    var filterData = $filter('filter')(dataStore, {
                        bookname: $scope.data.order
                    }, !0);
                    if (filterData.length === 1) {
                        $scope.data.userpostid = filterData[0].user_id;
                        $http.post('/api/orders', $scope.data, null).then(function (result) {
                            $scope.data = {};
                            location.href = "admin.html"
                        })
                    } else {
                        alert('ชื่อ Product Order ไม่มีอยู่ในระบบ')
                    }
                    console.log(dataStore)
                }
            }, 1000)
        })
    };
    $scope.delete = function (index) {
        $http.delete('/api/orders/' + $scope.orders[index]._id, null).then(function () {
            $scope.orders.splice(index, 1)
        })
    };
    $scope.searchorders = function () {
        $http.get('/api/orders', null).then(function (result) {
            $scope.orders = result.data
        }, function (error) {
            console.log(error)
        })
    };
    $scope.searchorders();
    $scope.orders = []
});
app.controller("storyController", function ($scope, $http, $location) {
    $scope.CardFeedModals = {};
    $scope.CardFeedModal = function (_id) {
        $scope.CardFeedModals = _id;
        $('#CardFeed-Post').modal('show')
    }
    $scope.searchCardFeeds = function () {
        $http.get('/api/admin/CardFeeds/control', null).then(function (result) {
            $scope.CardFeeds = result.data
        }, function (error) {
            console.log(error)
        })
    };
    $scope.searchCardFeeds();
    $scope.CardFeeds = [];
    $scope.remove = function (index) {
        $http.delete('/api/admin/CardFeeds/' + $scope.CardFeeds[index]._id, null).then(function () {
            $scope.CardFeeds.splice(index, 1)
        })
    }
});
app.controller("newsController", function ($scope, $http, $location) {
    $scope.NewsFeed = {};
    $scope.openModal = function (_id) {
        $scope.NewsFeed = _id;
        $('#post-feed-modal').modal('show')
    }
    $scope.searchPostFeeds = function () {
        $http.get('/api/admin/PostFeeds/control', null).then(function (result) {
            $scope.PostFeeds = result.data
        }, function (error) {
            console.log(error)
        })
    };
    $scope.searchPostFeeds();
    $scope.PostFeeds = [];
    $scope.removePost = function (index) {
        $http.delete('/api/admin/PostFeeds/' + $scope.PostFeeds[index]._id, null).then(function () {
            $scope.PostFeeds.splice(index, 1)
        })
    }
});
app.controller("storeController", function ($scope, $http, $location) {
    $scope.BookshopPost = {};
    $scope.BookShopModal = function (_id) {
        $scope.BookshopPost = _id;
        $('#BookshopPost').modal('show')
    }
    $scope.searchbookshops = function () {
        $http.get('/api/admin/bookshops/control', null).then(function (result) {
            $scope.bookshops = result.data
        }, function (error) {
            console.log(error)
        })
    };
    $scope.searchbookshops();
    $scope.bookshops = [];
    $scope.delete = function (index) {
        $http.delete('/api/admin/bookshops/' + $scope.bookshops[index]._id, null).then(function () {
            $scope.bookshops.splice(index, 1)
        })
    }
});
app.controller("proController", function ($scope, $http, $location) {
    $scope.promotion = {};
    $scope.promotionsSliderModal = function (_id) {
        $scope.promotion = _id;
        $('#promotionsModalPost').modal('show')
    }
    $scope.searchpromotionsSliders = function () {
        $http.get('/api/admin/promotionsSliders/control', null).then(function (result) {
            $scope.promotionsSliders = result.data
        }, function (error) {
            console.log(error)
        })
    };
    $scope.searchpromotionsSliders();
    $scope.promotionsSliders = [];
    $scope.delete = function (index) {
        $http.delete('/api/admin/promotionsSliders/' + $scope.promotionsSliders[index]._id, null).then(function () {
            $scope.promotionsSliders.splice(index, 1)
        })
    }
});
app.controller("MyBankAccountController", function ($scope, $http, $location) {
    $scope.searchbanksSupports = function () {
        $http.get('/api/admin/banksSupports', null).then(function (result) {
            $scope.banksSupports = result.data
        }, function (error) {
            console.log(error)
        })
    };
    $scope.searchbanksSupports();
    $scope.banksSupports = [];
    $scope.submit = function () {
        $http.post('/api/admin/banksSupports', $scope.data).then(function (result) {
            $scope.banksSupports.push($scope.data);
            $scope.data = {};
            location.href = "admin.info.html"
        }, function (error) {
            console.log(error)
        })
    };
    $scope.delete = function (index) {
        $http.delete('/api/admin/banksSupports/' + $scope.banksSupports[index]._id, null).then(function () {
            $scope.banksSupports.splice(index, 1)
        })
    }
})