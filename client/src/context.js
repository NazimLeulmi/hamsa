import React, { createContext, useState, useEffect } from "react";
import IO from "socket.io-client";

export const SocketContext = createContext(null);

function SocketContextProvider({ children }) {
  const [socket, setSocket] = useState(null)
  const [auth, setAuth] = useState(false);
  const [route, setRoute] = useState('rooms');

  useEffect(function () {
    const connection = IO("http://192.168.1.84:3001");
    setSocket(connection);
    console.log("Conntected from the context")
  }, [])
  return (
    <SocketContext.Provider value={[socket, setSocket, auth, setAuth, route, setRoute]}>
      {children}
    </SocketContext.Provider>
  )
}
export default SocketContextProvider;