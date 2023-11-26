export function validateLogin(input) {
    const validationErrors = {}
  
    const email = input ? input['email'] : null;
    const password = input ? input['password'] : null;
  
    if (!email || email.length == 0) {
      validationErrors['email'] = 'cannot be blank';
    }
  
    if (!password || password.length == 0) {
      validationErrors['password'] = 'cannot be blank';
    }
    
    if (email && !email.match(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/)) {
      validationErrors['email'] = 'is invalid';
    }
  
    return validationErrors
  }