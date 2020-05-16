import React, { createContext, useState, useEffect } from "react";
import IO from "socket.io-client";

export const SocketContext = createContext(null);

function SocketContextProvider({ children }) {
  const [socket, setSocket] = useState(null)
  useEffect(function () {
    const connection = IO("http://192.168.1.87:3001");
    setSocket(connection);
    console.log("Conntected from the context")
    const abort = new AbortController();
  }, [])
  return (
    <SocketContext.Provider value={[socket, setSocket]}>
      {children}
    </SocketContext.Provider>
  )
}
export default SocketContextProvider;