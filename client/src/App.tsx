// import { useEffect, useState } from 'react'
import { SocketContext, socket } from './context/socket'


function App() {

	return (
		<SocketContext.Provider value={{socket}}>
			<div >
				<h1>App Component</h1>
			</div>
		</SocketContext.Provider>
	)
}

export default App