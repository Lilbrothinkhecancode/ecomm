export function validateUser(input) {
    const validationErrors = {}
  
    if (!input || !('name' in input) || !input['name'] || input['name'].length == 0) {
      validationErrors['name'] = 'cannot be blank'
    }
  
    if (!input?.email || input.email.length === 0) {
      validationErrors.email = 'cannot be blank';
    }
    
    if (!input?.password || input.password.length === 0) {
      validationErrors.password = 'cannot be blank';
    }
    
    if (input?.password && input.password.length < 8) {
      validationErrors.password = 'should be at least 8 characters';
    }
    
    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (input?.email && !emailRegex.test(input.email)) {
      validationErrors.email = 'is invalid';
    }
  
    return validationErrors
  }