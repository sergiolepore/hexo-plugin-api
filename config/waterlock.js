
/**
 * waterlock
 *
 * defines various options used by waterlock
 * for more informaiton checkout
 * 
 * http://waterlock.ninja/documentation
 */
module.exports.waterlock = {
  
  // Base URL
  // 
  // used by auth methods for callback URI's using oauth and for password
  // reset links.
  baseUrl: process.env.BASE_URL || 'http://localhost:1337',
  
  // Auth Method(s) 
  // 
  // this can be a single string, an object, or an array of objects for your 
  // chosen auth method(s) you will need to see the individual module's README
  // file for more information on the attributes necessary. This is an example
  // of the local authentication method with password reset tokens disabled.
  authMethod: [
    {
      name:'waterlock-local-auth',
      passwordReset:{
        tokens: false,
        mail: {
          protocol: 'SMTP',
          options:{
            service: process.env.MAIL_SERVICE || 'Gmail',
            auth: {
              user: process.env.MAIL_USER || 'gmail.user@gmail.com',
              pass: process.env.MAIL_PASS || 'userpass'
            }
          },
          from: 'no-reply@domain.com',
          subject: 'Your password reset!',
          forwardUrl: process.env.BASE_URL || 'http://localhost:1337'
        },  
        template:{
          file: '../views/email/reset.jade',
          vars:{}
        }
      },
      createOnNotFound: false
    }
  ],

  // JSON Web Tokens
  //
  // this provides waterlock with basic information to build your tokens, 
  // these tokens are used for authentication, password reset, 
  // and anything else you can imagine
  jsonWebTokens:{
    secret: process.env.JWT_SECRET || 'oiQWC0ioW4x68a1cIA966A6IM6PbJgKZ',
    expiry:{
      unit: 'days',
      length: '30'
    },
    audience: 'hexo-plugin-api',
    subject: 'subject'
  },

  // Post Actions
  // 
  // Lets waterlock know how to handle different login/logout
  // attempt outcomes.
  postActions:{
    // post login event
    login: {

      // This can be any one of the following
      // 
      // url - 'http://example.com'
      // relativePath - '/blog/post'
      // obj - {controller: 'blog', action: 'post'}
      // string - 'custom json response string'
      // default - 'default'
      success: 'default',

      // This can be any one of the following
      // 
      // url - 'http://example.com'
      // relativePath - '/blog/post'
      // obj - {controller: 'blog', action: 'post'}
      // string - 'custom json response string'
      // default - 'default'
      failure: 'default'
    },

    //post logout event
    logout: {

      // This can be any one of the following
      // 
      // url - 'http://example.com'
      // relativePath - '/blog/post'
      // obj - {controller: 'blog', action: 'post'}
      // string - 'custom json response string'
      // default - 'default'
      success: 'default',

      // This can be any one of the following
      // 
      // url - 'http://example.com'
      // relativePath - '/blog/post'
      // obj - {controller: 'blog', action: 'post'}
      // string - 'custom json response string'
      // default - 'default'
      failure: 'default'
    }
  }
};