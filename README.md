# Gatekeeper

## How to use:

```
const GateKeeper = require("faas-node-gatekeeper");

GateKeeper.validate(
  message,             // {String} The body of the request
  "payload-secret"     // {String} The name of the secret variable
  )
  .then(isValid => {
      if (!isValid) {
        callback(undefined, {
          status: "Error, your message could not be validated"
        });
        return;
      }

      // All your logic here!
  })
```

## Why?:

All functions available in OpenFaaS be default can be triggered without authentication, is very likely that you will need some kind of extra security if you dont want to completely expose your API to the WORLD

## Step by step guide:

### Overview

OpenFaaS does not provide any authentication mecanism, what we need to do is just to setup a basic check inside of the functions that we need to trigger (Yes! you will need to modify your code).
Basicaly the process is as follows:

1.- Create a secret key to HASH the body of your message

2.- Upload that key to your OpenFaaS server using the CLI

3.- Modify your code so it can handle the hashed body

4.- Send your request to the server as you normally would, but include a Hmac Header with the hashed body, using the your secret key

5.- Test it and enjoy!

### 1) Creating a secret

### 2) Upload the key

### 3) Modify you code

### 4) Send request

### 5) Test and enjoy!
