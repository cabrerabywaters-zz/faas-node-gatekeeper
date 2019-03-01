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

1.- Create and upload your secret key to HASH the body of your message using the CLI

3.- Modify your code so it can handle the hashed body

4.- Send your request to the server as you normally would, but include a Hmac Header with the hashed body, using the your secret key

5.- Enjoy!

### 1) Creating a secret

Using the FaaS-CLI we can easily create and upload the key to our server

```
echo -n "<your-secret>" | faas-cli secret create payload-secret
```

In this case, we just created a secret key named "payload-secret" with value "<your-secret>"

Once we have this in place, we need to include the secret in our function's YML

```
provider:
  name: faas
  gateway: http://<my-gateway>:8080
functions:
  my-function:
    lang: node
    handler: ./some-handler
    image: <my-name>/<my-image>:<my-tag>
    secrets:
      - payload-secret
```

### 3) Modify you code

Now we will need to modify our code to check for the proper hash of the body.
When you sign a function with faas-cli with a given key, the created request will include a Http_Hmac header with the hashed version of your message body, thats what we need to check!

Gatekeeper makes this process quite easy

Assuming that you are using a basic Node container (not with Express), your code should look something like this

```
const GateKeeper = require("faas-node-gatekeeper");

module.exports = (context, callback) => {
  GateKeeper.validate(context, "payload-secret")
  .then(isValid => {
      if (!isValid) {
        callback(undefined, {
          status: "Error, your message could not be validated"
        });
        return;
      }

      // All your logic here!
      callback(undefined, {
          status: "Success, your function is working!"
        });
  })
}
```

First, we require Gatekeeper, then we validate the body using the validate() function. First parameter is the context or body of your message, and the second is a String with the name of the secret variable that should be present in your container, in our case, "payload-secret".

Gatekeeper will pull the secret from the corresponding file, Hash the body of your message and compare it yo the hashed message coming from the Hmac header. If the hashes match, then good to go.

### 4) Send request

Lets try to send a curl request to our OpenFaaS. You could use the invoke function of the CLI that does all of this out of the box, but just for demo purposes:

Let´s say we have the following JSON file that we want to send as body

sample.json

```
{
  "mykey": "myvalue",
  "foo":"bar"
}
```

Create a hashed version of your file using your secret key

```
openssl sha1 -hmac "<my-secret>" ./sample.json
```

You should see the following output:

```
HMAC-SHA1(./sample.json)= 3fe6dbbf63faafcf3a4e02b0ed365969493b960a
```

And 3fe6dbbf63faafcf3a4e02b0ed365969493b960a is your hashed message

Now that we have that, lets actually create the Curl

```
curl http://<my-server>:8080/function/<my-function> --data-binary @sample.json -H "Hmac: sha1=3fe6dbbf63faafcf3a4e02b0ed365969493b960a"
```

If everything went well, you should see

```
{
  status: "Success, your function is working!"
}
```

### 5) Enjoy!
