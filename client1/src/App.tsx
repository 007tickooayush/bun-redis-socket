// import { useEffect, useState } from 'react'
import { useCallback, useContext, useEffect, useState } from 'react'
import { SocketContext } from './context/socket'
import { UserContext, username } from './context/details';
import Details from './components/Details';

function App() {

	const [recGetUser, setRecGetUser] = useState('');
	// const [recId, setRecId] = useState('');
	const {socket} = useContext(SocketContext);

	const handleUserAdded = useCallback((data: any) =>{
		console.log('newAdded event::',data);
	},[socket]);


	const handleSentUser = useCallback((data:any) => {
		console.log('sentUser event::',data)
		alert(`Got user socket: ${data.socket}`)
	},
	[socket]);
	
	const handleGetUser = useCallback((userRec:any) => {
		socket.emit('getUser',{id: userRec})
	},[socket]);
		
	useEffect(()=>{
		// setUsername(generateUsername());
		socket.emit('addNew',{id: username});

		socket.on('newAdded',handleUserAdded);
		socket.on('sentUser',handleSentUser);

		return () =>{
			socket.off('newAdded',handleUserAdded);
			socket.off('sentUser',handleSentUser);
		};
	},[socket])

	return (
		<UserContext.Provider value={{username}}>
			<div >
				<h1>App Component</h1>
				<h2>username:</h2>
				<h2>{username}</h2>

				<div>
					<h3>enter message</h3>
					<input placeholder='enter message'/>
					<button type='button'>send</button>
				</div>

				<div>
					<h3>get user</h3>
					<input placeholder='receiver userame' onChange={(e) => setRecGetUser(e.target.value)}/>
					<button type='button' onClick={() => handleGetUser(recGetUser)}>get user</button>
				</div>

				<Details />
			</div>
		</UserContext.Provider>

	)
}

export default App