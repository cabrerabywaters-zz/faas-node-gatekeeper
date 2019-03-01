const fs = require("fs");
const crypto = require("crypto");

const GateKeeper = (() => {
  /**
   * Removes 'sha1=' from hash string
   * @param {String} hash
   */
  const getHashedMessage = () => {
    let hash = process.env.Http_Hmac;

    if (!hash) {
      throw new Error(
        "We could not get the HASH from your message. Did you sign it? (--sign)"
      );
    }

    if (hash.includes("sha1=")) {
      hash = hash.replace("sha1=", "");
    }
    return hash;
  };

  /**
   * Pulls the secret code from the file, assuming
   * you are running an OpenFaaS container
   *
   * @param {String} secretName Name of the stored secret
   *                            variable
   */
  const getSecret = async secretName => {
    const path = `/var/openfaas/secrets/${secretName}`;

    return new Promise((resolve, reject) => {
      fs.readFile(path, "utf8", (err, data) => {
        if (err) {
          throw new Error(`We could not get the secret from: ${path}`);
        }
        resolve(data);
      });
    });
  };

  /**
   * Verifies that the message was hashed with
   * the proper shared key
   *
   * @param {String} hashedMessage
   * @param {String} sharedSecret
   * @param {String} message
   */
  const verify = (hashedMessage, sharedSecret, message) => {
    const expectedHash = crypto
      .createHmac("sha1", sharedSecret)
      .update(message)
      .digest("hex");

    return hashedMessage === expectedHash;
  };

  /**
   *  Pulls the Hash and Secret assuming you are
   *  running the function with OpenFaaS,
   *  and verifies the message
   *
   * @param {String} message Original message, without hashing
   * @param {String} secret Name of the secret to  generate
   *                        the Hash
   */
  const validate = async (message, secret) => {
    const hashedMessage = getHashedMessage();
    const sharedSecret = await getSecret(secret);
    return verify(hashedMessage, sharedSecret, message);
  };

  return Object.freeze({
    validate,
    verify
  });
})();

module.exports = GateKeeper;
