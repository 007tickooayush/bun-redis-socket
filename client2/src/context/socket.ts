import React from 'react';
import { connect } from 'socket.io-client'

const SOCKET_URL = 'http://localhost:3009'; // server2 connection

export const socket = connect(SOCKET_URL);
export const SocketContext = React.createContext({socket});