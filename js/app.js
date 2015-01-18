app = angular.module('app', ['ionic', 'firebase']);

angular.isempty = function(val){
  if(val === null || angular.isUndefined(val) == true || val == " " || val == ""){
    return true;
  }else{
    return false;
  }
}


//Quickly create firebase regference
app.factory("fbrequest", function($firebase){
    this.angularfireref = function(childs){
        ref = new Firebase("https://rabbitapp.firebaseio.com").child(childs);
        sync = $firebase(ref);  
        return sync;
    }
});


app.filter('reverse', function() {
 
      return function(items) {
         return items.slice().reverse();
      };
   });

//Used for making HTTP requests to PHP Files
app.service('dbrequest', function($http){
  this.doDbRequest = function(urll, meth, dataa){ 
    var request = $http({method: meth, url: urll, data: dataa});  
    return(request.then());
  }
});


app.config(function($stateProvider, $urlRouterProvider){
    $urlRouterProvider.when('', "/landing");
    $stateProvider
        .state("landing", { url: '/landing', templateUrl: 'pages/landing.html' })
        .state("register1", { url: '/register/1', templateUrl: 'pages/register/register.html' })
        .state("login", { url: '/login', templateUrl: 'pages/login.html' })
        .state("home", { url: '/home', templateUrl: 'pages/home.html' })

});


app.controller('loginCtrl', function($scope, $ionicLoading, $state, $ionicPopup) {

    $scope.show = function(txt) {
        $ionicLoading.show({
          template: txt
        });
    };
    $scope.hide = function(){
        $ionicLoading.hide();
    };

    $scope.login = function(){
        ref = new Firebase("https://activityapp.firebaseio.com");

         if(angular.isempty($scope.email) || angular.isempty($scope.password)){
            $ionicPopup.alert({title: "Fill all the fields.", content: "Check your form again. You have missed to type something.", okType: "button-assertive"}); 
            return false;
        }

    $scope.show("Logging you in");

    ref.authWithPassword({
        "email": $scope.email,
        "password": $scope.password
    }, function(error, authData) {
        if(error){
            $scope.hide();
            $ionicPopup.alert({title: "Login has failed.", content: error, okType: "button-assertive"}); 
        }else{
           $scope.hide();
            $state.go("home");
        }
    });
}
});
//Landing Page Controller Start
app.controller('landingCtrl', function($scope, $ionicPopup, fbrequest, $state){
    ref = new Firebase("https://activityapp.firebaseio.com");

    $scope.show = false;

    $scope.checkLogin = function(){
        ref.onAuth(function(authData){
          if(authData){
              $state.go('home');
          }else{
              $scope.show = true;
          }
        });
    }
    
}); //Landing Page Controller End

