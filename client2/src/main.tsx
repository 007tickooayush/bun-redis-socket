// import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import { SocketContext, socket } from './context/socket.ts'
import { ChakraProvider, extendTheme } from '@chakra-ui/react'
import { UserContext, username } from './context/details';
const theme = extendTheme({
	config: {
		useSystemColorMode: false,
		initialColorMode: "dark",
	},
});
ReactDOM.createRoot(document.getElementById('root')!).render(
	<SocketContext.Provider value={{ socket }}>
		<UserContext.Provider value={{username}}>
			<ChakraProvider theme={theme}>
				<App />
			</ChakraProvider>
		</UserContext.Provider>
	</SocketContext.Provider>
	,
)
