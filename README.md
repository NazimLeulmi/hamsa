 # User Registration

## User Model

```javascript
{
    username:"string",
    password:"string", // bcrypt hash based on Blowfish
    publicKey:"string",// PEM-Base64 (4096 bits - 512 bytes)
    session:"objectId", // reference to the session model (holds the token)
    avatar:{uri:"string(base64)" , name?:"string"},
    rooms:["objectId"], // array of references  ( Id ==Refs=> Room )
    requests:[{roomName:"string",leader:"string"}] , // leader ==Invites-> user
    createdAt:"date & time stamp at model creation"
    
}
```



## Events

1. Client `socket.emit("validateRegister",{username,password,passwordc});`
   * Client sends registration form data to the server to get validated
2. Server `socket.on("validateRegister",formData => {})`
   * Server  form validation function `validateInputs()`
     * **If** the form is **invalid** , emit the errors to the client & return
   * Query DB for a user by username
     * **If** the user  exists emit  the error to the client & return
   * Server `socket.to(socket.id).emit("validatedInput",username)`
3. Client `socket.on("validatedInput",username=>{})`
   * Generate an `RSA` key pair on the client `{username,public_key,private_key}`
   * Get the keys array from persistent storage
     * **If** the keys array exists , push the new key pair to the array
     * **else** assign a new array with the newly created key pair inside it
   * Store / Save the new keys array on the client's persistent storage
   * Client `socket.emit("register",{username,password,publicKey})`
4. Server `socket.on("register",{username,password,publicKey})`
   * Generate a salt to hash the password
   * Hash the password using *Bcrypt* hashing function
   * Create a new User Model
   * Server `socket.to(socket.id).emit("registered");`
5. Client `socket.on("registered")` navigate to the **Login** component

---

# User Login

## Session Model

```javascript
// the session expires in 1 day / 24 hours
{
    token:"string(hex)", // 32 bytes - 256 bits Authentication token
    user:"objectId", // reference to the user
    createdAt:"time / date stamp + expiry date"
}
```

## Events 

1. Client `socket.emit("loginRequest",{username,password})`
   * Client sends login form data on form submission
2. Server `socket.on("loginRequest",loginData => {})`
   * Server form validation function
     * if the inputs are invalid , emit the errors and return
   * Query MongoDB to find a user  by username
     * if the user doesn't exist , emit the error and return
   * Compare the hash in the database with the supplied password
     * if the password doesn't match the hash , emit the error and return
   * Generate a token `32 bytes / 256 bits`  
   * Create a new session model with the newly generated token
   * `socket.to(socket.id).emit("token",{token,publicKey,avatar,username})`
     * The user is authenticated ===> check if the user has a valid `RSA` key pair

3. Client `socket.on("token",{token,publicKey,avatar,username})`

   * Store the token in the client's persistent storage
   * `keyValidation = (username,publicKey,avatar,token)=>{}`

   * Get the key pairs array from persistent storage

     * **If ** the key pairs array **doesn't**  exist
       * Generate a new `RSA` key pair
       * Assign a new array with the newly generated key pair inside it
       * Set React's state `setState({keyPair})`
       * Store the new array in the persistent client storage
       * `socket.emit("assignKey",{token,username,publicKey})`

   * The key pairs array exist , find the user's key pair in the array

     * `if(keyPair.username == username && keyPair.public_key == publicKey)`
       * The client has a valid key pair & the user is authenticated
       * **If** the user has an avatar redirect to the rooms component 
         * **else** redirect to the profile component
     * `if(keyPair.username === username)`
       * The client has an invalid key pair
       * Generate a new `RSA` key pair & replace it with the invalid key pair
       * Set React's state `setState({keyPair})`
       * Store the new key pairs array in the persistent client storage
       * `socket.emit("assignKey",{token,username,publicKey})`

     * **If** the key pair doesn't exist in the array
       * Generate a new `RSA` key pair
       * Push the new key pair in the key pairs array
       * Set React's state
       * Store the new key pairs array in the persistent client storage
       * `socket.emit("assignKey",{token,username,publicKey})`

4. Server `socket.on("assignKey",{username,token,publicKey}=>{})`

   *  DB query to find a session model by token `Session.findOne({token})`
     * If the session doesn't exist , the user is not authenticated
   * DB query to find a user model by id `Usr.findById(session.user)`
   * Change the user's public key ,**mutate** the user's model
   * Save the user's model 
   *  `socket.to(socket.id).emit("keyPairAssigned",{token,username,avatar})`

5. Client `socket.on("keyPairAssigned",{avatar,username,token})`
   * **if** the user has an avatar ,  navigate to the rooms component
   * **else** the user doesn't have an avatar , navigate to the profile component

# Room Creation

## Room Model

```javascript
{
    name:"string",
    leader:"string",
    users:["objectId"], // array of references
    requests:["objectId"], // User ==Requests=> Leader to join this room
    chat:[{
        iv:"string(hex)", // Initialization factor for AES encryption
        msg:"string(hex)", // cipher text AES256-CBC/~/PKCS7 padding
        from:"string", // message sender
        to: [{
            publicKey:"string(PEM)", // RSA 4096 bits public key
            username:"string",
            key:"string(base64)",//AES256-Key encrypted with the user's pubkey
        }],
        isImage:"boolean",
        createdAt:"time & date stamp for every message"
    }],
    createdAt:"time & date stamp at room creation"
}
```

## Events

1. Client `PopForm` component emits room creation form data to the server
   * `socket.emit("createRoom",{token,name})` 

2. Server `socket.on("createRoom",formData => {})`

   * Room creation form  validation
     * **If** the form data is invalid emit the errors to the client

   *  MongoDB query to find a session model by the supplied token
     * **If** the session doesn't exist , the user isn't authenticated 
   * MongoDB query to find a user by Id
     * **If** the user doesn't exist , the user isn't authenticated
   * MongoDB query to find a room by the supplied room name
     * **If** the room name is taken, send an error to the client
   * Create a new room model & add it to the user model
   * Save MongoDB models
   * Server `socket.to(socket.id).emit("roomCreated",room)`

3. Client `socket.on("roomCreated",room)`

   * Set React's state