//Register Page Controller Start
app.controller('register1Ctrl', function($scope, $ionicPopup, $state, $ionicLoading, $firebase){
    
    ref = new Firebase("https://activityapp.firebaseio.com");
    
    $scope.show = function(txt) {
        $ionicLoading.show({
          template: txt
        });
    };
    $scope.hide = function(){
        $ionicLoading.hide();
    };

    //Step one form submit function
    $scope.step1 = function(){
        
        if(angular.isempty($scope.fname) || angular.isempty($scope.lname) || angular.isempty($scope.email) || angular.isempty($scope.password)){
            $ionicPopup.alert({title: "Fill all the fields.", content: "Check your form again. You have missed to type something.", okType: "button-assertive"}); 
            return false;
        }

        $scope.show("Creating account...");
        
            ref.createUser({
                email: $scope.email,
                password: $scope.password
            }, function(error) {
                    if(error) {
                        switch(error.code) {
                            case "EMAIL_TAKEN":
                                $scope.hide();
                                 $ionicPopup.alert({title: "Email is taken.", content: "You must alreay have a account. This email is already registered on Activity.", okType: "button-assertive"}); 
                            break;
                            case "INVALID_EMAIL":
                                $scope.hide();
                                $ionicPopup.alert({title: "Wrong email address.", content: "Check your email address again.", okType: "button-assertive"}); 

                            break;
                            default:
                                $scope.hide();
                                $ionicPopup.alert({title: "Something went wrong.", content: error, okType: "button-assertive"}); 

                        }
                    }else{
                        ref.authWithPassword({
                            "email": $scope.email,
                            "password": $scope.password
                        }, function(error, authData) {
                            if(error){
                                $scope.hide();
                                $ionicPopup.alert({title: "Login has failed.", content: error, okType: "button-assertive"}); 
                            }else{
                                uid = authData.uid;
                                split = uid.split(":");
                                uid = split['1'];
                                refUsers = new Firebase("https//activityapp.firebaseio.com").child("users");
                                Userssync = $firebase(refUsers);
                                $scope.fullname = $scope.fname + " " + $scope.lname;
                                    Userssync.$update(uid, {fname: $scope.fname, lname: $scope.lname, email: $scope.email, fullname: $scope.fullname}).then(function(ref) {
                                        $scope.hide();
                                        $state.go("home");
                                    });
                            }
                        });
                    }
                });
        
}

});//Register Step 1 Page Controller End

app.controller('headerCtrl', function($scope, $state, $firebase){
      ref = new Firebase("https://activityapp.firebaseio.com");

      $scope.logout = function(){
    ref.unauth();
    $state.go("landing");
  }
});
app.controller('homeCtrl', function ($scope, $firebase, $ionicLoading, $state) {
  ref = new Firebase("https://activityapp.firebaseio.com");
  authData = ref.getAuth();
  $scope.userId = authData.uid;
  split = $scope.userId .split(":");
  $scope.userId = split['1'];


    usernamePath = ref.child("users").child($scope.userId).child("fullname");
    usernamePathSync = $firebase(usernamePath);
    $scope.userFullname = usernamePathSync.$asObject();


    activitiesPath = ref.child("activities");
    activitesPathSync = $firebase(activitiesPath);
    $scope.activitesList = activitesPathSync.$asArray();



    $scope.showBtn = false;
    $scope.getWhen = function(datee){
        var date = new Date(datee);
       datee = date.toLocaleString(navigator.language, {day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute:'2-digit'});
        return datee;
    }
    $scope.show = function(txt) {
        $ionicLoading.show({
          template: txt
        });
    };

    $scope.hide = function(){
        $ionicLoading.hide();
    };
    $scope.selected = function(){
       //$scope.show("Adding Activity..");

       avtivityImg = null;
            if($scope.activity == "Camping."){
                avtivityImg = "act/camping.png";
            }
            if($scope.activity == "Programming."){
                avtivityImg = "act/programing.png";
            }
            if($scope.activity == "Eating dinner."){
                avtivityImg = "act/dinner.png";
            }
            if($scope.activity == "Having fun at the beach."){
                avtivityImg = "act/beach.png";
            }
            if($scope.activity == "Sleeping."){
                avtivityImg = "act/sleeping.png";
            }
            if($scope.activity == "Travelling."){
                avtivityImg = "act/travelling.png";
            }
            if($scope.activity == "At the sea."){
                avtivityImg = "act/sea.png";
            }
            if($scope.activity == "Cooking."){
                avtivityImg = "act/cooking.png";
            }
            if($scope.activity == "Going on a rampage as a zombie."){
                avtivityImg = "act/zombie.png";
            }
             ref = new Firebase("https://activityapp.firebaseio.com/activities");
             actSync = $firebase(ref);

            $scope.userFullname.$loaded().then(function(){
                name = $scope.userFullname.$value;
                console.log($scope.activity)
                actSync.$push({activity: $scope.activity, avtivityImg: avtivityImg, when: Firebase.ServerValue.TIMESTAMP, name: name}).then(function(ref){
                   // $scope.hide();
                });
            });
           
    }
});


