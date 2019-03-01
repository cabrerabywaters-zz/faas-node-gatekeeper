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

## Step by step guide:
