// Source : https://codepen.io/suez/pen/dPqxoM

$(document).ready(function() {

    var animating = false,
        submitPhase1 = 1100,
        submitPhase2 = 400,
        $login = $(".login"),
        $hotspot = $(".hotspot"),
        $login__submit = $(".login__submit");

    chilliController.host = "XXXXXX";
    chilliController.port = "3990";
    chilliController.interval = 60;

    chilliController.onError = handleErrors;
    chilliController.onUpdate = updateUI;

    var redirectUrl = "http://www.pihomeserver.fr";

    function ripple(elem, e) {
        $(".ripple").remove();
        var elTop = elem.offset().top,
            elLeft = elem.offset().left,
            x = e.pageX - elLeft,
            y = e.pageY - elTop;
        var $ripple = $("<div class='ripple'></div>");
        $ripple.css({top: y, left: x});
        elem.append($ripple);
    };

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

    function redirect() { window.location = redirectUrl; return false; }

    function connect(username, password) {
        chilliController.logon( username , password ) ;
    }

    function updateUI() {
        if (chilliController.clientState == 1) {
            setTimeout(function() {
                $login__submit.addClass("success");
                setTimeout(function() {
                    $hotspot.show();
                    $hotspot.css("top");
                    $hotspot.addClass("active");
                }, submitPhase2 - 70);
                setTimeout(function() {
                    $login.hide();
                    $login.addClass("inactive");
                    animating = false;
                    $login__submit.removeClass("success processing");
                    //redirect();
                }, submitPhase2);
            }, submitPhase1);
        } else if (chilliController.clientState == 0 && chilliController.command === 'logon') {
            document.getElementById('login__errors').innerHTML = "<div class='login__row'>" +
                "<p class='login__signup login__error'>" +
                "Username or password incorrect" +
                "</p>" +
                "</div>";

            animating = false;
            $login__submit.removeClass("processing");

            return;
        }
    }

    function handleErrors (code) {
        alert('The last contact with the Controller failed. Error code =' + code );
        if (animating) {
            animating = false;
            $login__submit.removeClass("processing");
        }
    }

    chilliController.refresh();
});