var configuration = {}, firstDisplay = true;

// The "getFormData()" function retrieves the names and values of each input field in the form;

function getFormData(form) {
  var data = {};
  $(form).find('input, select').each(function() {
    if (this.tagName.toLowerCase() === 'input') {
      if (this.type.toLowerCase() === 'checkbox') {
        data[this.name] = this.checked;
      } else if (this.type.toLowerCase() !== 'submit') {
        data[this.name] = this.value;
      }
    } else {
      data[this.name] = this.value;
    }
  });
  return data;
}

// The "addFormError()" function, when called, adds the "error" class to the form-group that wraps around the "formRow" attribute;

function addFormError(formRow, errorMsg) {
  var errorMSG = '<span class="error-msg">' + errorMsg + '</span>';
  $(formRow).parents('.form-group').append(errorMSG);
}

// FORM HANDLER:

// form_name - This attribute ties the form-handler function to the form you want to submit through ajax. Requires an ID (ex: #myfamousid)
// custom_validation -

function formHandler(form_name, custom_validation, success_message, error_message, success_function, error_function) {
  $(form_name).find('input[type="submit"]').on('click', function(e) { // if submit button is clicked
    
    window.onbeforeunload = null; // cancels the alert message for unsaved changes (if such function exists)
  
    $(form_name).find('.error-msg').remove();
    var submitButton = this;
    submitButton.disabled = true; // Disables the submit buttton until the rows pass validation or we get a response from the server.
    
    var form = $(form_name)[0];
    // The custom validation function must return true or false.
    if (custom_validation != null) {
      if (!custom_validation(form, getFormData(form))) {
        submitButton.disabled = false;
        return false;
      }
    }
    e.preventDefault(); //STOP default action
  });
  $(document).click(function(e) { // Whenever the user clicks inside the form, the error messages will be removed.
    if ($(e.target).closest(form_name).length) {
      setTimeout(function() {
        $(form_name).find('.error-msg').remove();
      }, 300);
    } else {
      return;
    }
  });
}

// LOGIN FORM: Validation function
function validate_login_form(form, data) {
  if (data.user_username === "") {
    // if username variable is empty
    addFormError(form['user_username'], 'The username is missing');
    return false; // stop the script if validation is triggered
  }
  
  if (data.user_password === "") {
    // if password variable is empty
    addFormError(form['user_password'], 'The password is missing');
    return false; // stop the script if validation is triggered
  }
  
  if (configuration.options.terms.active && !data.user_terms) {
    addFormError(form['user_terms'], configuration.options.terms.error);
    return false; // stop the script if validation is triggered
  }
  
  chilliController.logon( data.user_username , data.user_password ) ;
  return true;
}

formHandler('#login_form', validate_login_form, null, null, null, null, null, null);

var dialogBox = $('#dialog');

dialogBox.on('click', 'a.user-actions', function() {
  dialogBox.toggleClass('flip');
});

$('#successful_login').on('click', 'a.dialog-reset', function() {
  $('#successful_login').removeClass('active');
  dialogBox.removeClass('dialog-effect-out').addClass('dialog-effect-in');
  document.getElementById('login_form').reset();
});

function handleErrors (code) {
  $('.dialog-global-error').html('The last contact with the Controller (' + configuration.chilliController.host + ':' + configuration.chilliController.port + ') failed');
  $('.dialog-global-error').append('<p>Error : ' + code + '</p>');
  $('#login_form').hide();
}

function updateUI() {
  if (firstDisplay && chilliController.clientState === 1) {
    $('#dialog').addClass('dialog-effect-out');
    $('#successful_login').addClass('active');
  } else if (!firstDisplay && chilliController.clientState === 1) {
    // Not first call and user is now logged in. Reload will force device to hide the captive portal
    location.reload();
  } else if (chilliController.clientState === 0 && chilliController.command === 'logon') {
    // User not logged in with error message
    $('.dialog-global-error').html('Username or password incorrect');
  } else {
    // First time display, so display login form and change variable content
    firstDisplay = false;
  }
}

$(document).ready(function() {
  $.getJSON('js/configuration.json', function( data ) {
    configuration = data;
  
    chilliController.host     = configuration.chilliController.host;
    chilliController.port     = configuration.chilliController.port;
    chilliController.interval = configuration.chilliController.interval;
  
    chilliController.onError = handleErrors;
    chilliController.onUpdate = updateUI;
  
    if (configuration.options.terms && configuration.options.terms.active) {
      $('.terms').show();
      $('.terms_message').html(configuration.options.terms.message);
      $('.terms_content').html(configuration.options.terms.terms);
      $('.terms_link').html(configuration.options.terms.link);
    } else {
      $('.terms').hide();
    }
  
    chilliController.refresh();
  }).fail(function( jqxhr, textStatus, error ) {
    $('.dialog-global-error').html('Oops something went wrong with the configuration file');
    $('#login_form').hide();
  }).done(function() {
  
  });
});