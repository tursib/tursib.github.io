Vidpub = {};

Vidpub.start = function(){

  Vidpub.rootUrl = "https://tursib.firebaseio.com";
  Vidpub.dbRef = new Firebase(Vidpub.rootUrl);

  Vidpub.dbRef.onAuth(function(authData){

  });

  Vidpub.dbRef.offAuth(function(authData){

  });

  loadCurrentUser(personalize);

}

Vidpub.createUser = function(credentials, next){
  Vidpub.dbRef.createUser(credentials,function(err,userData){

    Vidpub.loginWithEmailPassword(credentials, function(err,authData){
      var newUser = {
        email: credentials.email,
        name: credentials.name
      };
      Vidpub.saveUser(authData.uid, newUser, next);
    })

  });
};

Vidpub.saveUser = function(id, userData, next){
  Vidpub.dbRef.child("users").child(id).set(userData,next);
};

Vidpub.loginWithEmailPassword = function(credentials, next){
  Vidpub.dbRef.authWithPassword(credentials, function(error, authData) {
    if (error) {
      switch (error.code) {
        case "INVALID_EMAIL":
          next("The specified user account email is invalid.", null);
          break;
        case "INVALID_PASSWORD":
          next("The specified user account password is incorrect.", null);
          break;
        case "INVALID_USER":
          next("The specified user account does not exist.", null);
          break;
        default:
          next("Error logging user in: " +  error, null);
      }
    } else {
      next(null, authData);
    }
  });
};

Vidpub.loginGithub = function(next){
  Vidpub.dbRef.authWithOAuthPopup("github", function(error, authData) {
	  debugger
    if (error) {
      if (error.code === "TRANSPORT_UNAVAILABLE") {
        // fall-back to browser redirects, and pick up the session
        // automatically when we come back to the origin page
        ref.authWithOAuthRedirect("github", function(error) {
          next(err,null);
        });
      }
    } else if (authData) {
      var userData = {
        name: authData.github.displayName,
        email: authData.github.email,
        githubber: true
      }
      Vidpub.saveUser(authData.uid, userData, next);

    }
  });
};

Vidpub.loginFacebook= function(next){
  Vidpub.dbRef.authWithOAuthPopup("facebook", function(error, authData) {
    if (error) {
      if (error.code === "TRANSPORT_UNAVAILABLE") {
        // fall-back to browser redirects, and pick up the session
        // automatically when we come back to the origin page
        ref.authWithOAuthRedirect("facebook", function(error) {
          next(err,null);
        });
      }
    } else if (authData) {
      var userData = {
        name: authData.facebook.displayName,
        email: authData.facebook.email,
        githubber: false
      }
      Vidpub.saveUser(authData.uid, userData, next);

    }
  });
};

Vidpub.loginGoogle= function(next){
  Vidpub.dbRef.authWithOAuthPopup("google", function(error, authData) {
    if (error) {
      if (error.code === "TRANSPORT_UNAVAILABLE") {
        // fall-back to browser redirects, and pick up the session
        // automatically when we come back to the origin page
        ref.authWithOAuthRedirect("google", function(error) {
          next(err,null);
        });
      }
    } else if (authData) {
      var userData = {
        name: authData.google.displayName,
        email: authData.google.email,
        githubber: false
      }
      Vidpub.saveUser(authData.uid, userData, next);

    }
  });
};

var loadCurrentUser = function(next){
  var authData = Vidpub.dbRef.getAuth();
  if(authData){
    if(authData.provider == "github"){
      next({
        email: authData.github.email,
        name: authData.github.displayName,
        gitubber: true
      });
    }else{
      var url = Vidpub.rootUrl + "/users/" + authData.uid;
      var ref = new Firebase(url);
      ref.once("value", function(user){
        next(user.val());
      });
    }

  }else{
    next(null);
  }
}

var personalize = function(user){
  var ViewModel = {
    isLoggedIn: user ? true : false,
    name: ko.computed(function(){
      if(user){
        return user.name
      }else{
        return "";
      }
    }),
    login_or_out : function(){
      if(user){
        Vidpub.dbRef.unauth();
        location.href = "/"
      }else{
        location.href = "/account/login"
      }
    },
    login_or_out_button : ko.computed(function(){
      if(user){
        return "Logout";
      }else{
        return "Login";
      }
    })
  }
  ko.applyBindings(ViewModel);

  	if(user == null && window.location.pathname != "/account/login.html")
	{
		window.location.href = "/account/login.html";
	}
  
}

Vidpub.canSeeTutorials = function(user){

}
