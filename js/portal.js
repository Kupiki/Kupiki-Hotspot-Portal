// Inspired from : https://codepen.io/suez/pen/dPqxoM

var animating = false,
    firstCheck = true,
    $spinner,$login,$terms,$connected,$login__submit,$errorPanel,
    configuration = {};

function handleErrors (code) {
  $errorPanel.css('display', 'table');
  $('.errorMessage').append("<p>The last contact with the Controller (" + configuration.chilliController.host + ":" + configuration.chilliController.port + ") failed</p>");
  $('.errorMessage').append("<p>Error : " + code + "</p>");
  $('.spinner').hide();
  if (animating) {
      animating = false;
      $login__submit.removeClass("processing");
  }
}

function ripple(elem, e) {
    $(".ripple").remove();
    var elTop = elem.offset().top,
        elLeft = elem.offset().left,
        x = e.pageX - elLeft,
        y = e.pageY - elTop;
    var $ripple = $("<div class='ripple'></div>");
    $ripple.css({top: y, left: x});
    elem.append($ripple);
}

function connect(username, password) {
    chilliController.logon( username , password ) ;
}

function updateUI() {
    if (firstCheck && chilliController.clientState == 1) {
        // First call and user is already logged in
        $spinner.hide();
        $connected.show();
    } else if (!firstCheck && chilliController.clientState == 1) {
        // Not first call and user is now logged in
        location.reload();
    } else if (chilliController.clientState == 0 && chilliController.command === 'logon') {
        // User not logged in with error message
        document.getElementById('login__errors').innerHTML = "<div class='login__row'>" +
            "<p class='login__signup login__error'>" +
            "Username or password incorrect" +
            "</p>" +
            "</div>";

        animating = false;
        $login__submit.removeClass("processing");
    } else {
        // First check, so display login form
        firstCheck = false;
        $spinner.hide();
        $login.show();
    }
}

$(document).ready(function() {
    $spinner = $(".spinner");
    $login = $(".login");
    $errorPanel = $(".errorPanel");
    $terms = $(".terms");
    $connected = $(".connected");
    $login__submit = $(".login__submit");

    animating   = false;
    firstCheck  = true;

    $.getJSON( "js/configuration.json", function( data ) {
      configuration = data;
    }).fail(function( jqxhr, textStatus, error ) {
      $errorPanel.css('display', 'table');
      $('.errorMessage').append("<p>Oops something went wrong with the configuration file</p>");
      $('.errorMessage').append(jqxhr.responseText);
    }).done(function() {
      chilliController.host     = configuration.chilliController.host;
      chilliController.port     = configuration.chilliController.port;
      chilliController.interval = configuration.chilliController.interval;

      chilliController.onError = handleErrors;
      chilliController.onUpdate = updateUI;

      $spinner.show();

      chilliController.refresh();
    });

    $(document).on("click", ".login__submit", function(e) {
        if (animating) return;

        var username =  document.getElementById('login__username').value ;
        var password =  document.getElementById('login__password').value ;

        if (username == null || username == '' || password == null || password == '') {
            document.getElementById('login__errors').innerHTML = "<div class='login__row'>" +
                "<p class='login__signup login__error'>" +
                "Username and password required" +
                "</p>" +
                "</div>";
            return;
        }

        animating = true;
        ripple($login__submit, e);
        $login__submit.addClass("processing");
        setTimeout(function() {
            connect(username, password);
        }, 100);
    });
});
