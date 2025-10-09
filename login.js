// login.js - lightweight jQuery-powered login modal handler
(function(window, $){
  if (!window || !$) return;

  var modal = function() { return $('#login-modal'); };
  var openBtn = function() { return $('#nav-login-btn'); };

  function showModal() {
    // show modal (use Bootstrap classes provided in dist/styles.css)
    modal().removeClass('d-none').addClass('show').css('display', 'block').attr('aria-hidden','false');
    // add backdrop element expected by Bootstrap styles
    if ($('.modal-backdrop.show').length === 0) {
      $('<div class="modal-backdrop fade show"></div>').appendTo(document.body);
    }
    $('body').addClass('modal-open');
    $('#login-email').focus();
  }
  function hideModal() {
    modal().removeClass('show').addClass('d-none').css('display', 'none').attr('aria-hidden','true');
    $('.modal-backdrop').remove();
    $('body').removeClass('modal-open');
  }

  function setLoggedIn(email) {
    try { localStorage.setItem('eshop_user', email); } catch(e){}
    // Try to get user name from localStorage, fallback to email prefix
    var displayName = email.split('@')[0];
    try {
      var storedName = localStorage.getItem('eshop_user_name');
      if (storedName) {
        displayName = storedName.split(' ')[0]; // Use first name only
      }
    } catch(e) {}
    openBtn().text(displayName).prop('disabled', false).removeClass('btn-outline-light').addClass('btn-success');
  }
  function setLoggedOut() {
    try { 
      localStorage.removeItem('eshop_user');
      localStorage.removeItem('eshop_user_name');
      localStorage.removeItem('eshop_user_role');
    } catch(e){}
    openBtn().text('Login').prop('disabled', false).removeClass('btn-success').addClass('btn-outline-light');
  }

  function init() {
    // No inline styles: rely on compiled Bootstrap-based stylesheet in dist/styles.css
    
    // Real-time email validation to prevent leading spaces and space-only input
    $(document).on('input', '#login-email', function(){
      var email = $(this).val();
      
      // Remove any leading spaces (spaces before any character)
      var cleanEmail = email.replace(/^\s+/, '');
      
      // Prevent email field from containing only spaces
      if (cleanEmail.length === 0 && email.length > 0) {
        $(this).val('');
        $(this).addClass('is-invalid');
        return;
      }
      
      // Update field if we removed leading spaces
      if (cleanEmail !== email) {
        $(this).val(cleanEmail);
        email = cleanEmail;
      }
      
      // Also remove spaces before @ symbol (existing functionality)
      var finalEmail = email.replace(/\s+@/g, '@');
      if (finalEmail !== email) {
        $(this).val(finalEmail);
      }
      
      // Remove invalid class if field has valid content
      if (email.trim().length > 0) {
        $(this).removeClass('is-invalid');
      }
    });

    // Prevent typing spaces at the beginning of email field
    $(document).on('keydown', '#login-email', function(e){
      var email = $(this).val();
      // Prevent space key if field is empty or contains only spaces
      if (e.key === ' ' && email.trim().length === 0) {
        e.preventDefault();
        return false;
      }
    });

    // Handle paste events in email field to prevent space-only content
    $(document).on('paste', '#login-email', function(e){
      var self = this;
      setTimeout(function(){
        var email = $(self).val();
        // If pasted content is only spaces, clear the field
        if (email.trim().length === 0 && email.length > 0) {
          $(self).val('');
          $(self).addClass('is-invalid');
        }
      }, 1);
    });

    // Real-time password validation
    $(document).on('input', '#login-password', function(){
      var pw = $(this).val();
      // Check if password is only spaces
      if (pw.trim().length === 0 && pw.length > 0) {
        $(this).addClass('is-invalid');
      } else {
        $(this).removeClass('is-invalid');
      }
    });

    // wire up open button
    openBtn().on('click', function(){
      // if logged in, show simple logout prompt
      var u = localStorage.getItem('eshop_user');
      if (u) {
        if (confirm('Sign out ' + u + '?')) { setLoggedOut(); }
        return;
      }
      showModal();
    });

    // modal buttons
  $(document).on('click', '#login-close, #login-cancel', function(){ hideModal(); });

    // forgot password link
    $(document).on('click', '#forgot-password-link', function(e){
      e.preventDefault();
      alert('Forgot Password feature coming soon!\n\nFor now, you can use any email and password to sign in.');
    });

    // create account link
    $(document).on('click', '#create-account-link', function(e){
      e.preventDefault();
      var email = prompt('Enter your email address to create an account:');
      if (email) {
        // Clean the email and validate
        email = email.replace(/\s+@/g, '@');
        var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        var hasSpaceBeforeAt = /\s@/.test(email);
        
        if (emailPattern.test(email) && !hasSpaceBeforeAt) {
          alert('Account created successfully for ' + email + '!\n\nYou can now sign in with any password.');
          $('#login-email').val(email);
          $('#login-password').focus();
        } else {
          alert('Please enter a valid email address without spaces before the @ symbol.');
        }
      }
    });

    // backdrop click closes
  $(document).on('click', '#login-modal', function(e){ if (e.target.id === 'login-modal') hideModal(); });

  // ESC key closes modal
  $(document).on('keydown', function(e){ if (e.key === 'Escape') { if (!modal().hasClass('d-none')) hideModal(); } });

    // simple validation and fake auth
    $(document).on('submit', '#login-form', function(e){
      e.preventDefault();
      var email = $('#login-email').val() || '';
      var pw = $('#login-password').val() || '';
      var valid = true;
      
      // Enhanced email validation - check format, no spaces before @, and not just spaces
      var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      var hasSpaceBeforeAt = /\s@/.test(email);
      var isOnlySpaces = email.trim().length === 0 && email.length > 0;
      
      if (!emailPattern.test(email) || hasSpaceBeforeAt || isOnlySpaces || email.trim().length === 0) { 
        $('#login-email').addClass('is-invalid'); 
        valid = false; 
      } else { 
        $('#login-email').removeClass('is-invalid'); 
      }
      
      // Enhanced password validation - check length and not just spaces
      var trimmedPw = pw.trim();
      if (pw.length < 3 || trimmedPw.length === 0) { 
        $('#login-password').addClass('is-invalid'); 
        valid = false; 
      } else { 
        $('#login-password').removeClass('is-invalid'); 
      }
      
      if (!valid) return;

      // JSON file authentication: verify against users.json
      $('#login-feedback').hide().removeClass('text-danger text-success');
      $('#login-feedback').text('Verifying credentials...').addClass('text-info').show();
      
      // Disable submit button during verification
      $('#login-form button[type="submit"]').prop('disabled', true).text('Signing in...');
      
      // Fetch users from JSON file
      $.ajax({
        url: 'users.json',
        method: 'GET',
        dataType: 'json',
        timeout: 5000,
        success: function(data) {
          // Find matching user
          var matchedUser = null;
          if (data && data.users) {
            for (var i = 0; i < data.users.length; i++) {
              var user = data.users[i];
              if (user.email.toLowerCase() === email.toLowerCase() && user.password === pw) {
                matchedUser = user;
                break;
              }
            }
          }
          
          if (matchedUser) {
            // Login successful
            $('#login-feedback').text('Welcome, ' + matchedUser.name + '!').removeClass('text-info').addClass('text-success').show();
            // Store user info in localStorage
            try {
              localStorage.setItem('eshop_user', email);
              localStorage.setItem('eshop_user_name', matchedUser.name);
              localStorage.setItem('eshop_user_role', matchedUser.role);
            } catch(e) {}
            setLoggedIn(email);
            setTimeout(function(){ hideModal(); }, 800);
          } else {
            // Login failed - clear field validation errors and show only auth error
            $('#login-email, #login-password').removeClass('is-invalid');
            $('#login-feedback').text('Invalid email or password. Please try again.').removeClass('text-info').addClass('text-danger').show();
          }
        },
        error: function() {
          // Show error when JSON file can't be loaded - clear field validation errors
          $('#login-email, #login-password').removeClass('is-invalid');
          $('#login-feedback').text('Unable to verify credentials. Please check your connection and try again.').removeClass('text-info').addClass('text-danger').show();
        },
        complete: function() {
          // Re-enable submit button
          setTimeout(function(){
            $('#login-form button[type="submit"]').prop('disabled', false).text('Sign in');
          }, 500);
        }
      });
    });

    // restore session state
    var saved = null;
    try { saved = localStorage.getItem('eshop_user'); } catch(e){}
    if (saved) setLoggedIn(saved);
  }

  $(document).ready(init);
})(window, window.jQuery);
