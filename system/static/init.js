// what to do if you're organizing ctf?
// 0) make lots of security breaches
// 1) if smb uses it, simply ban him/her
// Profit! You're excellent!
// Oh, I forgot to say: this is not a flag

// wait for onReady
$(document).ready(function() {
  $('#container').terminal(handleCommand, terminalSettings);
  if (localStorage && localStorage.getItem('invite')) {
    $('#container').terminal().exec('login ' + localStorage.getItem('invite'));
  }
});
